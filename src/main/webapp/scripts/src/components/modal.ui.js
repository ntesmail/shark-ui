/**
 * @author sweetyx
 * @description 弹窗插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
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

SharkUI.sharkModal = function (options) {
    /*********默认参数配置*************/
    var config = {
        animate: 'fade',
        size: 'lg',
        backdrop: '',
        content: '',
        onShow: function () { },
        onHide: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var body = $(document.body);
    var sharkComponent = {};
    initDom.call(this, sharkComponent, config);
    var backdropEle;
    body.append(sharkComponent.component);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    sharkComponent.show = function () {
        var defer = $.Deferred();
        backdropEle = $('<div class="modal-backdrop ' + config.animate + ' in"></div>');
        body.append(backdropEle);
        body.addClass('modal-open');
        sharkComponent.component.show();
        sharkComponent.component.scrollTop(0); //触发重绘
        sharkComponent.component.addClass('in');
        sharkComponent.defer = defer;
        if (typeof config.onShow === 'function') {
            config.onShow.call(sharkComponent);
        }
        return defer.promise();
    };
    sharkComponent.hide = function () {
        backdropEle.remove();
        body.removeClass('modal-open');
        sharkComponent.component.hide();
        sharkComponent.component.removeClass('in');
        if (backdropEle) {
            backdropEle.remove();
        }
        sharkComponent.component.remove();
        if (typeof config.onHide === 'function') {
            config.onHide.call(sharkComponent);
        }
        sharkComponent = null;
    };
    sharkComponent.addResolveTarget = function (target) {
        sharkComponent.component.on('click.modal', target, sharkComponent, function (evt) {
            sharkComponent.defer.resolve(evt);
            sharkComponent.hide();
        });
        return sharkComponent;
    };
    sharkComponent.addRejectTarget = function (target) {
        sharkComponent.component.on('click.modal', target, sharkComponent, function (evt) {
            sharkComponent.defer.reject(evt);
            sharkComponent.hide();
        });
        return sharkComponent;
    };
    if (config.backdrop !== 'static') {
        sharkComponent.component.on('click', function (evt) {
            if (evt.target === evt.currentTarget) {
                sharkComponent.defer.reject(evt);
                sharkComponent.hide();
            }
        });
    }
    sharkComponent.addResolveTarget('.js-ok');
    sharkComponent.addRejectTarget('.js-cancel');
    return sharkComponent;
};
SharkUI.sharkConfirm = function (options) {
    /*********默认参数配置*************/
    var config = {
        animate: 'fade',
        size: '',
        title: '提示',
        content: '',
        okText: '确定',
        cancelText: '取消',
        onShow: function () { },
        onHide: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    config.backdrop = 'static';
    var templateData = {
        title: config.title,
        content: config.content,
        okText: config.okText,
        cancelText: config.cancelText
    };
    config.content = templateConfirmFun.apply(templateData);
    var sharkComponent = SharkUI.sharkModal(config);
    return sharkComponent.show();
};
SharkUI.sharkAlert = function (options) {
    /*********默认参数配置*************/
    var config = {
        animate: 'fade',
        size: '',
        title: '提示',
        content: '',
        okText: '确定',
        onShow: function () { },
        onHide: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    config.backdrop = 'static';
    var templateData = {
        title: config.title,
        content: config.content,
        okText: config.okText
    };
    config.content = templateConfirmFun.apply(templateData);
    var sharkComponent = SharkUI.sharkModal(config);
    return sharkComponent.show();
}
