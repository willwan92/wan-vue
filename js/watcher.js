/**
 * Watcher 订阅者：接收收属性的变化通知并执行相应的函数，从而更新视图
 * @param { Object } vm vue实例
 * @param { String } exp data的属性名
 * @param { Function } cb 更新视图的回调函数
 */
function Watcher(vm, exp, cb) {
	// 更新视图的回调函数
	this.cb = cb;
	// vue实例
	this.vm = vm;
	// 要监控的数据
	this.exp = exp;
	// 实例化Watch时，获取当前值
	// 此时会执行Observer中的get函数，把当前订阅者添加到订阅器中，实现依赖收集
	this.value = this.get();
}

Watcher.prototype = {
	update: function() {
		this.run();
	},
	run: function() {
		let value = this.vm.data[this.exp];
		let oldVal = this.value;

		if (value !== oldVal) {
			this.value = value;
			this.cb.call(this.vm, value);
		}
	},
	get: function() {
		// 在Dep上缓存自己(当前watcher实例）
		Dep.target = this;

		let value = this.vm.data[this.exp];
		// 释放自己
		Dep.target = null;
		return value;
	}
}