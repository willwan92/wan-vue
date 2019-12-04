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
			}

			// 如果还有子节点，继续递归遍历子节点
			if (node.childNodes && node.childNodes.length) {
				self.compileElement(node);
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
	isTextNode: function(node) {
		return node.nodeType === 3;
	}
}








