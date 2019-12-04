// 实现思路
// 1. Observer监听器（观察者）：用来劫持并监听所有属性，如果有变动的，就通知订阅者。
// 2. Watcher 订阅者：接收收属性的变化通知并执行相应的函数，从而更新视图
// 3. Compile解析器：可以扫描和解析每个节点的相关指令，并根据初始化模板数据以及初始化相应的订阅器。

function WanVue (options) {
	var self = this;
	this.vm = this;
	this.data = options.data;

	Object.keys(this.data).forEach(function(key) {
			self.proxyKeys(key);
	});

	observe(this.data);
	new Compile(options.el, this.vm);

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