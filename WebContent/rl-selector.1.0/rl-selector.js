/**
 * 功能描述：左右选择框,当选择发生变化时可同时向服务器发送POST请求<br>
 * POST请求时有两个参数：<br>
 * 1).action: d-delete/i-insert,分别代表删除和插入数据. <br>
 * 2).data: 一个包括列表value值的数组字符串.
 * 
 * @param{String} asynUrl 异步数据请求URL
 * @param{String} element 控件容器div id属性
 * @param{Object} ld 左侧列表数据
 * @param{Object} rd 右侧列表数据
 * @param{Boolean} lockLeft 锁定左侧数据,锁定后左侧数据将保持不变
 * @param{String} 左侧标题,默认为"待选列表"
 * @param{String} 右侧标题,默认为"已选列表"
 */
function rlSelector(asynUrl, element, ld, rd, lTitle, rTitle, lockLeft) {
	var _asynUrl = asynUrl || '/';
	var _selector = {};
	var _left = {};
	var _right = {};
	var selector = {};

	selector = {
		_version : '1.0',
		/**
		 * 更新数据
		 * 
		 * @prarm{String} action d-删除/i-增加
		 * @parma{Array} data 更新数据[k1,k2,k3,...]
		 */
		asynUpdate : function(action, data) {
			data = JSON.stringify(data);
			$.post(_asynUrl, {
				action : action,
				data : data
			}, function(data, textStatus) {
				// TODO 更新成功后在这里处理
			}, 'json');
		},
		/**
		 * 初始化左边选择分类列表
		 * 
		 * @param{Array} items 名称数组['xx','yy']
		 */
		initLeftItems : function(items) {
			_left = _selector.find('.rl-select-l');
			if (!lockLeft && rd) {
				items = selector.filter(items, rd);
			}
			selector._initItems(_left, items);
			_left.bind('dblclick', function() {
				selector._l2r();
			});
			return this;
		},
		/**
		 * 初始化右边列表
		 * 
		 * @param{Array} items 名称数组['xx','yy']
		 */
		initRightItems : function(items) {
			_right = _selector.find('.rl-select-r');
			selector._initItems(_right, items);
			_right.bind('dblclick', function() {
				selector._r2l();
			});
			return this;
		},
		/**
		 * 初始化列表
		 * 
		 * @param {$()}
		 *            container jQuery容器对象
		 * @param {Array}
		 *            items 初始化列表
		 */
		_initItems : function(container, items) {
			container.find('option').empty();
			for ( var k in items) {
				container.append('<option value="' + k + '">' + items[k]
						+ '</option>');
			}
			return this;
		},
		filter : function(items, rd) {
			for ( var r in rd) {
				delete items[r];
			}
			return items;
		},
		render : function() {
			ml = _selector.find('.move-l');
			mr = _selector.find('.move-r');
			ml.bind('click', function() {
				selector._r2l();
			});
			mr.bind('click', function() {
				selector._l2r();
			});
		},
		_l2r : function() {
			var opts = _left.find('option:selected');
			var data = [];
			if (lockLeft) {
				opts.each(function(e) {
					var rOpts = _right.find('option');
					var exist = false;
					var _this = $(this);
					rOpts.each(function(e) {
						if ($(this).val() == _this.val()) {
							exist = true;
							return;
						}
					});
					if (!exist) {
						_right.append('<option value="' + $(this).val() + '">'
								+ $(this).text() + '</option>');
						data.push($(this).val());
					}
				});
			} else {
				_right.append(opts);
			}
			if (data.length) {
				selector.asynUpdate('i', data);
			}
		},
		_r2l : function() {
			var opts = _right.find('option:selected');
			if (lockLeft) {
				opts.remove();
			} else {
				_left.append(opts);
			}
			var data = [];
			opts.each(function(e) {
				data.push($(this).val());
			});
			selector.asynUpdate('d', data);
		}
	};

	(function() {
		if (!$('#' + element).length) {
			return false;
		}
		_selector = $('#' + element);
		if (!ld) {
			ld = [];
		}
		if (!rd) {
			rd = [];
		}
		_lbl_l = lTitle || '待选列表';
		_lbl_r = rTitle || '已选列表';
		_selector
				.addClass('rl-select')
				.html(
						[
								'<select multiple class="rl-select-l rl-selector-container-l"><optgroup label="',
								_lbl_l,
								'"></optgroup></select><a href="javascript:;" class="move-l">&laquo;左移</a>&nbsp;&nbsp;<a href="javascript:;" class="move-r">右移&raquo;</a><select class="rl-select-r rl-selector-container-r" multiple><optgroup label="',
								_lbl_r, '"></optgroup></select>' ].join(''));
		selector.initLeftItems(ld).initRightItems(rd).render();
	})();
}