/**
 * @author asteryk
 * @description 自动补全插件
 */
var UI = require('../common/core');
var Templates = require('../common/templates');
var BaseComponent = require('../common/base');
var ListGroup = require('./listgroup.ui');
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
        selections.on('click', function(evt) {
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
