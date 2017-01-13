/**
 * @author sweetyx
 * @description 提示框插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');
(function ($) {
    var template = Templates.popover;
    var templateFun = Templates.templateAoT(template);
    //初始化popover的dom
    function initDom(config) {
        var templateData = {
            title: config.title,
            content: config.content
        };
        var popover = $(templateFun.apply(templateData));
        popover.attr('id', UI.createUUID());
        return popover;
    }
    //初始化事件
    function initEvents(origin, popover, config) {
        if (origin.length == 0) {
            return;
        }
        if (config.event === 'click') {
            origin.on('click.popover', BaseComponent.filterComponentAction(popover, function (evt) {
                if (popover.is(':hidden')) {
                    popover.showMe();
                } else {
                    popover.hideMe();
                }
            }));
            if (config.close === 'bodyclick') {
                UI.addCloseListener(popover.attr('id'), [origin, popover], function () {
                    if (popover.is(':visible')) {
                        popover.hideMe();
                    }
                });
            }
        } else if (config.event === 'mouseover') {
            origin.on('mouseover.popover', BaseComponent.filterComponentAction(popover, function (evt) {
                popover.showMe();
            }));
            origin.on('mouseout.popover', BaseComponent.filterComponentAction(popover, function (evt) {
                popover.hideMe();
            }));
        }
    }
    //通用方法popover应展示的位置
    var getPopoverPos = function (origin, popover, direction) {
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
            return getPopoverPos(origin, popover, postion.actualDirection);
        }
        return postion;
    };
    //利用通用方法取到的结果postion，修正popover的位置
    var fixPopover = function (origin, popover, postion) {
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
        sharkPopover: function (options) {
            /*********默认参数配置*************/
            var config = {
                event: 'click',
                close: 'bodyclick',
                direction: 'right',
                title: '',
                content: '',
                reRenderOnShow: false,
                onShow: function () { },
                onHide: function () { }
            };
            UI.extend(config, options);
            var origin;
            var popover = initDom(config);
            BaseComponent.addComponentBaseFn(popover, config);
            $(document.body).append(popover);
            if(this === $.fn){
                popover.linkTo = function (target) {
                    origin = target;
                    initEvents(origin, popover, config);
                };
            }
            else{
                origin = this;
                initEvents(origin, popover, config);
            }
            popover.adjustPostion = function () {
                var postion = getPopoverPos(origin, popover, config.direction);
                fixPopover(origin, popover, postion);
                return popover;
            };
            popover.showMe = function () {
                if (config.reRenderOnShow) {
                    popover.find('.popover-title').html(config.title);
                    popover.find('.popover-content').html(config.content);
                }
                popover.show();
                popover.adjustPostion();
                if (typeof config.onShow === 'function') {
                    config.onShow.call(popover);
                }
            };
            popover.hideMe = function () {
                popover.hide();
                if (typeof config.onHide === 'function') {
                    config.onHide.call(popover);
                }
            };
            popover.destroy = function () {
                UI.removeCloseListener(popover.attr('id'));
                if(origin){
                    origin.off('click.popover mouseover.popover mouseout.popover');
                    origin = null;
                }
                popover.remove();
                popover = null;
            };
            return popover;
        },
        sharkTooltip: function (options) {
            options.event = 'mouseover';
            var tooltip = this.sharkPopover(options);
            tooltip.addClass('shark-tooltip');
            return tooltip;
        }
    });
})(jQuery || $);
