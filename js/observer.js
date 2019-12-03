// 1. Observer监听器（观察者）：用来劫持并监听所有属性，如果有变动，就通知订阅者。
function observe(data) {
	if (!data || typeof data !== 'object') {
		return;
	}

	Object.keys(data).forEach(key => {
		defineReactive(data, key, data[key])
	})
}

function Dep() {
	this.subs = [];
}

// 监听所有属性
function defineReactive(data, key, val) {
	// 递归遍历子属性
	observe(val);
	let dep = new Dep();

	Object.defineProperty(data, key, {
		enumerable: true,
		configurable: true,
		get: function() {
			// 取值判断是否需要添加订阅者
			if (Dep.target) {
				dep.addSub(Dep.target);
			}
			return val;
		},
		set: function(newVal) {
			val = newVal;

			// 如果数据变化，通知所有订阅者
			dep.notify();
			console.log(`属性${key}已经被监听了，现在值为：${newVal}`);
		}
	})
}
Dep.target = null;

Dep.prototype = {
	addSub: function(sub) {
		this.subs.push(sub);
	},
	notify: function() {
		this.subs.forEach(sub => {
			sub.update();
		})
	}
}