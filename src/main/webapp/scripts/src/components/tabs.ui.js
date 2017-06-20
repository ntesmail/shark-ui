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
    tabs.on('click.tabs', '.nav-tabs li', BaseComponent.filterComponentAction(sharkComponent, function (e) {
        var index = $(this).index();
        switchTo(sharkComponent, index, config.onTabSwitch);
    }));
}
// 切换到某个tab
function switchTo(sharkComponent, index, cb) {
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
// 开始自动切换
function startAutoSwitch(sharkComponent, config) {
    var tabs = sharkComponent.component;
    doAutoSwitch(sharkComponent, config);
    tabs.on('mouseover.tabs', function () {
        clearInterval(sharkComponent.autoSwitchTimer);
        sharkComponent.autoSwitchTimer = null;
    });
    tabs.on('mouseout.tabs', function () {
        doAutoSwitch(sharkComponent, config);
    });
}
// 执行自动切换
function doAutoSwitch(sharkComponent, config) {
    var tabs = sharkComponent.component;
    var menu = tabs.find('.nav-tabs');
    sharkComponent.autoSwitchTimer = setInterval(function () {
        var index = menu.find('li.active').index() + 1;
        switchTo(sharkComponent, index, config.onTabSwitch);
    }, config.auto);
}
// 结束自动切换
function stopAutoSwitch(sharkComponent) {
    var tabs = sharkComponent.component;
    clearInterval(sharkComponent.autoSwitchTimer);
    sharkComponent.autoSwitchTimer = null;
    tabs.off('mouseover.tabs').off('mouseout.tabs');
}

SharkUI.sharkTabs = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        tabs: [],
        initTab: 0,
        dom: '',
        onTabSwitch: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config, targetElement);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);
    switchTo(sharkComponent, config.initTab);
    //切换至某个tab
    sharkComponent.switchTo = function (index, cb) {
        var callback;
        if (cb === true) {
            callback = config.onTabSwitch;
        } else if (typeof cb === 'function') {
            callback = cb;
        } else {
            callback = false;
        }
        switchTo(sharkComponent, index, callback);
    };
    //开启自动切换
    sharkComponent.startAutoSwitch = function (auto) {
        if (/^[1-9]{1,}[0-9]*$/.test(auto)) {
            //正整数
            config.auto = auto;
            startAutoSwitch(sharkComponent, config);
        }
    };
    //关闭自动切换
    sharkComponent.stopAutoSwitch = function () {
        stopAutoSwitch(sharkComponent);
    };
    //销毁
    sharkComponent.destroy = function () {
        stopAutoSwitch(sharkComponent);
        if (sharkComponent.createType === 'construct') {
            sharkComponent.component.remove();
        } else {
            sharkComponent.component.off('click.tabs');
        }
        sharkComponent = null;
    };
    return sharkComponent;
}