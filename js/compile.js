// 3. Compile解析器：可以扫描和解析每个节点的相关指令，
// 并初始化模板数据以及初始化相应的订阅器。
// 3-1. 解析模板指令，并替换模板数据，初始化视图
// 3-2. 将模板指令对应的节点绑定对应的更新函数，初始化相应的订阅器
function Compile(el, vm) {
	this.vm = vm;
	this.el = document.querySelector(el);
	this.fragment = null;
	this.init();
}

Compile.prototype = {
	init: function() {
		if (this.el) {
			this.fragment = this.nodeToFragment(this.el);
			this.compileElement(this.fragment);
			this.el.appendChild(this.fragment);
		} else {
			console.log('Dom元素不存在');
		}
	},
	nodeToFragment: function (el) {
		// 创建虚拟的节点对象，可以更安全地改变文档的结构及节点。
		let fragment = document.createDocumentFragment();
		let child = el.firstChild;

		while(child) {
			//说明： 当前子节点被 append 到 fragment ，el中的该子节点不是被复制过去，而是被移动过去。
			fragment.append(child);
			child = el.firstChild;
		}

		return fragment;
	},
	compileElement: function (el) {
		let childNodes = el.childNodes;
		let self = this;

		// *、+ 限定符都是贪婪的，它们会尽可能多的匹配文字，在它们的后面加上一个?就可以实现非贪婪或最小匹配。
		// 这个正则表达式只能匹配第一个 {{}} 表达式，只是实现最简单的功能
		let reg = /\{\{\s*(.*?)\s*\}\}/;


		// [].slice.call(childNodes) 返回由childNodes转换成的数组，childNodes是类数组；
		[].slice.call(childNodes).forEach(function(node) {
			let text = node.textContent;

			// 判断是否是符合{{}}这种形式的文本
			if (self.isTextNode(node) && reg.test(text)) {
				// reg.exec(text)[1] 返回{{}}包裹的文本
				self.compileText(node, reg.exec(text)[1]);
			} else if (self.isElementNode(node)) {
				self.compile(node);
			}

			// 如果还有子节点，继续递归遍历子节点
			if (node.childNodes && node.childNodes.length) {
				self.compileElement(node);
			}
		})
	},
	/**
	 * 编译元素节点
	 * @param {*} node 
	 */
	compile: function(node) {
		let self = this;
		let nodeAttrs = node.attributes;

		// 遍历所有属性
		Array.prototype.forEach.call(nodeAttrs, function(attr) {
			let attrName = attr.name;

			if (self.isDirective(attrName)) {
				let dir = attrName.substring(2);
				let exp = attr.value;

				if (self.isEventDirective(dir)) {
					self.compileEvent(node, dir, exp);
				} else {
					self.compileModel(node, dir, exp);
				}

				// 编译完之后，移除指令属性
				node.removeAttribute(attrName);
			}
		})
	},
	compileEvent: function(node, dir, exp) {
		let eventType = dir.split(':')[1];
		let vm = this.vm;
		let cb = vm.methods && vm.methods[exp];

		if (eventType && cb) {
			// 给节点绑定事件回调，cb.bind(vm) 把当前 vue 实例绑定为事件回调函数的this
			node.addEventListener(eventType, cb.bind(vm), false)
		}
	},
	compileModel(node, dir, exp) {
		let vm = this.vm;
		let self = this;
		let value = vm[exp];

		// 1. 初始化数据显示
		self.updateModel(node, value);
		
		// 2. 添加数据监听器
		new Watcher(vm, exp, function(node, value) {
			self.updateModel(node, value);
		})

		// 3 添加事件绑定，更新数据
		node.addEventListener('input', function(e){
			let newVal = e.target.value;

			if (newVal !== value) {
				vm[exp] = node.value;

				// 更新value
				value = newVal;
			}
		})
	},
	compileText: function (node, exp) {
		let self = this;
		let initText = this.vm[exp];

		// 初始化视图
		self.updateText(node, initText);

		// 生成订阅者，并绑定更新视图函数
		new Watcher(this.vm, exp, function(value) {
			self.updateText(node, value);
		})
	},
	updateText: function (node, value) {
		node.textContent = typeof value === 'undefined' ? '' : value;
	},

	/**
	 * 更新 v-model 绑定的数据视图
	 * @param {*} node 
	 * @param {*} value 
	 */
	updateModel: function(node, value) {
		node.value = typeof value == 'undefined' ? '' : value;
	},
	isElementNode: function(node) {
		return node.nodeType === 1;
	},
	isDirective: function(attr) {
		return attr.indexOf('v-') === 0;
	},
	isEventDirective: function(attr) {
		return attr.indexOf('on:') === 0;
	},
	isTextNode: function(node) {
		return node.nodeType === 3;
	}
}








