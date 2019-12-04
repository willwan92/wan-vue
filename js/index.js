// 实现思路
// 1. Observer监听器（观察者）：用来劫持并监听所有属性，如果有变动的，就通知订阅者。
// 2. Watcher 订阅者：接收收属性的变化通知并执行相应的函数，从而更新视图
// 3. Compile解析器：可以扫描和解析每个节点的相关指令，并根据初始化模板数据以及初始化相应的订阅器。

function WanVue (options) {
	var self = this;
	this.vm = this;
	this.data = options.data;
	this.methods = options.methods;

	// 给data的所有属性添加代理，可以通过，实现 this.xxx 访问 this.data.xxx
	Object.keys(this.data).forEach(function(key) {
			self.proxyKeys(key);
	});

	// 为data数据添加observer
	observe(this.data);

	// 编译html模版，包括初始化数据视图和实现数据双向绑定
	new Compile(options.el, this.vm);

	// 执行 mounted 生命周期钩子函数
	options.mounted.call(this);

	// // 初始化模板数据的值
	// el.innerHTML = this.data[exp];  
	// new Watcher(this, exp, function (value) {
	// 		el.innerHTML = value;
	// });
	
	return this;
}

WanVue.prototype = {
	proxyKeys: function(key) {
		var self = this;
		Object.defineProperty(this, key, {
			enumerable: false,
			configurable: true,
			get: function proxyGetter() {
				return self.data[key];
			},
			set: function proxySetter(newVal) {
				self.data[key] = newVal;
			}
		})
	}
}