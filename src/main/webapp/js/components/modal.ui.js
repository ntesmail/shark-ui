/**
 * @author sweetyx
 * @description 弹窗插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');
(function($) {
    var template = Templates.modal;
    var templateFun = Templates.templateAoT(template);

    var templateConfirm = Templates.confirm;
    var templateConfirmFun = Templates.templateAoT(templateConfirm);

    //初始化modal的dom
    function initDom(actionObj, config) {
        var templateData = {
            animate: config.animate,
            size: config.size,
            content: config.content
        };
        actionObj.component = $(templateFun.apply(templateData));
        return actionObj;
    }

    // 初始化事件
    function initEvents(actionObj, config) {
        actionObj.component.on('click.modal', '.js-ok,.js-cancel,.close', BaseComponent.filterComponentAction(actionObj, function(evt) {
            var curEle = $(this);
            if (curEle.hasClass('js-ok')) {
                config.deffer && config.deffer.resolve();
            }
            if (curEle.hasClass('js-cancel')) {
                config.deffer && config.deffer.reject();
            }
            actionObj.hide();
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
            var actionObj = {};
            initDom.call(this, actionObj, config);
            var backdropEle;
            body.append(actionObj.component);
            BaseComponent.addComponentBaseFn(actionObj, config);
            if (config.backdrop !== 'static') {
                actionObj.component.on('click', function(evt) {
                    if (evt.target === evt.currentTarget) {
                        actionObj.hide();
                    }
                });
            }
            initEvents(actionObj, config);
            actionObj.show = function() {
                backdropEle = $('<div class="modal-backdrop ' + config.animate + ' in"></div>');
                body.append(backdropEle);
                body.addClass('modal-open');
                actionObj.component.show();
                actionObj.component.scrollTop(0); //触发重绘
                actionObj.component.addClass('in');
                if (typeof config.onShow === 'function') {
                    config.onShow.call(actionObj);
                }
            };
            actionObj.hide = function() {
                backdropEle.remove();
                body.removeClass('modal-open');
                actionObj.component.hide();
                actionObj.component.removeClass('in');
                if (typeof config.onHide === 'function') {
                    config.onHide.call(actionObj);
                }
            };
            actionObj.destroy = function() {
                if (backdropEle) {
                    backdropEle.remove();
                }
                actionObj.component.remove();
                actionObj = null;
            };
            return actionObj;
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
            var actionObj = $.fn.sharkModal(config);
            actionObj.show();
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
            var actionObj = $.fn.sharkModal(config);
            actionObj.show();
            return deffer.promise();
        }
    });
})(jQuery || $);
