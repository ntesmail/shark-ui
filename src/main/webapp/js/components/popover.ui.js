/**
 * @author sweetyx
 * @description 提示框插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');
(function($) {
    var template = Templates.popover;
    var templateFun = Templates.templateAoT(template);
    //初始化popover的dom
    function initDom(actionObj, config) {
        var templateData = {
            title: config.title,
            content: config.content
        };
        actionObj.component = $(templateFun.apply(templateData));
        actionObj.component.attr('id', UI.createUUID());
        return actionObj;
    }
    //初始化事件
    function initEvents(actionObj, config) {
        var origin = actionObj.origin;
        var popover = actionObj.component;
        if (origin.length == 0) {
            return;
        }
        if (config.event === 'click') {
            origin.on('click.popover', BaseComponent.filterComponentAction(actionObj, function(evt) {
                if (popover.is(':hidden')) {
                    actionObj.show();
                } else {
                    actionObj.hide();
                }
            }));
            if (config.close === 'bodyclick') {
                UI.addCloseListener(popover.attr('id'), [origin, popover], function() {
                    if (popover.is(':visible')) {
                        actionObj.hide();
                    }
                });
            }
        } else if (config.event === 'mouseover') {
            origin.on('mouseover.popover', BaseComponent.filterComponentAction(actionObj, function(evt) {
                actionObj.show();
            }));
            origin.on('mouseout.popover', BaseComponent.filterComponentAction(actionObj, function(evt) {
                actionObj.hide();
            }));
        }
    }
    //通用方法popover应展示的位置
    var getPopoverPos = function(actionObj, direction) {
        var origin = actionObj.origin;
        var popover = actionObj.component;
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
            return getPopoverPos(actionObj, postion.actualDirection);
        }
        return postion;
    };
    //利用通用方法取到的结果postion，修正popover的位置
    var fixPopover = function(actionObj, postion) {
        var origin = actionObj.origin;
        var popover = actionObj.component;
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
                reRenderOnShow: false,
                onShow: function() {},
                onHide: function() {}
            };
            UI.extend(config, options);
            /*********初始化组件*************/
            var actionObj = {};
            initDom.call(this, actionObj, config);
            BaseComponent.addComponentBaseFn(actionObj, config);
            $(document.body).append(actionObj.component);
            if (this === $.fn) {
                actionObj.linkTo = function(target) {
                    actionObj.origin = target;
                    initEvents(actionObj, config);
                };
            } else {
                actionObj.origin = this;
                initEvents(actionObj, config);
            }
            actionObj.adjustPostion = function() {
                var postion = getPopoverPos(actionObj, config.direction);
                fixPopover(actionObj, postion);
            };
            actionObj.show = function() {
                if (config.reRenderOnShow) {
                    actionObj.component.find('.popover-title').html(config.title);
                    actionObj.component.find('.popover-content').html(config.content);
                }
                actionObj.component.show();
                actionObj.adjustPostion();
                if (typeof config.onShow === 'function') {
                    config.onShow.call(actionObj);
                }
            };
            actionObj.hide = function() {
                actionObj.component.hide();
                if (typeof config.onHide === 'function') {
                    config.onHide.call(actionObj);
                }
            };
            actionObj.destroy = function() {
                UI.removeCloseListener(actionObj.component.attr('id'));
                actionObj.component.remove();
                if (actionObj.origin) {
                    actionObj.origin.off('click.popover mouseover.popover mouseout.popover');
                }
                actionObj = null;
            };
            return actionObj;
        },
        sharkTooltip: function(options) {
            options.event = 'mouseover';
            var actionObj = this.sharkPopover(options);
            actionObj.component.addClass('shark-tooltip');
            return actionObj;
        }
    });
})(jQuery || $);
