/**
 * @author sweetyx
 * @description 提示框插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
var template = Templates.notify;
var templateFun = Templates.templateAoT(template);
var container; // toastr的父容器
var notifyArr = [];
// 创建父容器
function initContainer() {
    container = $('<div class="notify-container"></div>');
    $(document.body).append(container);
}
//初始化toastr的dom
function initDom(sharkComponent, config) {
    var templateData = {
        type: config.type,
        title: config.title,
        desc: config.desc
    };
    sharkComponent.component = $(templateFun.apply(templateData));
    sharkComponent.notifyId = SharkUI.createUUID();
    return sharkComponent;
}
//移除toastr
function doDestroy(sharkComponent) {
    var notify = sharkComponent.component;
    notify.css('animation-name', 'NotifyMoveOut');
    var timeoutId = setTimeout(function () {
        if (sharkComponent) {
            clearTimeout(sharkComponent.timer);
            notify.hide();
            notify.remove();
            sharkComponent = null;
        }
    }, 300);
    notify.on('animationend', function () {
        if (sharkComponent) {
            clearTimeout(timeoutId);
            clearTimeout(sharkComponent.timer);
            notify.hide();
            notify.remove();
            sharkComponent = null;
        }
    });
    if (typeof sharkComponent.getConfig().onClose === 'function') {
        sharkComponent.getConfig().onClose.call(sharkComponent, sharkComponent);
    }
}
// 从队列中移除toastr
function destroyNotify(id) {
    for (var i = 0; i < notifyArr.length; i++) {
        var component = notifyArr[i];
        if (id) {
            if (component.notifyId === id) {
                doDestroy(component);
                notifyArr.splice(i, 1);
                break;
            }
        } else {
            doDestroy(component);
            notifyArr.splice(i, 1);
            i--;
        }
    }
}
// 显示toastr
function showNotify(sharkComponent, config) {
    var notify = sharkComponent.component;
    container.append(notify);
    notify.css('animation-name', 'NotifyMoveIn');
    notify.show();
    if (config.autoclose) {
        sharkComponent.timer = setTimeout(function () {
            destroyNotify(sharkComponent.notifyId);
        }, config.duration);
    }
    else {
        notify.find('.notify-close').on('click', function (evt) {
            destroyNotify(sharkComponent.notifyId);
        });
    }
}
SharkUI.sharkNotify = function (options) {
    /*********默认参数配置*************/
    var config = {
        type: 'success',
        title: '',
        desc: '',
        autoclose: false, //是否自动关闭
        duration: 5000, // 停留时间
        onClose: function () { }
    };
    SharkUI.extend(config, options);
    if (!container) {
        // 如果父容器不存在，则创建父容器
        initContainer();
    }
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    notifyArr.push(sharkComponent);
    showNotify(sharkComponent, config);
    return sharkComponent;
}
