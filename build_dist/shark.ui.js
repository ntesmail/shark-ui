/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(5);


/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * @author sweetyx
	 * 提供一些公共的核心方法
	 */
	if (typeof $ === 'undefined' || typeof jQuery === 'undefined') {
	    throw new Error('Shark UI requires jQuery');
	}

	var $win = $(window);

	var registerCloseArray = [];
	var isCloseRegister = false;

	function dispatchHandler(evt) {
	    for (var i = 0; i < registerCloseArray.length; i++) {
	        var key = registerCloseArray[i].key;
	        var elems = registerCloseArray[i].elems;
	        if ($('#' + key).length == 0) {
	            removeCloseListener(key);
	        } else {
	            var isClickNoHideArea = false;
	            for (var j = 0; j < elems.length; j++) {
	                var item = elems[j];
	                if (item[0] == evt.target || item.find(evt.target).length > 0) {
	                    //console.log('点击了不需要隐藏的区域',item);
	                    isClickNoHideArea = true;
	                    break;
	                }
	            }
	            if (isClickNoHideArea === false && typeof registerCloseArray[i].cb === 'function') {
	                registerCloseArray[i].cb.call(evt);
	            }
	        }
	    }
	}
	/**
	 * [注册组件在body上click时的关闭事件]
	 * @param {[type]} key   [组件的id]
	 * @param {[type]} elems [点击哪些元素时，不关闭组件]
	 */
	var addCloseListener = function(key, elems, cb) {
	    if (!isCloseRegister) {
	        isCloseRegister = true;
	        $(document).on('mousedown.sharkcore', dispatchHandler);
	    }
	    registerCloseArray.push({
	        key: key,
	        elems: elems,
	        cb: cb
	    });
	};
	var removeCloseListener = function(key) {
	    for (var i = 0; i < registerCloseArray.length; i++) {
	        if (key === registerCloseArray[i].key) {
	            registerCloseArray.splice(i, 1);
	            break;
	        }
	    }
	    if (registerCloseArray.length === 0) {
	        isCloseRegister = false;
	        $(document).off('mousedown.sharkcore', dispatchHandler);
	    }
	};
	var preventAndStopEvent = function(evt) {
	    evt.preventDefault();
	    evt.stopPropagation();
	};
	var calcOffset = function(target, elem, direction, fixOption) {
	    //根据绑定的目标元素和展示方向计算位置
	    var fixWidth = fixOption ? (fixOption.width || 0) : 0;
	    var fixHeight = fixOption ? (fixOption.height || 0) : 0;
	    var offset = target.offset();
	    var width = target.outerWidth();
	    var height = target.outerHeight();
	    var left, top;
	    if (direction === 'bottom') {
	        top = offset.top + height + fixHeight;
	        left = offset.left;
	    } else if (direction === 'top') {
	        top = offset.top - elem.outerHeight() - fixHeight;
	        left = offset.left;
	        if (top < 0) {
	            //若target上侧的偏移量<浮层高度，说明上侧空间不够，改为显示在底侧
	            var res = this.calcOffset(target, elem, 'bottom');
	            res.originDirection = direction;
	            return res;
	        }
	    } else if (direction === 'right') {
	        top = offset.top;
	        left = offset.left + width + fixWidth;
	    } else if (direction === 'left') {
	        top = offset.top;
	        left = offset.left - elem.outerWidth() - fixWidth;
	        if (left < 0) {
	            //若target左侧的偏移量<浮层宽度，说明左侧空间不够，改为显示在右侧
	            var res = this.calcOffset(target, elem, 'right');
	            res.originDirection = direction;
	            return res;
	        }
	    }
	    return {
	        originDirection: direction,
	        actualDirection: direction,
	        left: left,
	        top: top
	    };
	};
	var createUUID = (function() {
	    var uuidRegEx = /[xy]/g;
	    var uuidReplacer = function(c) {
	        var r = Math.random() * 16 | 0,
	            v = c == 'x' ? r : (r & 3 | 8);
	        return v.toString(16);
	    };
	    return function() {
	        return 'uuid-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(uuidRegEx, uuidReplacer).toUpperCase();
	    };
	})();
	var extend = function(o1, o2) {
	    if ($.isPlainObject(o1) && $.isPlainObject(o2)) {
	        var temp = $.extend(true, {}, o2);
	        return $.extend(o1, temp);
	    } else {
	        return o1;
	    }
	}
	var isEmpty = function(val) {
	    if (typeof val === 'undefined' || val === null || val === '') {
	        return true;
	    } else {
	        return false;
	    }
	};
	var testNum = function(val) {
	    return /^[0-9]{0,}$/.test(val);
	};
	var throttle = function(func, wait, maxtime) {
	    var timer = null;
	    var args;
	    var context;
	    var lastTime = Date.now();
	    return function() {
	        context = this;
	        args = arguments;
	        if (!wait) {
	            func.apply(context, args);
	        } else {
	            var curTime = Date.now();
	            clearTimeout(timer);
	            if (curTime - lastTime >= maxtime) {
	                lastTime = curTime;
	                func.apply(context, args);
	            } else {
	                timer = setTimeout(function() {
	                    func.apply(context, args);
	                }, wait);
	            }
	        }
	    }
	};
	var debounce = function(func, wait, immediate) {
	    var timeout;
	    var args;
	    var context;
	    var timestamp;
	    var count = 0;
	    var later = function() {
	        // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
	        var last = Date.now() - timestamp;
	        if (last < wait && last >= 0) {
	            ++count;
	            timeout = setTimeout(later, wait - last);
	        } else {
	            timeout = null;
	            if (count > 0 || !immediate) {
	                count = 0;
	                func.apply(context, args);
	                if (!timeout) context = args = null;
	            }
	        }
	    };
	    return function() {
	        context = this;
	        args = arguments;
	        if (!wait) {
	            func.apply(context, args);
	        } else {
	            timestamp = Date.now();
	            // 第一次调用该方法时，且immediate为true，则调用func函数
	            var callNow = immediate && !timeout;
	            // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
	            if (!timeout) timeout = setTimeout(later, wait);
	            if (callNow) {
	                func.apply(context, args);
	                context = args = null;
	            }
	        }
	    };
	};

	var UI = {
	    $win: $win,
	    addCloseListener: addCloseListener,
	    removeCloseListener: removeCloseListener,
	    preventAndStopEvent: preventAndStopEvent,
	    calcOffset: calcOffset,
	    extend: extend,
	    createUUID: createUUID,
	    isEmpty: isEmpty,
	    testNum: testNum,
	    throttle: throttle,
	    debounce: debounce
	};
	module.exports = UI


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * 提供操作组件的一些公共方法
	 */
	var UI = __webpack_require__(1);
	/**
	 * 初始化组件对象的公共函数，设置公共组件的一些公共方法，
	 * @param {component} 组件对象
	 * @param {object} 配置项
	 */
	function addComponentBaseFn(sharkComponent, config) {
	    sharkComponent.getConfig = function() {
	        return config;
	    };
	    sharkComponent.disable = function() {
	        sharkComponent.disabled = true;
	        sharkComponent.component && sharkComponent.component.addClass('disabled').attr('disabled', true).find('input,select,button').attr('disabled', true);
	        if (typeof config.onDisable === 'function') {
	            config.onDisable.call(sharkComponent);
	        }
	    };
	    sharkComponent.enable = function() {
	        delete sharkComponent.disabled;
	        sharkComponent.component && sharkComponent.component.removeClass('disabled').attr('disabled', false).find('input,select,button').attr('disabled', false);
	        if (typeof config.onEnable === 'function') {
	            config.onEnable.call(sharkComponent);
	        }
	    };
	    return sharkComponent;
	}
	/**
	 * 绑定组件对象前的过滤函数，用来阻止某些状态下不应该触发的事件。
	 * @param  {component} 组件对象
	 * @param  {Function} 实际绑定事件的函数
	 * @return {Function}
	 */
	function filterComponentAction(sharkComponent, fn) {
	    return function(evt) {
	        if (sharkComponent.disabled === true || (sharkComponent.component && sharkComponent.component.hasClass('disabled'))) {
	            return;
	        }
	        fn.apply(this, arguments);
	    };
	}
	var BaseComponent = {
	    addComponentBaseFn: addComponentBaseFn,
	    filterComponentAction: filterComponentAction
	};
	module.exports = BaseComponent;


/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * @author sweetyx
	 * 组件基础模板
	 */
	var autocomplete = '\
	    <input class="shark-autocomplete" type="text" />\
	';
	var fileupload = '\
	    <button class="shark-fileupload">上传文件</button>\
	';
	var listgroup = '\
	    <ul class="shark-list-group list-group position-absolute" style="display: none;"></ul>\
	';
	var popover = '\
	    <div class="shark-popover popover" style="display: none;">\
	        <div class="arrow"></div>\
	        <% if(this.title){ %>\
	        <div class="popover-title"><%= this.title %></div>\
	        <% } %> \
	        <% if(this.content){ %>\
	            <div class="popover-content"><%= this.content %></div>\
	        <% } %> \
	    </div>\
	';
	var selecter = '\
	    <div class="shark-selecter position-relative">\
	        <a class="selecter">\
	            <span class="value"></span>\
	            <span class="caret"></span>\
	        </a>\
	    </div>\
	';
	var dropdown = '\
	    <div class="shark-dropdown">\
	        <button class="btn btn-default dropdown">\
	            <%= this.text %>\
	            <span class="caret"></span>\
	        </button >\
	    </div>\
	';
	var pager = '\
	    <ul class="shark-pager pagination"></ul>\
	';
	var tree = '\
	    <ul class="<% if(this.isRoot){ %>shark-tree<% } %> tree-open">\
	        <%\
	            for(var i=0; i < this.nodes.length; i++){\
	                var node = this.nodes[i];\
	        %>\
	            <li>\
	                <label class="tree-group" tree-group-id="<%= node.node_id %>" tree-group-level="<%= node.level %>" style="padding-left: <% if(node.children && node.children.length>0) { %> <%= this.basePl + this.baseIconWidth %> <% } else{ %> <%= this.basePl + this.baseIconWidth*2 %> <% } %>px;">\
	                    <% if(node.children && node.children.length>0) { %>\
	                        <a class="tree-icon tree-icon-right"></a>\
	                    <% } %> \
	                    <% if(this.checkable) { %>\
	                        <% if(this.checked) { %>\
	                            <a class="tree-icon tree-icon-check"></a>\
	                        <% } %>\
	                        <% else{ %>\
	                            <a class="tree-icon tree-icon-check-empty"></a>\
	                        <% } %>\
	                    <% } %>\
	                    <span class="tree-node-name"><%= node.node_name %></span>\
	                </label>\
	            </li>\
	        <% } %>\
	    </ul>\
	';
	var tabs = '\
	    <div class="shark-tabs">\
		    <ul class="nav nav-tabs">\
	            <%\
	                for(var i=0; i < this.tabs.length; i++){\
	                    var tab = this.tabs[i];\
	            %>\
	                <% if(i === this.active) { %>\
	                    <li class="active">\
	                        <a href="javascript:void(0);"><%= tab.title %></a>\
	                    </li>\
	                <% } %> \
	                <% else{ %>\
	                    <li>\
	                        <a href="javascript:void(0);"><%= tab.title %></a>\
	                    </li>\
	                <% } %>\
	            <% } %>\
	        </ul>\
	        <div class="tab-content">\
	            <%\
	                for(var i=0; i < this.tabs.length; i++){\
	                    var tab = this.tabs[i];\
	            %>\
	                <% if(i === this.active) { %>\
	                    <div class="tab-pane active"><%= tab.pane %></div>\
	                <% } %> \
	                <% else{ %>\
	                    <div class="tab-pane"><%= tab.pane %></div>\
	                <% } %>\
	            <% } %>\
	        </div>\
	    </div>\
	';
	var modal = '\
	<div class="shark-modal modal <%= this.animate %>" style="display: none;">\
	    <div class="modal-dialog <% if(this.size) { %>modal-<%= this.size %><% }%>">\
	        <div class="modal-content">\
	            <%= this.content %>\
	        </div>\
	    </div>\
	</div>\
	';
	var confirm = '\
	<div class="modal-header">\
	    <button class="close js-cancel"> x</button >\
	    <h4 class="modal-title"><%= this.title %></h4>\
	</div>\
	<div class="modal-body">\
	    <%= this.content %>\
	</div>\
	<div class="modal-footer">\
	    <button type="button" class="btn btn-success js-ok"><%= this.okText %></button>\
	    <% if(this.cancelText) { %>\
	        <button type="button" class="btn btn-default js-cancel"><%= this.cancelText %></button>\
	    <% } %>\
	</div>\
	';
	var toastr = '\
	<div class="shark-toastr toastr toastr-<%= this.type %>">\
	    <div><%= this.content %></div>\
	</div>\
	';

	function tempAdd(line, isJs) {
	    if (/^\s*$/.test(line)) {
	        return '';
	    }
	    if (isJs) {
	        if (/^=/.test(line)) {
	            return 'r.push(' + line.substring(1) + ');\n';
	        } else {
	            return line + '\n';
	        }
	    } else {
	        return 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
	    }
	}

	function templateAoT(template) {
	    var reg = /<%((\s|.)*?)%>/g;
	    var code = 'var r=[];\n';
	    var cursor = 0;
	    var match;
	    while (match = reg.exec(template)) {
	        code = code + tempAdd(template.slice(cursor, match.index), false);
	        code = code + tempAdd(match[1], true);
	        cursor = match.index + match[0].length;
	    }
	    code = code + tempAdd(template.substr(cursor, template.length - cursor));
	    code = code + 'return r.join("");';
	    return new Function(code.replace(/[\r\t\n]/g, ''));
	}

	function template2html(template, data) {
	    return templateAoT(template).apply(data);
	}

	var Templates = {
	    autocomplete: autocomplete,
	    fileupload: fileupload,
	    listgroup: listgroup,
	    modal: modal,
	    confirm: confirm,
	    pager: pager,
	    popover: popover,
	    selecter: selecter,
	    dropdown: dropdown,
	    tree: tree,
	    tabs: tabs,
	    templateAoT: templateAoT,
	    template2html: template2html,
	    toastr: toastr
	};

	module.exports = Templates;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 列表组
	 */
	var UI = __webpack_require__(1);
	var Templates = __webpack_require__(3);
	var template = Templates.listgroup;
	var templateFun = Templates.templateAoT(template);
	//创建列表组
	function render(id) {
	    var ul = $(templateFun.apply());
	    ul.attr('id', id || UI.createUUID());
	    ul.destroy = function() {
	        ul.remove();
	    };
	    return ul;
	}
	//更新列表组
	function update(ul, data, actualKey, displayKey) {
	    ul.empty();
	    $.each(data, function(i, item) {
	        var li = $('<li class="list-group-item" value="' + item[actualKey] + '">' + item[displayKey] + '</li>');
	        li.data(item);
	        ul.append(li);
	    });
	    return ul;
	}

	var ListGroup = {
	    render: render,
	    update: update
	};
	module.exports = ListGroup;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(9);
	__webpack_require__(10);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	__webpack_require__(14);
	__webpack_require__(15);
	__webpack_require__(18);


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author asteryk
	 * @description 自动补全插件
	 */
	var UI = __webpack_require__(1);
	var Templates = __webpack_require__(3);
	var BaseComponent = __webpack_require__(2);
	var ListGroup = __webpack_require__(4);
	(function($) {
	    // selecter模板
	    var templateAutocomplete = Templates.autocomplete;
	    var templateAutocompleteFun = Templates.templateAoT(templateAutocomplete);
	    //键盘上功能键键值数组
	    var functionalKeyArray = [40, 38, 13, 27];
	    //更新autocomplete的下拉列表
	    function updateList(autoComplete, selections, config, list) {
	        selections = ListGroup.update(selections, list, '', config.displayKey);
	        if (selections.is(':hidden')) {
	            // 定位并显示
	            var inputWidth = autoComplete.outerWidth();
	            var postion = UI.calcOffset(autoComplete, selections, 'bottom');
	            var style = UI.extend({ width: inputWidth }, postion);
	            selections.css(style);
	            selections.show();
	        }
	    }
	    // 滚动到相应位置
	    function scrollHeight(autoComplete, selections, item, direction) {
	        var inputPosition = autoComplete.offset().top + autoComplete.height();
	        var selectPosition = item.offset().top - inputPosition + item.height();
	        var scrollTimes = Math.ceil(selections[0].scrollHeight / selections.height());
	        if (direction === 'down') {
	            if (selectPosition > selections.height()) {
	                selections.scrollTop(selections[0].scrollTop + item.height() * scrollTimes);
	            }
	        } else {
	            if (selectPosition < item.height()) { //向上不足一行高度就翻页
	                selections.scrollTop(selections[0].scrollTop - item.height() * scrollTimes);
	            }
	        }
	    }
	    // 按下功能键时的处理函数
	    function functionKeyUse(sharkComponent, keyCode, config) {
	        var autoComplete = sharkComponent.component;
	        var selections = sharkComponent.selections;
	        if (selections.is(':hidden')) {
	            return;
	        }
	        switch (keyCode) {
	            case 40: //向下键
	                var $current = selections.children('.active');
	                var $next;
	                if ($current.length <= 0) {
	                    //没有选中行时，选中第一行
	                    $next = selections.children('.list-group-item:first');
	                    selections.scrollTop(0);
	                } else {
	                    $next = $current.next();
	                }
	                selections.children('.list-group-item').removeClass('active');
	                if ($next.length > 0) {
	                    $next.addClass("active");
	                    if (config.autocomplete) {
	                        setValue(sharkComponent, $next, config);
	                    }
	                    scrollHeight(autoComplete, selections, $next, 'down');
	                }
	                break;
	            case 38: //向上键
	                var $current = selections.children('.active');
	                var $previous;
	                if ($current.length <= 0) {
	                    //没有选中行时，选中最后一行
	                    $previous = selections.children('.list-group-item:last');
	                    selections.scrollTop(selections[0].scrollHeight);
	                } else {
	                    $previous = $current.prev();
	                }
	                selections.children('.list-group-item').removeClass('active');
	                if ($previous.length > 0) {
	                    $previous.addClass("active");
	                    if (config.autocomplete) {
	                        setValue(sharkComponent, $previous, config);
	                    }
	                    scrollHeight(autoComplete, selections, $previous, 'up');
	                }
	                break;
	            case 13: //回车键
	                var $current = selections.children('.active');
	                if ($current.length > 0) {
	                    if (!config.autocomplete) {
	                        setValue(sharkComponent, $current, config);
	                    }
	                    selections.hide();
	                }
	                break;
	            case 27: //ESC键
	                selections.hide();
	                break;
	        }
	    }
	    // 设置autoComplete的值
	    function setValue(sharkComponent, item, config) {
	        var itemData = item.data();
	        sharkComponent.component.val(itemData[config.displayKey]);
	        sharkComponent.value = itemData;
	        if (typeof config.onSelected === 'function') {
	            config.onSelected.call(sharkComponent, item.data());
	        }
	    }
	    //初始化autocomplete的dom
	    function initDom(sharkComponent, config) {
	        if (this === $.fn) {
	            sharkComponent.createType = 'construct';
	            var fun = config.dom ? Templates.templateAoT(config.dom) : templateAutocompleteFun;
	            var html = fun.apply(config);
	            sharkComponent.component = $(html);
	        } else {
	            sharkComponent.createType = 'normal';
	            sharkComponent.component = this;
	        }
	        sharkComponent.component.addClass('shark-autocomplete');
	        initSelectionsDom(sharkComponent, config);
	        return sharkComponent;
	    }
	    // 初始化下拉列表的dom
	    function initSelectionsDom(sharkComponent, config) {
	        var selections = ListGroup.render();
	        selections.addClass('shark-autocomplete-list-group');
	        $(document.body).append(selections);
	        sharkComponent.selections = selections;
	        return sharkComponent;
	    }
	    // 初始化事件
	    function initEvents(sharkComponent, config) {
	        var autoComplete = sharkComponent.component;
	        var selections = sharkComponent.selections;
	        var lastMousePos = {
	            clientX: -1,
	            clientY: -1
	        };
	        //防止按上下键时，输入框中的光标左右移动
	        autoComplete.on('keydown.autocomplete', autoComplete, BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	            if ($.inArray(evt.keyCode, functionalKeyArray) > -1) {
	                UI.preventAndStopEvent(evt);
	            }
	        }));
	        autoComplete.on('keyup.autocomplete', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	            UI.preventAndStopEvent(evt);
	            var keyCode = evt.keyCode;
	            if ($.inArray(keyCode, functionalKeyArray) > -1) {
	                functionKeyUse(sharkComponent, keyCode, config);
	            } else if (document.documentMode === 9 && (keyCode === 8 || keyCode === 46)) {
	                //IE9的一个BUG：[按键BackSpace / 按键Delete / 鼠标拖拽 / 鼠标剪切 / 鼠标删除]，不会触发propertychange和input事件
	                //这里只处理了键盘BackSpace和Delete，鼠标的坑就暂时不管了。
	                autoComplete.trigger('input');
	            }
	        }));
	        // 输入框事件，适配IE8
	        autoComplete.on('input.autocomplete propertychange.autocomplete', BaseComponent.filterComponentAction(sharkComponent, UI.debounce(function() {
	            var value = autoComplete.val();
	            var result = config.filterData(value, config);
	            if (result && typeof result.then === 'function') {
	                result.then(function(list) {
	                    updateList(autoComplete, selections, config, list);
	                }, function() {});
	            } else {
	                updateList(autoComplete, selections, config, result);
	            }
	        }, config.debounceTime, true)));
	        // 鼠标事件
	        selections.on('mousemove', function(evt) {
	            var subPos = Math.sqrt(Math.pow(Math.abs(evt.clientX - lastMousePos.clientX), 2) + Math.pow(Math.abs(evt.clientY - lastMousePos.clientY), 2));
	            if (subPos >= 5) {
	                lastMousePos = {
	                    clientX: evt.clientX,
	                    clientY: evt.clientY
	                };
	                var selectionsRow = $(evt.target);
	                if (!selectionsRow.hasClass('active')) {
	                    selectionsRow.siblings().removeClass('active');
	                    selectionsRow.addClass('active');
	                    if (config.autocomplete) {
	                        setValue(sharkComponent, selectionsRow, config);
	                    }
	                }
	            }
	        });
	        // 点击事件
	        selections.on('mousedown', function(evt) {
	            UI.preventAndStopEvent(evt);
	            if (!selections.is(':hidden')) {
	                var selectionsRow = $(evt.target);
	                selectionsRow.siblings().removeClass('active');
	                selectionsRow.addClass('active');
	                if (!config.autocomplete) {
	                    setValue(sharkComponent, selectionsRow, config);
	                }
	                selections.hide();
	            }
	        });
	        // 输入框失焦点消失
	        UI.addCloseListener(selections.attr('id'), [autoComplete, selections], function() {
	            if (!selections.is(':hidden')) {
	                selections.hide();
	            }
	        });
	    }
	    $.fn.extend({
	        sharkAutoComplete: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                autocomplete: false,
	                displayKey: 'name',
	                filterData: null,
	                debounceTime: 300,
	                dom: '',
	                onSelected: function() {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            sharkComponent.value = null;
	            initDom.call(this, sharkComponent, config);
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            initEvents(sharkComponent, config);
	            // 获取当前autocomplete的值
	            sharkComponent.getValue = function() {
	                return sharkComponent.value;
	            };
	            // 销毁函数
	            sharkComponent.destroy = function() {
	                // 销毁listgroup
	                UI.removeCloseListener(sharkComponent.selections.attr('id'));
	                sharkComponent.selections.destroy();
	                // 销毁component
	                if (sharkComponent.createType === 'construct') {
	                    sharkComponent.component.remove();
	                } else {
	                    sharkComponent.component.off('input.autocomplete propertychange.autocomplete keyup.autocomplete keydown.autocomplete');
	                }
	                sharkComponent = null;
	            };
	            return sharkComponent;
	        }
	    });
	})(jQuery || $);


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx & lingqiao
	 * @description selecter插件和dropdown插件
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var Templates = __webpack_require__(3);
	var ListGroup = __webpack_require__(4);
	(function($) {
	    // dropdown模板
	    var templateDropdown = Templates.dropdown;
	    var templateDropdownFun = Templates.templateAoT(templateDropdown);
	    // 初始化dropdown的dom
	    function initDom(sharkComponent, config) {
	        if (this === $.fn) {
	            sharkComponent.createType = 'construct';
	            var fun = config.dom ? Templates.templateAoT(config.dom) : templateDropdownFun;
	            var html = fun.apply(config);
	            sharkComponent.component = $(html);
	        } else {
	            sharkComponent.createType = 'normal';
	            sharkComponent.component = this;
	        }
	        sharkComponent.component.addClass('shark-dropdown');
	        return sharkComponent;
	    }
	    // 初始化下拉列表的的dom
	    function initSelectionsDom(sharkComponent, config) {
	        var selections = ListGroup.render();
	        selections.addClass('shark-dropdown-list-group');
	        ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
	        sharkComponent.selections = selections;
	        $(document.body).append(selections);
	    }
	    // 初始化下拉列表事件
	    function initSelectionsEvents(sharkComponent, config) {
	        var dropdown = sharkComponent.component;
	        var selections = sharkComponent.selections;
	        selections.on('click', '.list-group-item', function(evt) {
	            var item = $(this);
	            if (typeof config.onSelected === 'function') {
	                config.onSelected.call(sharkComponent, item.data());
	            }
	            //收起待选列表
	            dropdown.removeClass('open');
	            selections.hide();
	        });
	        // 点击除了组件之外的地方，收起下拉列表
	        UI.addCloseListener(selections.attr('id'), [dropdown, selections], function() {
	            if (!selections.is(':hidden')) {
	                dropdown.removeClass('open');
	                selections.hide();
	            }
	        });
	    }
	    // 初始化事件
	    function initEvents(sharkComponent, config) {
	        var dropdown = sharkComponent.component;
	        dropdown.on('click.dropdown', '.dropdown', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	            if (!sharkComponent.selections) {
	                initSelectionsDom(sharkComponent, config);
	                // 给下拉菜单selections绑定事件
	                initSelectionsEvents(sharkComponent, config);
	            }
	            var selections = sharkComponent.selections;
	            if (selections.is(':hidden')) {
	                //展开待选列表
	                dropdown.addClass('open');
	                selections.show();
	                var postion = UI.calcOffset(dropdown, selections, 'bottom');
	                selections.css(postion);
	            } else {
	                //收起待选列表
	                dropdown.removeClass('open');
	                selections.hide();
	            }
	        }));
	    }

	    $.fn.extend({
	        sharkDropdown: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                text: '',
	                data: null,
	                actualKey: 'value',
	                displayKey: 'name',
	                dom: '',
	                onSelected: function() {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            initDom.call(this, sharkComponent, config);
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            initEvents(sharkComponent, config);
	            sharkComponent.destroy = function() {
	                if (sharkComponent.selections) {
	                    UI.removeCloseListener(sharkComponent.selections.attr('id'));
	                    sharkComponent.selections.destroy();
	                }
	                // 销毁component
	                if (sharkComponent.createType === 'construct') {
	                    sharkComponent.component.remove();
	                } else {
	                    sharkComponent.component.off('click.dropdown');
	                }
	                sharkComponent = null;
	            };
	            return sharkComponent;
	        }
	    });
	})(jQuery);


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 文件上传插件的扩展，兼容ie9以下浏览器
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var blankSrc = /^https/i.test(window.location.href || '') ? 'javascript:void(0);' : 'about:blank';
	//创建input
	function createInput(inputId) {
	    if ($('#' + inputId).length != 0) {
	        $('#' + inputId).remove();
	    }
	    var html = '<input style="width:0;height:0;" id=' + inputId + ' name="file" type="file" />';
	    var input = $(html);
	    return input;
	}
	//创建form
	function createForm(formId, iframeId, url) {
	    if ($('#' + formId).length != 0) {
	        $('#' + formId).remove();
	    }
	    var html = '<form style="width:0;height:0;" id="' + formId + '" name="' + formId + '" action="' + url + '" target="' + iframeId + '" enctype="multipart/form-data" accept-charset="UTF-8" method="post"></form>';
	    var form = $(html);
	    return form;
	}
	//创建iframe
	function createIframe(iframeId) {
	    if ($('#' + iframeId).length != 0) {
	        $('#' + iframeId).remove();
	    }
	    var html = '<iframe style="width:0;height:0;" id="' + iframeId + '" name="' + iframeId + '" src="' + blankSrc + '"></iframe>'
	    var iframe = $(html);
	    return iframe;
	}

	function makeIE9Able(sharkComponent, config) {
	    //初始化form和input
	    var inputId = UI.createUUID();
	    var formId = UI.createUUID();
	    var iframeId = UI.createUUID();
	    var form = createForm(formId, iframeId, config.url);
	    sharkComponent.component.append(form);
	    var input = createInput(inputId);
	    form.append(input);
	    //设置可选文件类型
	    if (config.accept) {
	        input.attr('accept', config.accept);
	    }
	    //初始化样式
	    if (sharkComponent.component.css('position') === 'static') {
	        sharkComponent.component.css({
	            position: 'relative'
	        });
	    }
	    form.css({
	        position: 'absolute',
	        left: 0,
	        top: 0,
	        width: sharkComponent.component.outerWidth(),
	        height: sharkComponent.component.outerHeight(),
	        overflow: 'hidden'
	    });
	    input.css({
	        position: 'absolute',
	        right: 0,
	        top: 0,
	        opacity: 0,
	        filter: 'alpha(opacity=0)',
	        fontSize: '100px',
	        cursor: 'pointer',
	        width: '1000px',
	        height: '1000px'
	    });
	    //监听事件
	    input.on('change', BaseComponent.filterComponentAction(sharkComponent.component, function(e) {
	        //IE9及以下无法获取文件
	        var v = input.val();
	        if (v.length > 0) {
	            sharkComponent.file = { name: v };
	            if (typeof config.onSelected === 'function') {
	                config.onSelected.call(sharkComponent.component, sharkComponent.file);
	            }
	            if (config.autoupload) {
	                sharkComponent.upload();
	            }
	        }
	    }));
	    sharkComponent.clear = function() {
	        sharkComponent.file = null;
	        form[0].reset();
	    };
	    sharkComponent.upload = function(u, p) {
	        var defer = $.Deferred();
	        if (sharkComponent.file) {
	            var url;
	            if (u && p) {
	                url = u + '?' + $.param(p);
	            } else if (u) {
	                url = u;
	            } else {
	                url = config.url;
	            }
	            form.attr('action', url);
	            var iframe = createIframe(iframeId);
	            $(document.body).append(iframe);
	            iframe.on('load', function(evt) {
	                // ie9下接收表单数据数据需要使用 text/html 格式，如：
	                // var c = `{
	                //             "code":200,
	                //             "data":{
	                //                 "url":"http://jizhang.nosdn.127.net/merrill-3.png"
	                //             }
	                //         }`;
	                // res.set('Content-Type', 'text/html').status(200).send(c);
	                // res.end();
	                var responseData;
	                try {
	                    var responseHtml = this.contentWindow.document.body.innerHTML;
	                    responseData = eval('(' + responseHtml + ')');
	                } catch (error) {
	                    responseData = eval('(' + $(responseHtml).html() + ')');
	                } finally {
	                    if (responseData) {
	                        config.onUploaded.call(sharkComponent.component, sharkComponent.file, responseData);
	                        defer.resolve(responseData);
	                    } else {
	                        config.onFailed.call(sharkComponent.component, sharkComponent.file, evt);
	                        defer.reject(evt);
	                    }
	                }
	            });
	            form[0].submit();
	        } else {
	            defer.reject({ type: 'noFileSelected' });
	        }
	        return defer.promise();
	    };
	    sharkComponent.destroy = function() {
	        input.remove();
	        form.remove();
	        // 销毁component
	        if (sharkComponent.createType === 'construct') {
	            sharkComponent.component.remove();
	        }
	        sharkComponent = null;
	    };
	}
	module.exports = makeIE9Able;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 文件上传插件
	 */
	var UI = __webpack_require__(1);
	var Templates = __webpack_require__(3);
	var BaseComponent = __webpack_require__(2);
	var makeIE9Able = __webpack_require__(8);
	(function($) {
	    // selecter模板
	    var templateFileupload = Templates.fileupload;
	    var templateFileuploadFun = Templates.templateAoT(templateFileupload);

	    function uploadByNative(file, url, params) {
	        var defer = $.Deferred();
	        var xhr = new XMLHttpRequest();
	        if (xhr.upload) {
	            xhr.upload.onprogress = function(e) {
	                if (e.lengthComputable) {
	                    var percent = parseInt(e.loaded / file.size * 100);
	                    percent > 100 ? percent = 100 : percent;
	                    percent < 0 ? percent = 0 : percent;
	                    defer.notify(percent);
	                }
	            }
	        }
	        xhr.addEventListener('load', function(evt) {
	            try {
	                var res = eval('(' + evt.target.response + ')');
	                defer.resolve(res);
	            } catch (error) {
	                defer.reject(evt);
	            }
	        });
	        var data = new FormData();
	        data.append('file', file);
	        if (params) {
	            for (var p in params) {
	                if (params.hasOwnProperty(p)) {
	                    data.append(p, params[p]);
	                }
	            }
	        }
	        xhr.open('POST', url);
	        xhr.send(data);
	        return defer;
	    }
	    //初始化文件上传的dom
	    function initDom(sharkComponent, config) {
	        if (this === $.fn) {
	            sharkComponent.createType = 'construct';
	            var fun = config.dom ? Templates.templateAoT(config.dom) : templateFileuploadFun;
	            var html = fun.apply(config);
	            sharkComponent.component = $(html);
	        } else {
	            sharkComponent.createType = 'normal';
	            sharkComponent.component = this;
	        }
	        sharkComponent.component.addClass('shark-fileupload');
	        return sharkComponent;
	    }
	    //绑定事件
	    function initEvents(sharkComponent, config) {
	        var uploader = sharkComponent.component;
	        var inputId = UI.createUUID();
	        uploader.on('click.fileupload', BaseComponent.filterComponentAction(sharkComponent, function() {
	            //每次都创建一个input是为了解决ie和chrome下input选择文件之后行为不一致的问题
	            //chrome的input选择文件之后，如果再次选择文件的过程中取消选择文件，那么下次选择【同一个文件】的时候就会重新触发input的change事件
	            //ie的input选择文件之后，无论过程如何操作，下次选择【同一个文件】的时候都不会重新触发input的change事件
	            //不管是否选择同一个文件，每次都触发
	            $('#' + inputId).remove();
	            var input = $('<input id="' + inputId + '" style="display:none;" type="file" />');
	            $(document.body).append(input);
	            if (config.accept) {
	                input.attr('accept', config.accept);
	            }
	            input.on('change', function(e) {
	                var files = e.target.files;
	                if (files && files.length > 0) {
	                    sharkComponent.file = files[0];
	                    if (typeof config.onSelected === 'function') {
	                        config.onSelected.call(sharkComponent, sharkComponent.file);
	                    }
	                    if (config.autoupload) {
	                        sharkComponent.upload();
	                    }
	                }
	            });
	            input.trigger('click');
	        }));
	        if (config.dragable) {
	            uploader.on('dragover.fileupload', function(e) {
	                UI.preventAndStopEvent(e); //一定要将dragover的默认事件取消掉，不然无法触发drop事件。如需拖拽页面里的元素，需要给其添加属性draggable="true"
	            });
	            uploader.on('drop.fileupload', BaseComponent.filterComponentAction(sharkComponent, function(e) {
	                UI.preventAndStopEvent(e);
	                e = e.originalEvent; //低版本jquery的事件没有dataTransfer属性，取浏览器原生事件originalEvent
	                var files = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
	                if (files && files.length > 0) {
	                    sharkComponent.file = files[0];
	                    if (typeof config.onSelected === 'function') {
	                        config.onSelected.call(sharkComponent, sharkComponent.file);
	                    }
	                    if (config.autoupload) {
	                        sharkComponent.upload();
	                    }
	                }
	            }));
	        }
	    }
	    var isNative = function() {
	        if (/msie\s+(.*?);/i.test(navigator.userAgent) && document.documentMode <= 9) {
	            return false;
	        } else {
	            return true;
	        }
	    };
	    $.fn.extend({
	        sharkFileupload: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                url: '/xhr/file/upload.do',
	                autoupload: false,
	                accept: '',
	                dragable: false,
	                dom: '',
	                onSelected: function(file) {},
	                onUploading: function(file, percent) {},
	                onUploaded: function(file, res) {},
	                onFailed: function(file, evt) {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            initDom.call(this, sharkComponent, config);
	            sharkComponent.file = null; //当前选中的文件
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            if (isNative()) {
	                initEvents(sharkComponent, config);
	                sharkComponent.clear = function() {
	                    sharkComponent.file = null;
	                };
	                sharkComponent.upload = function(u, p) {
	                    var defer = $.Deferred();
	                    if (sharkComponent.file) {
	                        uploadByNative(sharkComponent.file, u ? u : config.url, p)
	                            .progress(function(percent) {
	                                if (typeof config.onUploading === 'function') {
	                                    config.onUploading.call(sharkComponent, sharkComponent.file, percent);
	                                }
	                            })
	                            .done(function(res) {
	                                if (typeof config.onUploaded === 'function') {
	                                    config.onUploaded.call(sharkComponent, sharkComponent.file, res);
	                                }
	                                defer.resolve(res);
	                            })
	                            .fail(function(evt) {
	                                if (typeof config.onFailed === 'function') {
	                                    config.onFailed.call(sharkComponent, sharkComponent.file, evt);
	                                }
	                                defer.reject(evt);
	                            });
	                    } else {
	                        defer.reject({ type: 'noFileSelected' });
	                    }
	                    return defer.promise();
	                };
	                sharkComponent.destroy = function() {
	                    // 销毁component
	                    if (sharkComponent.createType === 'construct') {
	                        sharkComponent.component.remove();
	                    } else {
	                        sharkComponent.component.off('click.fileupload dragover.fileupload drop.fileupload');
	                    }
	                    sharkComponent = null;
	                };
	            } else {
	                makeIE9Able(sharkComponent, config);
	            }
	            return sharkComponent;
	        }
	    });
	})(jQuery || $);


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 弹窗插件
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var Templates = __webpack_require__(3);
	(function($) {
	    var template = Templates.modal;
	    var templateFun = Templates.templateAoT(template);

	    var templateConfirm = Templates.confirm;
	    var templateConfirmFun = Templates.templateAoT(templateConfirm);

	    //初始化modal的dom
	    function initDom(sharkComponent, config) {
	        var templateData = {
	            animate: config.animate,
	            size: config.size,
	            content: config.content
	        };
	        sharkComponent.component = $(templateFun.apply(templateData));
	        return sharkComponent;
	    }

	    // 初始化事件
	    function initEvents(sharkComponent, config) {
	        var modal = sharkComponent.component;
	        modal.on('click.modal', '.js-ok,.js-cancel,.close', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	            var curEle = $(this);
	            if (curEle.hasClass('js-ok')) {
	                config.deffer && config.deffer.resolve();
	            }
	            if (curEle.hasClass('js-cancel')) {
	                config.deffer && config.deffer.reject();
	            }
	            sharkComponent.hide();
	        }));
	    }

	    $.fn.extend({
	        sharkModal: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                animate: 'fade',
	                size: 'lg',
	                backdrop: '',
	                content: '',
	                onShow: function() {},
	                onHide: function() {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            var body = $(document.body);
	            var sharkComponent = {};
	            initDom.call(this, sharkComponent, config);
	            var backdropEle;
	            body.append(sharkComponent.component);
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            if (config.backdrop !== 'static') {
	                sharkComponent.component.on('click', function(evt) {
	                    if (evt.target === evt.currentTarget) {
	                        sharkComponent.hide();
	                    }
	                });
	            }
	            initEvents(sharkComponent, config);
	            sharkComponent.show = function() {
	                backdropEle = $('<div class="modal-backdrop ' + config.animate + ' in"></div>');
	                body.append(backdropEle);
	                body.addClass('modal-open');
	                sharkComponent.component.show();
	                sharkComponent.component.scrollTop(0); //触发重绘
	                sharkComponent.component.addClass('in');
	                if (typeof config.onShow === 'function') {
	                    config.onShow.call(sharkComponent);
	                }
	            };
	            sharkComponent.hide = function() {
	                backdropEle.remove();
	                body.removeClass('modal-open');
	                sharkComponent.component.hide();
	                sharkComponent.component.removeClass('in');
	                if (typeof config.onHide === 'function') {
	                    config.onHide.call(sharkComponent);
	                }
	            };
	            sharkComponent.destroy = function() {
	                if (backdropEle) {
	                    backdropEle.remove();
	                }
	                sharkComponent.component.remove();
	                sharkComponent = null;
	            };
	            return sharkComponent;
	        },
	        sharkConfirm: function(options) {
	            var deffer = $.Deferred();
	            /*********默认参数配置*************/
	            var config = {
	                animate: 'fade',
	                size: '',
	                title: '提示',
	                content: '',
	                okText: '确定',
	                cancelText: '取消',
	                onShow: function() {},
	                onHide: function() {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            config.backdrop = 'static';
	            config.deffer = deffer;
	            var templateData = {
	                title: config.title,
	                content: config.content,
	                okText: config.okText,
	                cancelText: config.cancelText
	            };
	            config.content = templateConfirmFun.apply(templateData);
	            var sharkComponent = $.fn.sharkModal(config);
	            sharkComponent.show();
	            return deffer.promise();
	        },
	        sharkAlert: function(options) {
	            var deffer = $.Deferred();
	            /*********默认参数配置*************/
	            var config = {
	                animate: 'fade',
	                size: '',
	                title: '提示',
	                content: '',
	                okText: '确定',
	                onShow: function() {},
	                onHide: function() {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            config.backdrop = 'static';
	            config.deffer = deffer;
	            var templateData = {
	                title: config.title,
	                content: config.content,
	                okText: config.okText
	            };
	            config.content = templateConfirmFun.apply(templateData);
	            var sharkComponent = $.fn.sharkModal(config);
	            sharkComponent.show();
	            return deffer.promise();
	        }
	    });
	})(jQuery || $);


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 分页插件
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var Templates = __webpack_require__(3);
	(function($) {
	    // selecter模板
	    var templatePager = Templates.pager;
	    var templatePagerFun = Templates.templateAoT(templatePager);
	    //初始化分页器外层ul的dom，内层的li不用模板生成（因为重新渲染分页器时，仍然需要提供renderPages方法重置分页）
	    function initDom(sharkComponent, config) {
	        if (this === $.fn) {
	            sharkComponent.createType = 'construct';
	            var fun = config.dom ? Templates.templateAoT(config.dom) : templatePagerFun;
	            var html = fun.apply(config);
	            sharkComponent.component = $(html);
	        } else {
	            sharkComponent.createType = 'normal';
	            sharkComponent.component = this;
	        }
	        sharkComponent.component.addClass('shark-pager pagination');
	        return sharkComponent;
	    }
	    //初始化事件
	    function initEvents(sharkComponent, config) {
	        var pager = sharkComponent.component;
	        var lastvalue = '';
	        pager.on('input.pager propertychange.pager', '.form-control', function(evt) {
	            var pageinput = $(this);
	            var v = pageinput.val();
	            if (UI.testNum(v)) {
	                lastvalue = v;
	            } else {
	                pageinput.val(lastvalue);
	            }
	        });
	        pager.on('keydown.pager', '.form-control', function(evt) {
	            if (evt.keyCode == 13) {
	                pager.find('.btn').trigger('click');
	            }
	        });
	        pager.on('click.pager', '.page,.presegment,.nextsegment,.firstpage,.prevpage,.nextpage,.lastpage,.btn', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	            var curEle = $(this);
	            var newPage;
	            if (curEle.hasClass('page')) {
	                newPage = parseInt(curEle.children().text());
	            }
	            //点击前一页码段
	            else if (curEle.hasClass('presegment')) {
	                newPage = (pager.data('minpage') - 1) || 1;
	            }
	            //点击后一页码段
	            else if (curEle.hasClass('nextsegment')) {
	                newPage = (pager.data('maxpage') + 1) || 1;
	            }
	            //点击首页
	            else if (curEle.hasClass('firstpage')) {
	                newPage = 1;
	            }
	            //点击上一页
	            else if (curEle.hasClass('prevpage')) {
	                newPage = (parseInt(pager.find('.active').children().text()) - 1) || 1;
	            }
	            //点击下一页
	            else if (curEle.hasClass('nextpage')) {
	                newPage = (parseInt(pager.find('.active').children().text()) + 1) || 1;
	            }
	            //点击尾页
	            else if (curEle.hasClass('lastpage')) {
	                newPage = config.totalPages;
	            }
	            //点击跳转按钮
	            else if (curEle.hasClass('btn')) {
	                newPage = curEle.prev().val();
	                if (UI.isEmpty(newPage) || !UI.testNum(newPage) || newPage == pager.find('.active').children().text() || parseInt(newPage) > config.totalPages || parseInt(newPage) < config.startFrom) {
	                    return;
	                }
	                curEle.prev().val('');
	                lastvalue = '';
	            }
	            var startFrom = config.startFrom;
	            newPage = newPage - (1 - startFrom);
	            sharkComponent.setPage(newPage);
	            if (typeof config.onPageChanged === 'function') {
	                config.onPageChanged.call(sharkComponent, newPage);
	            }
	        }));
	    }
	    //生成页码
	    function renderPages(sharkComponent, config) {
	        var pager = sharkComponent.component;
	        var page = config.page;
	        var totalPages = config.totalPages;
	        var startFrom = config.startFrom;
	        var segmentSize = config.segmentSize;
	        if (page > totalPages) {
	            // console.log('当前页码不能大于总页码');
	            return;
	        }
	        if (page < 0) {
	            // console.log('当前页码不能小于0');
	            return;
	        }
	        if (totalPages < 0) {
	            // console.log('总页码不能小于0');
	            return;
	        }
	        if (page < startFrom) {
	            // console.log('当前页码不能小于起始页码');
	            return;
	        }
	        page = page + (1 - startFrom);
	        pager.empty();
	        /*********首页、上一页*********/
	        if (page > 1) {
	            pager.append('<li class="firstpage"><a>' + config.hl['firstpage'] + '</a></li>');
	            pager.append('<li class="prevpage"><a>' + config.hl['prevpage'] + '</a></li>');
	        } else {
	            pager.append('<li class="disabled"><a>' + config.hl['firstpage'] + '</a></li>');
	            pager.append('<li class="disabled"><a>' + config.hl['prevpage'] + '</a></li>');
	        }
	        /*********中间页码*********/
	        //如果当前最页大于一段的页数，生成前边的...
	        if (page > segmentSize) {
	            pager.append('<li class="presegment"><a>...</a></li>');
	        }
	        //生成中间页码
	        var segment = Math.floor((page - 1) / segmentSize);
	        var start = segment * segmentSize + 1;
	        var end;
	        if (totalPages < (segment * segmentSize + segmentSize)) {
	            end = totalPages;
	        } else {
	            end = segment * segmentSize + segmentSize;
	        }
	        for (var i = start; i <= end; i++) {
	            var htmlStr = '';
	            if (page == i) {
	                htmlStr = '<li class="active"><a>' + i + '</a></li>'
	            } else {
	                htmlStr = '<li class="page"><a>' + i + '</a></li>';
	            }
	            var htmlEle = $(htmlStr);
	            if (i == start) {
	                //记录当前状态最小页
	                pager.data('minpage', i);
	            }
	            if (i == end) {
	                //记录当前状态最大页
	                pager.data('maxpage', i);
	            }
	            pager.append(htmlEle);
	        }
	        //如果当前最大页小于总页数，生成后边边的...
	        if (end < totalPages) {
	            pager.append('<li class="nextsegment"><a>...</a></li>');
	        }
	        /*********尾页、下一页*********/
	        if (page < totalPages) {
	            pager.append('<li class="nextpage"><a>' + config.hl['nextpage'] + '</a></li>');
	            pager.append('<li class="lastpage"><a>' + config.hl['lastpage'] + '</a></li>');
	        } else {
	            pager.append('<li class="disabled"><a>' + config.hl['nextpage'] + '</a></li>');
	            pager.append('<li class="disabled"><a>' + config.hl['lastpage'] + '</a></li>');
	        }
	        if (config.gopage) {
	            pager.append($('<li class="gopage"><input class="form-control" type="text"/><a class="btn">' + config.hl['gopage'] + '</a></li>'));
	        }
	    };
	    $.fn.extend({
	        sharkPager: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                totalPages: 1,
	                page: 1,
	                hl: {
	                    firstpage: '首页',
	                    prevpage: '上一页',
	                    nextpage: '下一页',
	                    lastpage: '尾页',
	                    gopage: '跳转'
	                },
	                segmentSize: 5,
	                startFrom: 1,
	                gopage: false,
	                dom: '',
	                onPageChanged: function() {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            initDom.call(this, sharkComponent, config);
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            initEvents(sharkComponent, config);
	            renderPages(sharkComponent, config);
	            /**********初始化***********************/
	            sharkComponent.setPage = function(page, totalPages) {
	                config.page = page;
	                if (!UI.isEmpty(totalPages)) {
	                    config.totalPages = totalPages;
	                }
	                renderPages(sharkComponent, config);
	            };
	            sharkComponent.destroy = function() {
	                // 销毁component
	                if (sharkComponent.createType === 'construct') {
	                    sharkComponent.component.remove();
	                } else {
	                    sharkComponent.component.off('input.pager propertychange.pager keydown.pager click.pager');
	                }
	                sharkComponent = null;
	            };
	            return sharkComponent;
	        }
	    });
	})(jQuery || $);


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 提示框插件
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var Templates = __webpack_require__(3);
	(function($) {
	    var template = Templates.popover;
	    var templateFun = Templates.templateAoT(template);
	    //初始化popover的dom
	    function initComponent(sharkComponent, config) {
	        var templateData = {
	            title: config.title,
	            content: config.content
	        };
	        sharkComponent.component = $(templateFun.apply(templateData));
	        sharkComponent.component.attr('id', UI.createUUID());
	        sharkComponent.component.addClass('shark-' + config.type);
	        $(document.body).append(sharkComponent.component);
	        sharkComponent.component.hide();
	        sharkComponent.isPopoverInit = true;
	        if (config.event === 'click' && config.close === 'bodyclick') {
	            UI.addCloseListener(sharkComponent.component.attr('id'), [sharkComponent.origin, sharkComponent.component], function() {
	                if (sharkComponent.component.is(':visible')) {
	                    sharkComponent.hide();
	                }
	            });
	        }
	    }
	    //初始化事件
	    function initEvents(sharkComponent, config) {
	        var origin = sharkComponent.origin;
	        if (config.event === 'click') {
	            origin.on('click.popover', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	                if (!sharkComponent.isPopoverInit) {
	                    initComponent(sharkComponent, config);
	                }
	                if (sharkComponent.component.is(':hidden')) {
	                    sharkComponent.show();
	                } else {
	                    sharkComponent.hide();
	                }
	            }));
	        } else if (config.event === 'mouseover') {
	            origin.on('mouseover.popover', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	                if (!sharkComponent.isPopoverInit) {
	                    initComponent(sharkComponent, config);
	                }
	                sharkComponent.show();
	            }));
	            origin.on('mouseout.popover', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	                sharkComponent.hide();
	            }));
	        }
	    }
	    //通用方法popover应展示的位置
	    var getPopoverPos = function(sharkComponent, direction) {
	        var origin = sharkComponent.origin;
	        var popover = sharkComponent.component;
	        var postion;
	        popover.removeClass('top right bottom left');
	        popover.addClass(direction);
	        var arrow = popover.find('.arrow');
	        var fix = {
	            width: arrow.outerWidth(),
	            height: arrow.outerHeight()
	        }
	        postion = UI.calcOffset(origin, popover, direction, fix);
	        if (direction !== postion.actualDirection) {
	            return getPopoverPos(sharkComponent, postion.actualDirection);
	        }
	        return postion;
	    };
	    //利用通用方法取到的结果postion，修正popover的位置
	    var fixPopover = function(sharkComponent, postion) {
	        var origin = sharkComponent.origin;
	        var popover = sharkComponent.component;
	        var arrow = popover.find('.arrow');
	        var direction = postion.actualDirection;
	        var popoverWidth = popover.outerWidth();
	        var popoverHeight = popover.outerHeight();
	        var originWidth = origin.outerWidth();
	        var originHeight = origin.outerHeight();
	        var left = 0;
	        var top = 0;
	        if (direction === 'right' || direction === 'left') {
	            top = postion.top - popoverHeight / 2 + originHeight / 2;
	            top > 0 ? top : top = 0;
	            postion.top = top;
	            //修正小箭头的位置
	            arrow.css('left', '');
	            arrow.css('right', '');
	            if (postion.top === 0) {
	                arrow.css({
	                    top: origin.offset().top + originHeight / 2
	                })
	            }
	        } else if (direction === 'bottom' || direction === 'top') {
	            left = postion.left - popoverWidth / 2 + originWidth / 2;
	            left > 0 ? left : left = 0;
	            postion.left = left;
	            //修正小箭头的位置
	            arrow.css('top', '');
	            arrow.css('bottom', '');
	            if (postion.left === 0) {
	                arrow.css({
	                    left: origin.offset().left + originWidth / 2
	                })
	            }
	        }
	        popover.css(postion);
	    };
	    $.fn.extend({
	        sharkPopover: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                event: 'click',
	                close: 'bodyclick',
	                direction: 'right',
	                title: '',
	                content: '',
	                preInit: false,//是否把popover组件预先生成并添加到body
	                reRenderOnShow: false,
	                onShow: function() {},
	                onHide: function() {}
	            };
	            UI.extend(config, options);
	            options.type = 'popover';
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            sharkComponent.linkTo = function(target) {
	                if(sharkComponent.origin){
	                    throw Error('only one element can be linked');
	                    return;
	                }
	                sharkComponent.origin = target;
	                if(config.preInit){
	                    initComponent(sharkComponent, config);
	                }
	                initEvents(sharkComponent, config);
	            };
	            sharkComponent.adjustPostion = function() {
	                var postion = getPopoverPos(sharkComponent, config.direction);
	                fixPopover(sharkComponent, postion);
	            };
	            sharkComponent.show = function() {
	                if (config.reRenderOnShow) {
	                    sharkComponent.component.find('.popover-title').html(config.title);
	                    sharkComponent.component.find('.popover-content').html(config.content);
	                }
	                sharkComponent.component.show();
	                sharkComponent.adjustPostion();
	                if (typeof config.onShow === 'function') {
	                    config.onShow.call(sharkComponent);
	                }
	            };
	            sharkComponent.hide = function() {
	                sharkComponent.component.hide();
	                if (typeof config.onHide === 'function') {
	                    config.onHide.call(sharkComponent);
	                }
	            };
	            sharkComponent.destroy = function() {
	                if(sharkComponent.isPopoverInit){
	                    UI.removeCloseListener(sharkComponent.component.attr('id'));
	                    sharkComponent.component.remove();
	                }
	                if (sharkComponent.origin) {
	                    sharkComponent.origin.off('click.popover mouseover.popover mouseout.popover');
	                }
	                sharkComponent = null;
	            };
	            if (this !== $.fn) {
	                sharkComponent.linkTo(this);
	            }
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            return sharkComponent;
	        },
	        sharkTooltip: function(options) {
	            options.event = 'mouseover';
	            options.type = 'tooltip';
	            var sharkComponent = this.sharkPopover(options);
	            return sharkComponent;
	        }
	    });
	})(jQuery || $);


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx & lingqiao
	 * @description selecter插件和dropdown插件
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var Templates = __webpack_require__(3);
	var ListGroup = __webpack_require__(4);
	(function($) {
	    // selecter模板
	    var templateSelecter = Templates.selecter;
	    var templateSelecterFun = Templates.templateAoT(templateSelecter);
	    // 初始化selecter的dom
	    function initDom(sharkComponent, config) {
	        if (this === $.fn) {
	            sharkComponent.createType = 'construct';
	            var fun = config.dom ? Templates.templateAoT(config.dom) : templateSelecterFun;
	            var html = fun.apply(config);
	            sharkComponent.component = $(html);
	        } else {
	            sharkComponent.createType = 'normal';
	            sharkComponent.component = this;
	        }
	        sharkComponent.component.addClass('shark-selecter');
	        return sharkComponent;
	    }
	    // 初始化下拉列表的的dom
	    function initSelectionsDom(sharkComponent, config) {
	        var selections = ListGroup.render();
	        selections.addClass('shark-selecter-list-group');
	        ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
	        sharkComponent.selections = selections;
	        $(document.body).append(selections);
	    }
	    // 初始化下拉列表事件
	    function initSelectionsEvents(sharkComponent, config) {
	        var selecter = sharkComponent.component;
	        var selections = sharkComponent.selections;
	        selections.on('click', '.list-group-item', function(evt) {
	            var item = $(this);
	            //设置值
	            var value = item.data('value');
	            sharkComponent.setValue(value, true);
	            //收起待选列表
	            selecter.removeClass('open');
	            selections.hide();
	        });
	        // 点击除了组件之外的地方，收起下拉列表
	        UI.addCloseListener(selections.attr('id'), [selecter, selections], function() {
	            if (!selections.is(':hidden')) {
	                selecter.removeClass('open');
	                selections.hide();
	            }
	        });
	    }
	    // 初始化事件
	    function initEvents(sharkComponent, config) {
	        var selecter = sharkComponent.component;
	        selecter.on('click.selecter', '.selecter', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
	            if (!sharkComponent.selections) {
	                // 如果还没有初始化过selections，在这里先初始化
	                initSelectionsDom(sharkComponent, config);
	                initSelectionsEvents(sharkComponent, config);
	            }
	            var selections = sharkComponent.selections;
	            if (selections.is(':hidden')) {
	                renderGroupList(sharkComponent, config);
	                //显示待选列表
	                selecter.addClass('open');
	                selections.show();
	                //设置待选列表样式
	                selections.css({
	                    width: selecter.outerWidth()
	                });
	                var postion = UI.calcOffset(selecter, selections, 'bottom');
	                selections.css(postion);
	            } else {
	                //隐藏待选列表
	                selecter.removeClass('open');
	                selections.hide();
	            }
	        }));
	    }
	    // 渲染下拉列表
	    function renderGroupList(sharkComponent, config) {
	        var selecter = sharkComponent.component;
	        var selections = sharkComponent.selections;
	        var value = sharkComponent.data[config.actualKey];
	        var activeLi;
	        //允许值为空字符串
	        if (typeof value !== 'undefined' && value !== null) {
	            activeLi = selections.find('.list-group-item[value="' + value + '"]');
	            if (activeLi.length > 0) {
	                activeLi.siblings().removeClass('active');
	                activeLi.addClass('active');
	                if (config.activeStyle) {
	                    activeLi.siblings().removeClass(config.activeStyle);
	                    activeLi.addClass(config.activeStyle);
	                }
	            }
	        }
	        if (!activeLi || activeLi.length == 0) {
	            selections.children().removeClass('active');
	            if (config.activeStyle) {
	                selections.children().removeClass(config.activeStyle);
	            }
	        }
	    }

	    $.fn.extend({
	        sharkSelecter: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                activeStyle: null, // point | nike
	                data: null,
	                actualKey: 'value',
	                displayKey: 'name',
	                dom: '',
	                onSelected: function() {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            initDom.call(this, sharkComponent, config);
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            initEvents(sharkComponent, config);
	            sharkComponent.data = {};
	            sharkComponent.setValue = function(v, docallback) {
	                var itemData = {};
	                var oldData = sharkComponent.data;
	                //允许值为空字符串
	                if (typeof v !== 'undefined' && v !== null) {
	                    for (var i = 0; i < config.data.length; i++) {
	                        if (v === config.data[i][config.actualKey]) {
	                            itemData = config.data[i];
	                            break;
	                        }
	                    }
	                }
	                if (oldData[config.actualKey] != itemData[config.actualKey]) {
	                    //设置新值
	                    $.isEmptyObject(itemData) ? sharkComponent.data = {} : sharkComponent.data = itemData;
	                    var valuelabel = sharkComponent.component.find('.value');
	                    valuelabel.text(UI.isEmpty(itemData[config.displayKey]) ? '' : itemData[config.displayKey]);
	                    //触发回调函数
	                    if (docallback && typeof config.onSelected === 'function') {
	                        config.onSelected.call(sharkComponent, itemData[config.actualKey], itemData);
	                    }
	                }
	            };
	            sharkComponent.getValue = function() {
	                return sharkComponent.data[config.actualKey];
	            };
	            sharkComponent.destroy = function() {
	                if (sharkComponent.selections) {
	                    UI.removeCloseListener(sharkComponent.selections.attr('id'));
	                    sharkComponent.selections.destroy();
	                }
	                // 销毁component
	                if (sharkComponent.createType === 'construct') {
	                    sharkComponent.component.remove();
	                } else {
	                    sharkComponent.component.off('click.selecter');
	                }
	                sharkComponent = null;
	            };
	            return sharkComponent;
	        }
	    });
	})(jQuery);


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author lingqiao
	 * @description tabs插件
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var Templates = __webpack_require__(3);
	(function($) {
	    var template = Templates.tabs;
	    var templateFun = Templates.templateAoT(template);
	    // 初始化tabs的dom
	    function initDom(sharkComponent, config) {
	        if (this === $.fn) {
	            sharkComponent.createType = 'construct';
	            var fun = config.dom ? Templates.templateAoT(config.dom) : templateFun;
	            var html = fun.apply(config);
	            sharkComponent.component = $(html);
	        } else {
	            sharkComponent.createType = 'normal';
	            sharkComponent.component = this;
	        }
	        sharkComponent.component.addClass('shark-tabs');
	        return sharkComponent;
	    }
	    // 初始化事件
	    function initEvents(sharkComponent, config) {
	        var tabs = sharkComponent.component;
	        tabs.on('click.tabs', '.nav-tabs li', BaseComponent.filterComponentAction(sharkComponent, function(e) {
	            var index = $(this).index();
	            switchTo(sharkComponent, index, config.onTabSwitch);
	        }));
	    }
	    // 切换到某个tab
	    function switchTo(sharkComponent, index, cb) {
	        var tabs = sharkComponent.component;
	        var menu = tabs.find('.nav-tabs');
	        var tabpane = tabs.find('.tab-pane');
	        var len = menu.find('li').length;
	        index = index % len;
	        var activeIndex = menu.find('li.active').index();
	        if (index === activeIndex) {
	            return;
	        }
	        menu.children().siblings().removeClass('active').end().eq(index).addClass('active');
	        tabpane.siblings().removeClass('active').end().eq(index).addClass('active');
	        if (typeof cb === 'function') {
	            cb.call(sharkComponent, index);
	        }
	    }
	    // 开始自动切换
	    function startAutoSwitch(sharkComponent, config) {
	        var tabs = sharkComponent.component;
	        doAutoSwitch(sharkComponent, config);
	        tabs.on('mouseover.tabs', function() {
	            clearInterval(sharkComponent.autoSwitchTimer);
	            sharkComponent.autoSwitchTimer = null;
	        });
	        tabs.on('mouseout.tabs', function() {
	            doAutoSwitch(sharkComponent, config);
	        });
	    }
	    // 执行自动切换
	    function doAutoSwitch(sharkComponent, config) {
	        var tabs = sharkComponent.component;
	        var menu = tabs.find('.nav-tabs');
	        sharkComponent.autoSwitchTimer = setInterval(function() {
	            var index = menu.find('li.active').index() + 1;
	            switchTo(sharkComponent, index, config.onTabSwitch);
	        }, config.auto);
	    }
	    // 结束自动切换
	    function stopAutoSwitch(sharkComponent) {
	        var tabs = sharkComponent.component;
	        clearInterval(sharkComponent.autoSwitchTimer);
	        sharkComponent.autoSwitchTimer = null;
	        tabs.off('mouseover.tabs').off('mouseout.tabs');
	    }

	    $.fn.extend({
	        sharkTabs: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                tabs: [],
	                initTab: 0,
	                dom: '',
	                onTabSwitch: function() {}
	            };
	            UI.extend(config, options);
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            initDom.call(this, sharkComponent, config);
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            initEvents(sharkComponent, config);
	            switchTo(sharkComponent, config.initTab);
	            //切换至某个tab
	            sharkComponent.switchTo = function(index, cb) {
	                var callback;
	                if (cb === true) {
	                    callback = config.onTabSwitch;
	                } else if (typeof cb === 'function') {
	                    callback = cb;
	                } else {
	                    callback = false;
	                }
	                switchTo(sharkComponent, index, callback);
	            };
	            //开启自动切换
	            sharkComponent.startAutoSwitch = function(auto) {
	                if (/^[1-9]{1,}[0-9]*$/.test(auto)) {
	                    //正整数
	                    config.auto = auto;
	                    startAutoSwitch(sharkComponent, config);
	                }
	            };
	            //关闭自动切换
	            sharkComponent.stopAutoSwitch = function() {
	                stopAutoSwitch(sharkComponent);
	            };
	            //销毁
	            sharkComponent.destroy = function() {
	                stopAutoSwitch(sharkComponent);
	                if (sharkComponent.createType === 'construct') {
	                    sharkComponent.component.remove();
	                } else {
	                    sharkComponent.component.off('click.tabs');
	                }
	                sharkComponent = null;
	            };
	            return sharkComponent;
	        }
	    });
	})(jQuery || $);


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author lingqiao
	 * @description 提示框插件
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var Templates = __webpack_require__(3);
	(function($) {
	    var template = Templates.toastr;
	    var templateFun = Templates.templateAoT(template);
	    var container; // toastr的父容器
	    var toastrArr = [];
	    // 创建父容器
	    function initContainer() {
	        container = $('<div class="shark-toastr-container" style="position:fixed;"></div>');
	        $(document.body).append(container);
	    }
	    //初始化toastr的dom
	    function initDom(sharkComponent, config) {
	        var templateData = {
	            type: config.type,
	            content: config.content
	        };
	        sharkComponent.component = $(templateFun.apply(templateData));
	        sharkComponent.toastrId = UI.createUUID();
	        return sharkComponent;
	    }
	    //移除toastr
	    function doDestroy(sharkComponent) {
	        var toastr = sharkComponent.component;
	        clearTimeout(sharkComponent.timer);
	        toastr.hide();
	        toastr.remove();
	    }
	    // 从队列中移除toastr
	    function destroyToastrs(id) {
	        for (var i = 0; i < toastrArr.length; i++) {
	            var component = toastrArr[i];
	            if (id) {
	                if (component.toastrId === id) {
	                    doDestroy(component);
	                    toastrArr.splice(i, 1);
	                    break;
	                }
	            } else {
	                doDestroy(component);
	                toastrArr.splice(i, 1);
	                i--;
	            }
	        }
	    }
	    // 显示toastr
	    function showToastr(sharkComponent, config) {
	        var toastr = sharkComponent.component;
	        toastr.show();
	        sharkComponent.toastrTimer = setTimeout(function() {
	            destroyToastrs(sharkComponent.toastrId);
	        }, config.duration);
	    }
	    $.fn.extend({
	        sharkToastr: function(options) {
	            /*********默认参数配置*************/
	            var config = {
	                content: '', // 提示内容
	                type: 'success', // 提示类型
	                duration: 2000 // 停留时间
	            };
	            UI.extend(config, options);
	            if (!container) {
	                // 如果父容器不存在，则创建父容器
	                initContainer();
	            }
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            initDom.call(this, sharkComponent, config);
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            if (!$.fn.sharkToastr.multiply) {
	                // 如果不允许展示多个提示，则先清空
	                destroyToastrs();
	            }
	            toastrArr.push(sharkComponent);
	            container.prepend(sharkComponent.component);
	            showToastr(sharkComponent, config);
	        }
	    });
	    $.fn.sharkToastr.multiply = true;
	})(jQuery || $);


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 树插件的扩展，可check树
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);

	function makeCheckable(sharkComponent, config) {
	    var tree = sharkComponent.component;
	    tree.addClass('tree-checkable');
	    //获取Checked的节点
	    function getCheckedNodes() {
	        var nodeList = [];
	        var checkedNodes = tree.find('.tree-icon-check');
	        var addedMap = {};
	        for (var i = 0; i < checkedNodes.length; i++) {
	            var label = $(checkedNodes[i]).parent();
	            var groupId = label.attr('tree-group-id');
	            var node = config.nodesMap[groupId];
	            if (addedMap[node.node_id])
	                continue;
	            addedMap[node.node_id] = true;
	            nodeList.push(node);
	            if (config.autolink === true) {
	                var nextUl = label.next('ul');
	                if (nextUl.length === 0) {
	                    getAllChildren(nodeList, node);
	                }
	            }
	        };
	        return nodeList;
	    }
	    //获取所有子节点
	    function getAllChildren(nodeList, node) {
	        if (!$.isArray(node.children))
	            return;
	        for (var i = 0; i < node.children.length; i++) {
	            nodeList.push(node.children[i]);
	            getAllChildren(nodeList, node.children[i]);
	        };
	    }
	    // 全选,全不选
	    function checkAll(flag) {
	        if (flag) {
	            tree.find('.tree-icon-check-empty,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check-minus').addClass('tree-icon-check');
	        } else {
	            tree.find('.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check tree-icon-check-minus').addClass('tree-icon-check-empty');
	        }
	    }
	    // 反选
	    function reverseCheckAll() {
	        var emptys = tree.find('.tree-icon-check-empty');
	        var checks = tree.find('.tree-icon-check');
	        emptys.removeClass('tree-icon-check-empty').addClass('tree-icon-check');
	        checks.removeClass('tree-icon-check').addClass('tree-icon-check-empty');
	    }
	    /**
	     * 修改所有子节点
	     * @param  {element}  liEle    li
	     * @param  {Boolean} isChecked 是否check
	     */
	    function changeChildChecked(liEle, isChecked) {
	        var groupEle = liEle.children('.tree-group');
	        if (isChecked) {
	            groupEle.find('.tree-icon-check-empty,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check-minus').addClass('tree-icon-check');
	        } else {
	            groupEle.find('.tree-icon-check').removeClass('tree-icon-check').addClass('tree-icon-check-empty');
	        }
	        var nextUl = groupEle.next('ul');
	        if (nextUl.length > 0) {
	            var childs = nextUl.children('li');
	            for (var i = 0; i < childs.length; i++) {
	                changeChildChecked($(childs[i]), isChecked);
	            };
	        }
	    }
	    /**
	     * 修改所有父节点
	     * @param  {element}  liEle    li
	     * @return {void} 
	     */
	    function changeParentChecked(liEle) {
	        var ul = liEle.parent();
	        var groupEle = ul.prev('.tree-group');
	        if (groupEle.length === 0) {
	            return;
	        }
	        if (ul.find('.tree-icon-check-minus').length > 0 || (ul.find('.tree-icon-check-empty').length > 0 && ul.find('.tree-icon-check').length > 0)) {
	            // 半选
	            groupEle.find('.tree-icon-check-empty,.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check tree-icon-check-minus').addClass('tree-icon-check-minus');
	        } else if (ul.find('.tree-icon-check-empty').length === 0 && ul.find('.tree-icon-check-minus').length == 0) {
	            // 全选
	            groupEle.find('.tree-icon-check-empty,.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check tree-icon-check-minus').addClass('tree-icon-check');
	        } else {
	            // 全不选
	            groupEle.find('.tree-icon-check-empty,.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check tree-icon-check-minus').addClass('tree-icon-check-empty');
	        }
	        changeParentChecked(groupEle.parent('li'));
	    }
	    /**
	     * check节点的复选框
	     */
	    function reverseCheckNode(checkEle, updateLinkNodes, callback) {
	        var parentLabel = checkEle.parent();
	        var parentLi = parentLabel.parent();
	        var isChecked = false;
	        if (checkEle.hasClass('tree-icon-check')) {
	            checkEle.removeClass('tree-icon-check').addClass('tree-icon-check-empty');
	            isChecked = false;
	        } else if (checkEle.hasClass('tree-icon-check-empty') || checkEle.hasClass('tree-icon-check-minus')) {
	            checkEle.removeClass('tree-icon-check-empty tree-icon-check-minus').addClass('tree-icon-check');
	            isChecked = true;
	        }
	        if (updateLinkNodes) {
	            // 更新已展开的子节点
	            changeChildChecked(parentLi, isChecked);
	            // 更新父节点
	            changeParentChecked(parentLi);
	        }
	        var node_id = parentLabel.attr('tree-group-id');
	        var node = config.nodesMap[node_id];
	        if (typeof callback === 'function') {
	            callback.call(tree, node, isChecked);
	        }
	        return tree;
	    }
	    /**
	     * 获取所有选中的节点
	     * @return {[nodes]}
	     */
	    sharkComponent.getCheckedNodes = function() {
	        return getCheckedNodes();
	    };
	    /**
	     * 全选
	     */
	    sharkComponent.checkAll = function() {
	        checkAll(true);
	    };
	    /**
	     * 反选
	     */
	    sharkComponent.reverseCheck = function() {
	        reverseCheckAll();
	    };
	    /**
	     * 全不选
	     */
	    sharkComponent.checkNo = function() {
	        checkAll(false);
	    };
	    /**
	     * check节点
	     * @param  {node}   node            [节点对象或节点id]
	     */
	    sharkComponent.reverseCheckNode = function(node) {
	        var nodeId = node.node_id || node;
	        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
	        if (groupEle.length > 0) {
	            var checkEle = groupEle.children('.tree-icon-check-empty,.tree-icon-check-minus,.tree-icon-check');
	            reverseCheckNode(checkEle, config.autolink, config.onNodeChecked);
	        }
	    };
	    /**
	     * 强制check节点
	     * @param  {node}   node            [节点对象或节点id]
	     */
	    sharkComponent.checkNode = function(node) {
	        var nodeId = node.node_id || node;
	        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
	        if (groupEle.length > 0) {
	            var checkEle = groupEle.children('.tree-icon-check-empty,.tree-icon-check-minus');
	            if (checkEle.length > 0) {
	                reverseCheckNode(checkEle, config.autolink, config.onNodeChecked);
	            }
	        }
	    };
	    /**
	     * 强制取消check节点
	     * @param  {node}   node            [节点对象或节点id]
	     */
	    sharkComponent.unCheckNode = function(node) {
	        var nodeId = node.node_id || node;
	        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
	        if (groupEle.length > 0) {
	            var checkEle = groupEle.children('.tree-icon-check');
	            if (checkEle.length > 0) {
	                reverseCheckNode(checkEle, config.autolink, config.onNodeChecked);
	            }
	        }
	    };
	    //点击复选框
	    tree.on('click', '.tree-icon-check-empty,.tree-icon-check-minus,.tree-icon-check', BaseComponent.filterComponentAction(tree, function(evt) {
	        var checkEle = $(this);
	        reverseCheckNode(checkEle, config.autolink, config.onNodeChecked);
	    }));
	}
	module.exports = makeCheckable;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 树插件的扩展，可select树
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);

	function makeSelectable(sharkComponent, config) {
	    var tree = sharkComponent.component;
	    tree.addClass('tree-selectable');
	    //获取selected的节点
	    function getSelectedNode() {
	        var nameEle = tree.find('.tree-node-selected');
	        var label = nameEle.parent();
	        var groupId = label.attr('tree-group-id');
	        var node = config.nodesMap[groupId];
	        return node;
	    }
	    /**
	     * select节点
	     */
	    function selectNode(nameEle, callback) {
	        if (!nameEle.hasClass('tree-node-selected')) {
	            tree.find('.tree-node-selected').removeClass('tree-node-selected');
	            nameEle.addClass('tree-node-selected');
	            var parentLabel = nameEle.parent();
	            var node_id = parentLabel.attr('tree-group-id');
	            var node = config.nodesMap[node_id];
	            if (typeof callback === 'function') {
	                callback.call(tree, node);
	            }
	        }
	    }
	    /**
	     * 获取selected的节点
	     * @return {[nodes]}
	     */
	    sharkComponent.getSelectedNode = function() {
	        return getSelectedNode();
	    };
	    /**
	     * 选中节点
	     * @param  {node}   node            [节点对象或节点id]
	     * @param  {boolean}   updateLinkNodes [是否需要check相关联的节点]
	     * @param  {Function} callback        [回调函数]
	     * @return {[tree]}                   [tree]
	     */
	    sharkComponent.selectNode = function(node) {
	        var nodeId = node.node_id || node;
	        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
	        if (groupEle.length > 0) {
	            var nameEle = groupEle.children('.tree-node-name');
	            selectNode(nameEle, config.onNodeSelected);
	        }
	    };
	    //树的点击事件
	    tree.on('click', '.tree-node-name', BaseComponent.filterComponentAction(tree, function(evt) {
	        var nameEle = $(this);
	        selectNode(nameEle, config.onNodeSelected);
	    }));
	}
	module.exports = makeSelectable;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author sweetyx
	 * @description 树插件
	 */
	var UI = __webpack_require__(1);
	var BaseComponent = __webpack_require__(2);
	var Templates = __webpack_require__(3);
	var makeCheckable = __webpack_require__(16);
	var makeSelectable = __webpack_require__(17);
	(function($) {
	    var template = Templates.tree;
	    var templateFun = Templates.templateAoT(template);
	    var isCalced = false;
	    //缓存icon的宽度
	    var baseIconWidth = 16;
	    var calcWidth = function() {
	        if (isCalced) {
	            return;
	        }
	        var iconWrap = $('<div class="shark-tree"><a class="tree-icon"></a></div>');
	        $(document.body).append(iconWrap);
	        var icon = iconWrap.children('.tree-icon');
	        baseIconWidth = icon.outerWidth();
	        iconWrap.remove();
	        isCalced = true;
	    };
	    /**
	     * 展开节点
	     * @param  {tree-icon-right,tree-icon-down} element [节点前面的 展开/收起 按钮]
	     * @param  {object} config [配置项]
	     */
	    function unfoldNode(element, config) {
	        var parentLable = element.parent();
	        if (parentLable.attr('tree-unfold')) {
	            //已展开过
	            var next = parentLable.next();
	            next.addClass('tree-open');
	        } else {
	            // 第一次展开
	            var parentLi = parentLable.parent();
	            var groupId = parentLable.attr('tree-group-id');
	            var nodes = config.nodesMap[groupId].children;
	            // 需要继承是否被check
	            var checked = false;
	            if (config.checkable) {
	                checked = config.checkable && parentLable.find('.tree-icon-check').length > 0 && config.autolink === true;
	            }
	            //生成html
	            var templateData = {
	                nodes: nodes,
	                checkable: config.checkable,
	                checked: checked,
	                baseIconWidth: baseIconWidth,
	                basePl: parseInt(parentLi.children('.tree-group').css('padding-left')),
	                isRoot: false
	            };
	            var ulHtml = $(templateFun.apply(templateData));
	            parentLi.append(ulHtml);
	            //已经展开，加上tree-unfold
	            parentLable.attr('tree-unfold', true);
	        }
	        element.removeClass('tree-icon-right').addClass('tree-icon-down');
	    }
	    /**
	     * 收起节点
	     * @param  {tree-icon-right,tree-icon-down} element [节点前面的 展开/收起 按钮]
	     */
	    function foldNode(element) {
	        var parentLable = element.parent();
	        var nextUl = parentLable.next();
	        if (nextUl.length > 0) {
	            nextUl.removeClass('tree-open');
	        }
	        element.removeClass('tree-icon-down').addClass('tree-icon-right');
	    }
	    /**
	     * 初始化树的所有节点
	     * @param  {[type]} nodes      [节点数组]
	     * @param  {[type]} nodesMap   [节点map]
	     * @param  {[type]} parentNode [父节点]
	     */
	    function initNodesMap(nodes, nodesMap, parentNode) {
	        if (!$.isArray(nodes))
	            return;
	        for (var i = 0; i < nodes.length; i++) {
	            nodes[i].parentNode = parentNode || null;
	            var n = nodes[i];
	            var level = 1;
	            while (n.parentNode) {
	                level++;
	                n = n.parentNode;
	            }
	            nodes[i].level = level;
	            nodesMap[nodes[i].node_id] = nodes[i];
	            initNodesMap(nodes[i].children, nodesMap, nodes[i]);
	        }
	    }
	    //初始化树的第一层级dom
	    function initDom(sharkComponent, config) {
	        var templateData = {
	            nodes: config.nodes,
	            checkable: config.checkable,
	            checked: false,
	            baseIconWidth: baseIconWidth,
	            basePl: -baseIconWidth,
	            isRoot: true
	        };
	        sharkComponent.createType = 'construct';
	        sharkComponent.component = $(templateFun.apply(templateData));
	        sharkComponent.component.addClass('shark-tree');
	        if (this !== $.fn) {
	            this.append(sharkComponent.component);
	        }
	        return sharkComponent
	    }
	    //初始化事件
	    function initEvents(sharkComponent, config) {
	        var tree = sharkComponent.component;
	        /**
	         * 点击节点的 展开/收起 按钮
	         */
	        tree.on('click', '.tree-icon-right,.tree-icon-down', BaseComponent.filterComponentAction(tree, function(evt) {
	            var iconEle = $(this);
	            if (iconEle.hasClass('tree-icon-right')) {
	                unfoldNode(iconEle, config);
	            } else if (iconEle.hasClass('tree-icon-down')) {
	                foldNode(iconEle);
	            }
	        }));
	    }
	    $.fn.extend({
	        sharkTree: function(options) {
	            calcWidth();
	            /*********默认参数配置*************/
	            var config = {
	                nodes: [],
	                nodesMap: {}, //无需用户手动配置
	                checkable: true, //是否可check
	                autolink: true, //check一个节点后，是否关联其父节点和子节点的选中状态（只有checkable为true时才生效）
	                selectable: false, //是否可select
	                onNodeChecked: function(node, isChecked) {},
	                onNodeSelected: function(node) {}
	            };
	            UI.extend(config, options);
	            initNodesMap(config.nodes, config.nodesMap);
	            /*********初始化组件*************/
	            var sharkComponent = {};
	            initDom.call(this, sharkComponent, config);
	            var tree = sharkComponent.component;
	            BaseComponent.addComponentBaseFn(sharkComponent, config);
	            initEvents(sharkComponent, config);
	            //可check
	            if (config.checkable) {
	                makeCheckable(sharkComponent, config);
	            }
	            //可select
	            if (config.selectable) {
	                makeSelectable(sharkComponent, config);
	            }
	            /**********初始化***********************/
	            /**
	             * 按节点路径展开树
	             * @param  {[]} path   [节点路径,eg.[{node_id:100},{node_id:110},{node_id:111}] 或者 [100,110,111]]
	             */
	            sharkComponent.expandByPath = function(path) {
	                for (var i = 0; i < path.length; i++) {
	                    var nodeId = path[i].node_id || path[i];
	                    var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
	                    var iconEle = groupEle.children('.tree-icon-right');
	                    if (iconEle.length > 0) {
	                        unfoldNode(iconEle, config);
	                    }
	                }
	            };
	            /**
	             * 按节点展开树
	             * @param node   [节点id或者节点]
	             */
	            sharkComponent.expandByNode = function(node) {
	                var nodeId = node || node.node_id;
	                var tmpNode = config.nodesMap[nodeId];
	                var path = [tmpNode];
	                while (tmpNode.parentNode) {
	                    var tmpNode = tmpNode.parentNode;
	                    path.unshift(tmpNode);
	                }
	                sharkComponent.expandByPath(path);
	            };
	            /**
	             * 展开树的全部节点
	             */
	            sharkComponent.expandAll = (function() {
	                var expandAll = function(nodesArr) {
	                    if (!$.isArray(nodesArr)) {
	                        return;
	                    }
	                    for (var i = 0; i < nodesArr.length; i++) {
	                        sharkComponent.expandByPath([nodesArr[i]]);
	                        expandAll(nodesArr[i].children);
	                    }
	                };
	                return function() {
	                    expandAll(config.nodes);
	                };
	            })();
	            /**
	             * 搜索树的节点
	             * @param  {[string]} keyword [搜索关键字]
	             * @return {[node]}         [节点数组]
	             */
	            sharkComponent.search = function(keyword) {
	                var result = [];
	                for (var p in config.nodesMap) {
	                    if (config.nodesMap.hasOwnProperty(p) && !UI.isEmpty(config.nodesMap[p].node_name) && config.nodesMap[p].node_name.indexOf(keyword) !== -1) {
	                        result.push(config.nodesMap[p]);
	                    }
	                }
	                return result;
	            };
	            /**
	             * 销毁树
	             */
	            sharkComponent.destroy = function() {
	                sharkComponent.component.remove();
	                sharkComponent = null;
	            };
	            return sharkComponent;
	        }
	    });
	})(jQuery || $);


/***/ }
/******/ ]);