/**
 * @author lingqiao
 * @description 提示框插件
 */
var $ = require('jquery');
var SharkUI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');

var template = Templates.toastr;
var templateFun = Templates.templateAoT(template);
var container; // toastr的父容器
var toastrArr = [];
// 创建父容器
function initContainer() {
    container = $('<div class="shark-toastr-container" style="position:fixed;"></div>');
    $(document.body).append(container);
}
//初始化toastr的dom
function initDom(sharkComponent, config) {
    var templateData = {
        type: config.type,
        content: config.content
    };
    sharkComponent.component = $(templateFun.apply(templateData));
    sharkComponent.toastrId = SharkUI.createUUID();
    return sharkComponent;
}
//移除toastr
function doDestroy(sharkComponent) {
    var toastr = sharkComponent.component;
    clearTimeout(sharkComponent.timer);
    toastr.hide();
    toastr.remove();
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
    toastr.show();
    sharkComponent.toastrTimer = setTimeout(function() {
        destroyToastrs(sharkComponent.toastrId);
    }, config.duration);
}
$.fn.extend({
    sharkToastr: function(options) {
        /*********默认参数配置*************/
        var config = {
            content: '', // 提示内容
            type: 'success', // 提示类型
            duration: 2000 // 停留时间
        };
        SharkUI.extend(config, options);
        if (!container) {
            // 如果父容器不存在，则创建父容器
            initContainer();
        }
        /*********初始化组件*************/
        var sharkComponent = {};
        initDom.call(this, sharkComponent, config);
        BaseComponent.addComponentBaseFn(sharkComponent, config);
        if (!$.fn.sharkToastr.multiply) {
            // 如果不允许展示多个提示，则先清空
            destroyToastrs();
        }
        toastrArr.push(sharkComponent);
        container.prepend(sharkComponent.component);
        showToastr(sharkComponent, config);
    }
});
$.fn.sharkToastr.multiply = true;
