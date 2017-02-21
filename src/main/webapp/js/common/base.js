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
function addComponentBaseFn(actionObj, config) {
    var component = actionObj.component;
    actionObj.getConfig = function() {
        return config;
    };
    actionObj.disable = function() {
        component.addClass('disabled').attr('disabled', true).find('input,select,button').attr('disabled', true);
        if (typeof config.onDisable === 'function') {
            config.onDisable.call(component);
        }
        return actionObj;
    };
    actionObj.enable = function() {
        component.removeClass('disabled').attr('disabled', false).find('input,select,button').attr('disabled', false);
        if (typeof config.onEnable === 'function') {
            config.onEnable.call(component);
        }
        return actionObj;
    };
    return actionObj;
}
/**
 * 绑定组件对象前的过滤函数，用来阻止某些状态下不应该触发的事件。
 * @param  {component} 组件对象
 * @param  {Function} 实际绑定事件的函数
 * @return {Function}
 */
function filterComponentAction(actionObj, fn) {
    var component = actionObj.component;
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
