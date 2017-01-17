/**
 * @author asteryk
 * @description 自动补全插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var ListGroup = require('./listgroup.ui');
(function($) {
    //键盘上功能键键值数组
    var functionalKeyArray = [40, 38, 13, 27];
    // 初始化输入框的dom
    function initInputDom(config) {
        var autoComplete = $('<input type="text" />');
        return autoComplete;
    }
    // 初始化下拉列表的dom
    function initSelectionsDom(actionObj, config) {
        var selections = ListGroup.render();
        selections.addClass('shark-autocomplete-list-group');
        $(document.body).append(selections);
        actionObj.selections = selections;
        return actionObj;
    }
    // 初始化事件
    function initEvents(actionObj, config) {
        var autoComplete = actionObj.element;
        var selections = actionObj.selections;
        //防止按上下键时，输入框中的光标左右移动
        autoComplete.on('keydown.autocomplete', autoComplete, BaseComponent.filterComponentAction(autoComplete, function(evt) {
            if ($.inArray(evt.keyCode, functionalKeyArray) > -1) {
                UI.preventAndStopEvent(evt);
            }
        }));
        autoComplete.on('keyup.autocomplete', BaseComponent.filterComponentAction(autoComplete, function(evt) {
            UI.preventAndStopEvent(evt);
            var keyCode = evt.keyCode;
            if ($.inArray(keyCode, functionalKeyArray) > -1) {
                functionKeyUse(autoComplete, selections, keyCode, config);
            }
        }));
        // 输入框事件，适配IE8
        autoComplete.on('input.autocomplete propertychange.autocomplete', BaseComponent.filterComponentAction(autoComplete, UI.debounce(function() {
            var value = autoComplete.val();
            var result;
            if (typeof config.filterData === 'function') {
                result = config.filterData(value, config);
            } else {
                result = filterData(value, config);
            }
            if (result && typeof result.then === 'function') {
                result.then(function(list) {
                    doUpdate(autoComplete, selections, config, list);
                }, function() {});
            } else {
                doUpdate(autoComplete, selections, config, result);
            }
        }, config.debounceTime, true)));
        var lastMousePos = {
            clientX: -1,
            clientY: -1
        };
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
                        setValue(autoComplete, selectionsRow, config);
                    }
                }
            }
        });
        // 点击事件
        selections.on('click', function(evt) {
            if (!selections.is(':hidden')) {
                var selectionsRow = $(evt.target);
                selectionsRow.siblings().removeClass('active');
                selectionsRow.addClass('active');
                if (!config.autocomplete) {
                    setValue(autoComplete, selectionsRow, config);
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
    //更新autocomplete的下拉列表
    function doUpdate(autoComplete, selections, config, list) {
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
    // 设置autoComplete的值
    function setValue(autoComplete, item, config) {
        autoComplete.val(item.data()[config.displayKey]);
        if (typeof config.onSelected === 'function') {
            config.onSelected.call(autoComplete, item.data());
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
    function functionKeyUse(autoComplete, selections, keyCode, config) {
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
                        setValue(autoComplete, $next, config);
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
                        setValue(autoComplete, $previous, config);
                    }
                    scrollHeight(autoComplete, selections, $previous, 'up');
                }
                break;
            case 13: //回车键
                var $current = selections.children('.active');
                if ($current.length > 0) {
                    if (!config.autocomplete) {
                        setValue(autoComplete, $current, config);
                    }
                    selections.hide();
                }
                break;
            case 27: //ESC键
                selections.hide();
                break;
        }
    }
    // 数据联想模块
    function filterData(keyword, config) {
        var data = config.data;
        var displayKey = config.displayKey;
        var emailcomplete = config.emailcomplete;
        var list = [];
        if (keyword == null || keyword == "") {
            return;
        }
        if (data != null && $.isArray(data)) {
            if (emailcomplete) {
                // 补全邮箱后缀
                if (keyword.indexOf('@') < 0) {
                    // 未输入@时 
                    for (var i = 0; i < data.length; i++) {
                        var obj = {};
                        obj[displayKey] = keyword + '@' + data[i][displayKey];
                        list.push(obj);
                    }
                } else {
                    // 输入了@以后
                    for (var i = 0; i < data.length; i++) {
                        if (data[i][displayKey].indexOf(keyword.split('@')[1]) > -1) {
                            var obj = {};
                            obj[displayKey] = keyword.split('@')[0] + '@' + data[i][displayKey];
                            list.push(obj);
                        }
                    }
                }
            } else {
                // 自动联想补全
                for (var i = 0; i < data.length; i++) {
                    if (data[i][displayKey].indexOf(keyword) > -1) {
                        list.push(data[i]);
                    }
                }
            }
        }
        return list;
    }
    $.fn.extend({
        sharkAutoComplete: function(options) {
            /*********默认参数配置*************/
            var config = {
                autocomplete: false,
                emailcomplete: false,
                data: null,
                displayKey: 'name',
                debounceTime: 300,
                filterData: null,
                onSelected: function() {}
            };
            UI.extend(config, options);
            // 初始化整个组件
            var actionObj = {};
            if (this === $.fn) {
                actionObj.createType = 'new';
                actionObj.element = initInputDom(config);
            } else {
                actionObj.createType = 'normal';
                actionObj.element = this;
            }
            actionObj.element.addClass('shark-autocomplete');
            initSelectionsDom(actionObj, config);
            BaseComponent.addComponentBaseFn(actionObj, config);
            initEvents(actionObj, config);
            // 销毁函数
            actionObj.destroy = function() {
                UI.removeCloseListener(actionObj.selections.attr('id'));
                actionObj.selections.destroy();
                actionObj.selections = null;
                if (actionObj.createType === 'new') {
                    actionObj.element.remove();
                } else {
                    actionObj.element.off('input.autocomplete propertychange.autocomplete keyup.autocomplete keydown.autocomplete');
                }
                actionObj = null;
            };
            return actionObj;
        }
    });
})(jQuery || $);