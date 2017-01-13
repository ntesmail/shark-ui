/**
 * @author sweetyx
 * 提供操作组件的一些公共方法
 */
var UI = require('../common/core');
/**
 * 初始化组件对象的公共函数，设置公共组件的一些公共方法，
 * @param {component} 组件对象
 * @param {object} 配置项
 */
function addComponentBaseFn(component, config) {
    // 不对外暴露setConfig方法，是因为setConfig之后有些参数能立即生效，有些参数需要重新渲染组件才能生效，无法做到统一
    // 如果需要重新配置和渲染组件，请手动调用component.destroy()方法先销毁组件，再重新生成组件。
    // component.setConfig = function(options) {
    //     UI.extend(config, options);
    //     return component;
    // };
    component.getConfig = function() {
        return config;
    };
    component.disable = function() {
        component.addClass('disabled').attr('disabled', true).find('input').attr('disabled', true);
        if (typeof config.onDisable === 'function') {
            config.onDisable.call(component);
        }
        return component;
    };
    component.enable = function() {
        component.removeClass('disabled').attr('disabled', false).find('input').attr('disabled', false);
        if (typeof config.onEnable === 'function') {
            config.onEnable.call(component);
        }
        return component;
    };
    return component;
}
/**
 * 绑定组件对象前的过滤函数，用来阻止某些状态下不应该触发的事件。
 * @param  {component} 组件对象
 * @param  {Function} 实际绑定事件的函数
 * @return {Function}
 */
function filterComponentAction(component, fn) {
    return function(evt) {
        if (component.hasClass('disabled')) {
            return;
        }
        fn.apply(this, arguments);
    };
}
var BaseComponent = {
    addComponentBaseFn: addComponentBaseFn,
    filterComponentAction: filterComponentAction
};
module.exports = BaseComponent;
