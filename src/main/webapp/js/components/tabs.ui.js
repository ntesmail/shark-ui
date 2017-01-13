/**
 * @author lingqiao
 * @description tabs插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');
(function($) {
    var template = Templates.tabs;
    var templateFun = Templates.templateAoT(template);
    //初始化dom
    function initDom(config) {
        var templateData = {
            tabs: config.tabs,
            active: config.active
        };
        var tabs = $(templateFun.apply(templateData));
        tabs.attr('id', UI.createUUID());
        return tabs;
    }
    // 初始化事件
    function initEvents(tabs, menu, tabpane, config) {
        tabs.on(config.event, '.nav-tabs li', BaseComponent.filterComponentAction(tabs, function(e) {
            var index = $(this).index();
            switchTo(tabs, menu, tabpane, index, config.onTabSwitch);
        }));
    }
    // 自动切换
    function autoSwitch(tabs, menu, tabpane, config) {
        if (!config.auto) {
            return;
        }
        doAutoSwitch(tabs, menu, tabpane, config);
        tabs.hover(function() {
            if (typeof tabs.timer === 'number') {
                clearInterval(tabs.timer);
                tabs.timer = null;
            }
        }, function() {
            doAutoSwitch(tabs, menu, tabpane, config);
        });
    }
    // 执行自动切换
    function doAutoSwitch(tabs, menu, tabpane, config) {
        tabs.timer = setInterval(function() {
            var index = menu.find('li.active').index() + 1;
            switchTo(tabs, menu, tabpane, index, config.onTabSwitch);
        }, config.auto);
    }
    // 切换tab
    function switchTo(tabs, menu, tabpane, index, cb) {
        var len = menu.find('li').length;
        index = index % len;
        var activeIndex = menu.find('li.active').index();
        if (index === activeIndex) {
            return;
        }
        menu.children().siblings().removeClass('active').end().eq(index).addClass('active');
        tabpane.siblings().removeClass('active').end().eq(index).addClass('active');
        if (typeof cb === 'function') {
            cb.call(tabs, index);
        }
    }

    $.fn.extend({
        sharkTabs: function(options) {
            /*********默认参数配置*************/
            var config = {
                event: 'click',
                active: 0,
                auto: 0,
                onTabSwitch: function() {}
            };
            var origin = $(this);
            var tabs;
            var menu;
            var tabpane;
            UI.extend(config, options);
            if (this === $.fn) {
                tabs = initDom(config);
            } else {
                tabs = this;
                tabs.addClass('shark-tabs');
            }
            BaseComponent.addComponentBaseFn(tabs, config);
            menu = tabs.find('.nav-tabs');
            tabpane = tabs.find('.tab-pane');
            initEvents(tabs, menu, tabpane, config);
            if (!UI.isEmpty(config.active)) {
                switchTo(tabs, menu, tabpane, config.active);
            }
            if (config.auto) {
                autoSwitch(tabs, menu, tabpane, config);
            }
            tabs.destroy = function() {
                if (typeof tabs.timer === 'number') {
                    clearInterval(tabs.timer);
                }
                tabs.remove();
                tabs = null;
            };
            tabs.switchTo = function(index, cb) {
                var callback;
                if (cb === true) {
                    callback = config.onTabSwitch;
                } else if (typeof cb === 'function') {
                    callback = cb;
                } else {
                    callback = false;
                }
                switchTo(tabs, menu, tabpane, index, callback);
            };
            return tabs;
        }
    });
})(jQuery || $);
