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
    function initDom(config) {
        var templateData = {
            animate: config.animate,
            size: config.size,
            content: config.content
        };
        var modal = $(templateFun.apply(templateData));
        modal.attr('id', UI.createUUID());
        return modal;
    }

    // 初始化事件
    function initEvents(modal, config, dtd) {
        modal.on('click.modal', '.js-ok,.js-cancel,.close', BaseComponent.filterComponentAction(modal, function(evt) {
            var curEle = $(this);
            if (config.type === 'confirm' && curEle.hasClass('js-ok')) {
                dtd.resolve();
            }
            if (config.type === 'confirm' && curEle.hasClass('js-cancel')) {
                dtd.reject();
            }
            modal.hideMe();
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
            config.type = 'modal';
            var body = $(document.body);
            var modal = initDom(config);
            var backdropEle;
            body.append(modal);
            BaseComponent.addComponentBaseFn(modal, config);
            if (config.backdrop !== 'static') {
                modal.on('click', function(evt) {
                    if (evt.target === evt.currentTarget) {
                        modal.hideMe();
                    }
                });
            }
            initEvents(modal, config);
            modal.showMe = function() {
                backdropEle = $('<div class="modal-backdrop ' + config.animate + ' in"></div>');
                body.append(backdropEle);
                body.addClass('modal-open');
                modal.show();
                modal.scrollTop(0); //触发重绘
                modal.addClass('in');
                if (typeof config.onShow === 'function') {
                    config.onShow.call(modal);
                }
            };
            modal.hideMe = function() {
                backdropEle.remove();
                body.removeClass('modal-open');
                modal.hide();
                modal.removeClass('in');
                if (typeof config.onHide === 'function') {
                    config.onHide.call(modal);
                }
            };
            modal.destroy = function() {
                if (backdropEle) {
                    backdropEle.remove();
                }
                modal.remove();
                modal = null;
            };
            return modal;
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
            config.backdrop = 'static';
            config.type = 'confirm';
            var templateData = {
                title: config.title,
                content: config.content,
                okText: config.okText,
                cancelText: config.cancelText
            };
            config.content = templateConfirmFun.apply(templateData);
            var confirm = $.fn.sharkModal(config);
            confirm.addClass('shark-confirm');
            confirm.showMe();
            initEvents(confirm, config, deffer);
            return deffer.promise();
        },
        sharkAlert: function(options) {
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
            config.backdrop = 'static';
            config.type = 'alert';
            var templateData = {
                title: config.title,
                content: config.content,
                okText: config.okText
            };
            config.content = templateConfirmFun.apply(templateData);
            var alert = $.fn.sharkModal(config);
            alert.addClass('shark-alert');
            initEvents(alert, config);
            alert.showMe();
        }
    });
})(jQuery || $);
