/**
 * @author lingqiao
 * @description 提示框插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
var template = Templates.toastr;
var templateFun = Templates.templateAoT(template);
var container; // toastr的父容器
var toastrArr = [];
// 创建父容器
function initContainer() {
    container = $('<div class="toastr-container"></div>');
    $(document.body).append(container);
}
//初始化toastr的dom
function initDom(sharkComponent, config) {
    var templateData = {
        type: config.type,
        content: config.content,
        contentLink: config.contentLink,
        closeText: config.closeText
    };
    sharkComponent.component = $(templateFun.apply(templateData));
    sharkComponent.toastrId = SharkUI.createUUID();
    return sharkComponent;
}
//移除toastr
function doDestroy(sharkComponent) {
    var toastr = sharkComponent.component;
    toastr.css('animation-name', 'ToastrMoveOut');
    var timeoutId = setTimeout(function () {
        if (sharkComponent) {
            clearTimeout(sharkComponent.timer);
            toastr.hide();
            toastr.remove();
            sharkComponent = null;
        }
    }, 300);
    toastr.on('animationend', function () {
        if (sharkComponent) {
            clearTimeout(timeoutId);
            clearTimeout(sharkComponent.timer);
            toastr.hide();
            toastr.remove();
            sharkComponent = null;
        }
    });
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
    container.append(toastr);
    toastr.css('animation-name', 'ToastrMoveIn');
    toastr.show();
    if (!config.contentLink) {
        sharkComponent.timer = setTimeout(function () {
            destroyToastrs(sharkComponent.toastrId);
        }, config.duration);
    }
    else {
        sharkComponent.promise = new Promise((resolve, reject) => {
            toastr.find('.toastr-message-link').on('click', function (evt) {
                resolve(evt);
            });
            toastr.find('.toastr-close').on('click', function (evt) {
                reject(evt);
            });
        });
        sharkComponent.promise.then(function (data) {
            destroyToastrs(sharkComponent.toastrId);
        }).catch(function (e) {
            destroyToastrs(sharkComponent.toastrId);
        });
    }
}
SharkUI.sharkToastr = function (options) {
    /*********默认参数配置*************/
    var config = {
        content: '', // 提示内容
        type: 'success', // 提示类型
        duration: 2000, // 停留时间
        contentLink: false, //内容是否可点击
        closeText: '' // 
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
    if (!SharkUI.sharkToastr.multiply) {
        // 如果不允许展示多个提示，则先清空
        destroyToastrs();
    }
    toastrArr.push(sharkComponent);
    showToastr(sharkComponent, config);
    return sharkComponent;
}
SharkUI.sharkToastr.multiply = true;
