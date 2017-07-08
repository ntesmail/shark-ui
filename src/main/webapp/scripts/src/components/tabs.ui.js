/**
 * @author lingqiao
 * @description tabs插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
var template = Templates.tabs;
var templateFun = Templates.templateAoT(template);
// 初始化tabs的dom
function initDom(sharkComponent, config, targetElement) {
    if (!targetElement) {
        sharkComponent.createType = 'construct';
        var fun = config.dom ? Templates.templateAoT(config.dom) : templateFun;
        var html = fun.apply(config);
        sharkComponent.component = $(html);
    } else {
        sharkComponent.createType = 'normal';
        sharkComponent.component = $(targetElement);
    }
    sharkComponent.component.addClass('shark-tabs');
    return sharkComponent;
}
// 初始化事件
function initEvents(sharkComponent, config) {
    var tabs = sharkComponent.component;
    tabs.on('click.tabs', '.nav-tabs li', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        var index = $(this).index();
        var preventDefault = false;
        if (typeof config.onTabWillSwitch === 'function') {
            preventDefault = config.onTabWillSwitch.call(sharkComponent, index, evt) === false ? true : false;
        }
        if (preventDefault === false) {
            sharkComponent.switchTo(index, config.onTabSwitched);
        }
        // var index = $(this).index();
        // sharkComponent.switchTo(index, config.onTabSwitched);
    }));
}
// 切换到某个tab
function doSwitch(sharkComponent, index, cb) {
    var tabs = sharkComponent.component;
    var menu = tabs.find('.nav-tabs');
    var tabpane = tabs.find('.tab-pane');
    var len = menu.find('li').length;
    index = index % len;
    var activeIndex = menu.find('li.active').index();
    if (index === activeIndex) {
        return;
    }
    menu.children().siblings().removeClass('active').end().eq(index).addClass('active');
    tabpane.siblings().removeClass('active').end().eq(index).addClass('active');
    if (typeof cb === 'function') {
        cb.call(sharkComponent, index);
    }
}

SharkUI.sharkTabs = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        tabs: [],
        initTab: 0,
        dom: '',
        onTabWillSwitch: function () { },
        onTabSwitched: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config, targetElement);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);
    //切换至某个tab
    sharkComponent.switchTo = function (index, cb) {
        var callback;
        if (cb === true) {
            callback = config.onTabSwitched;
        } else if (typeof cb === 'function') {
            callback = cb;
        } else {
            callback = false;
        }
        doSwitch(sharkComponent, index, callback);
    };
    sharkComponent.switchTo(config.initTab);
    //销毁
    sharkComponent.destroy = function () {
        if (sharkComponent.createType === 'construct') {
            sharkComponent.component.remove();
        } else {
            sharkComponent.component.off('click.tabs');
        }
        sharkComponent = null;
    };
    return sharkComponent;
}