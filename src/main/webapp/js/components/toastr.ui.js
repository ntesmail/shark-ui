/**
 * @author lingqiao
 * @description 提示框插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');
(function($) {
    var template = Templates.toastr;
    var templateFun = Templates.templateAoT(template);
    var container; // toastr的父容器
    var toastrArr = [];

    // 创建父容器
    function initContainer() {
        container = $('<div class="shark-toastr-container"></div>');
        $(document.body).append(container);
    }

    //移除toastr
    function doDestroy(toastr) {
        // todo animate
        toastr.hide();
        clearTimeout(toastr.timer);
        toastr.remove();
    }

    // 从队列中移除toastr
    function destroyToastrs(id) {
        for (var i = 0; i < toastrArr.length; i++) {
            var toastr = toastrArr[i];
            if (id) {
                if (toastr.id === id) {
                    doDestroy(toastr);
                    toastrArr.splice(i, 1);
                    break;
                }
            } else {
                doDestroy(toastr);
                toastrArr.splice(i, 1);
                i--;
            }
        }
    }

    //初始化toastr的dom
    function initDom(config) {
        var templateData = {
            type: config.type,
            content: config.content
        };
        var toastr = $(templateFun.apply(templateData));
        var id = UI.createUUID();
        toastr.attr('id', id);
        toastr.id = id;
        return toastr;
    }

    // 显示toastr
    function showToastr(toastr, config) {
        // todo animate
        toastr.show();
        toastr.timer = setTimeout(function() {
            destroyToastrs(toastr.id);
        }, config.duration);
    }

    $.fn.extend({
        sharkToastr: function(options) {
            /*********默认参数配置*************/
            var config = {
                content: '', // 提示内容
                type: 'success', // 提示类型
                duration: 2000, // 停留时间
                clickToHide: false
            };
            UI.extend(config, options);
            // 如果父容器不存在，则创建父容器
            if (!container) {
                initContainer();
            }
            var toastr = initDom(config);
            if (!$.fn.sharkToastr.multiply) {
                destroyToastrs();
            }
            // 只显示一个toastr的情况，要先清空再推入数组
            toastrArr.push(toastr);
            container.prepend(toastr);
            BaseComponent.addComponentBaseFn(toastr, config);
            if (config.clickToHide) {
                toastr.on('click', function() {
                    destroyToastrs(toastr.id);
                });
            }
            showToastr(toastr, config);
        }
    });
    $.fn.sharkToastr.multiply = false;
})(jQuery || $);
