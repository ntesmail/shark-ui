/**
 * @author sweetyx & lingqiao
 * @description selecter插件和dropdown插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Event } from '../common/event';
import { DomHelper } from '../common/domhelper';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
import { ListGroup } from './listgroup.ui';

// selecter模板
var templateSelecter = Templates.selecter;
var templateSelecterFun = Templates.templateAoT(templateSelecter);
// 初始化selecter的dom
function initDom(sharkComponent, config, targetElement) {
    if (!targetElement) {
        sharkComponent.createType = 'construct';
        var fun = config.dom ? Templates.templateAoT(config.dom) : templateSelecterFun;
        var html = fun.apply(config);
        sharkComponent.component = $(html);
    } else {
        sharkComponent.createType = 'normal';
        sharkComponent.component = targetElement;
    }
    sharkComponent.component.addClass('shark-selecter');
    return sharkComponent;
}
// 初始化下拉列表的的dom
function initSelectionsDom(sharkComponent, config) {
    var selections = ListGroup.render();
    selections.addClass('shark-selecter-list-group');
    ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
    sharkComponent.selections = selections;
    $(document.body).append(selections);
}
// 初始化下拉列表事件
function initSelectionsEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    selections.on('click', '.list-group-item', function (evt) {
        var item = $(this);
        //设置值
        var value = item.data('value');
        sharkComponent.setValue(value, true);
        //收起待选列表
        selecter.removeClass('open');
        selections.hide();
    });
    // 点击除了组件之外的地方，收起下拉列表
    Event.addCloseListener(selections.attr('id'), [selecter, selections], function () {
        if (!selections.is(':hidden')) {
            selecter.removeClass('open');
            selections.hide();
        }
    });
}
// 初始化事件
function initEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    selecter.on('click.selecter', '.selecter', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.selections) {
            // 如果还没有初始化过selections，在这里先初始化
            initSelectionsDom(sharkComponent, config);
            initSelectionsEvents(sharkComponent, config);
        }
        var selections = sharkComponent.selections;
        if (selections.is(':hidden')) {
            renderGroupList(sharkComponent, config);
            var postion = DomHelper.calcOffset(selecter, selections, 'bottom');
            selections.css(postion);
            //显示待选列表
            selecter.addClass('open');
            selections.show();
            //设置待选列表样式
            selections.css({
                width: selecter.outerWidth()
            });
        } else {
            //隐藏待选列表
            selecter.removeClass('open');
            selections.hide();
        }
    }));
}
// 渲染下拉列表
function renderGroupList(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    var value = sharkComponent.data[config.actualKey];
    var activeLi;
    //允许值为空字符串
    if (typeof value !== 'undefined' && value !== null) {
        activeLi = selections.find('.list-group-item[value="' + value + '"]');
        if (activeLi.length > 0) {
            activeLi.siblings().removeClass('active');
            activeLi.addClass('active');
            if (config.activeStyle) {
                activeLi.siblings().removeClass(config.activeStyle);
                activeLi.addClass(config.activeStyle);
            }
        }
    }
    if (!activeLi || activeLi.length == 0) {
        selections.children().removeClass('active');
        if (config.activeStyle) {
            selections.children().removeClass(config.activeStyle);
        }
    }
}

SharkUI.sharkSelecter = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        activeStyle: null, // point | nike
        data: null,
        actualKey: 'value',
        displayKey: 'name',
        dom: '',
        onSelected: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config, targetElement);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);
    sharkComponent.data = {};
    sharkComponent.setValue = function (v, docallback) {
        var itemData = {};
        var oldData = sharkComponent.data;
        //允许值为空字符串
        if (typeof v !== 'undefined' && v !== null) {
            for (var i = 0; i < config.data.length; i++) {
                if (v === config.data[i][config.actualKey]) {
                    itemData = config.data[i];
                    break;
                }
            }
        }
        if (oldData[config.actualKey] != itemData[config.actualKey]) {
            //设置新值
            $.isEmptyObject(itemData) ? sharkComponent.data = {} : sharkComponent.data = itemData;
            var valuelabel = sharkComponent.component.find('.value');
            valuelabel.text(SharkUI.isEmpty(itemData[config.displayKey]) ? '' : itemData[config.displayKey]);
            //触发回调函数
            if (docallback && typeof config.onSelected === 'function') {
                config.onSelected.call(sharkComponent, itemData[config.actualKey], itemData);
            }
        }
    };
    sharkComponent.getValue = function () {
        return sharkComponent.data[config.actualKey];
    };
    sharkComponent.destroy = function () {
        if (sharkComponent.selections) {
            Event.removeCloseListener(sharkComponent.selections.attr('id'));
            sharkComponent.selections.destroy();
        }
        // 销毁component
        if (sharkComponent.createType === 'construct') {
            sharkComponent.component.remove();
        } else {
            sharkComponent.component.off('click.selecter');
        }
        sharkComponent = null;
    };
    return sharkComponent;
}