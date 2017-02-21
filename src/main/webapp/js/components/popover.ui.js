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
    function initDom(sharkComponent, config) {
        var templateData = {
            title: config.title,
            content: config.content
        };
        sharkComponent.component = $(templateFun.apply(templateData));
        sharkComponent.component.attr('id', UI.createUUID());
        return sharkComponent;
    }
    //初始化事件
    function initEvents(sharkComponent, config) {
        var origin = sharkComponent.origin;
        var popover = sharkComponent.component;
        if (origin.length == 0) {
            return;
        }
        if (config.event === 'click') {
            origin.on('click.popover', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
                if (popover.is(':hidden')) {
                    sharkComponent.show();
                } else {
                    sharkComponent.hide();
                }
            }));
            if (config.close === 'bodyclick') {
                UI.addCloseListener(popover.attr('id'), [origin, popover], function() {
                    if (popover.is(':visible')) {
                        sharkComponent.hide();
                    }
                });
            }
        } else if (config.event === 'mouseover') {
            origin.on('mouseover.popover', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
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
                reRenderOnShow: false,
                onShow: function() {},
                onHide: function() {}
            };
            UI.extend(config, options);
            /*********初始化组件*************/
            var sharkComponent = {};
            initDom.call(this, sharkComponent, config);
            BaseComponent.addComponentBaseFn(sharkComponent, config);
            $(document.body).append(sharkComponent.component);
            if (this === $.fn) {
                sharkComponent.linkTo = function(target) {
                    sharkComponent.origin = target;
                    initEvents(sharkComponent, config);
                };
            } else {
                sharkComponent.origin = this;
                initEvents(sharkComponent, config);
            }
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
                UI.removeCloseListener(sharkComponent.component.attr('id'));
                sharkComponent.component.remove();
                if (sharkComponent.origin) {
                    sharkComponent.origin.off('click.popover mouseover.popover mouseout.popover');
                }
                sharkComponent = null;
            };
            return sharkComponent;
        },
        sharkTooltip: function(options) {
            options.event = 'mouseover';
            var sharkComponent = this.sharkPopover(options);
            sharkComponent.component.addClass('shark-tooltip');
            return sharkComponent;
        }
    });
})(jQuery || $);
