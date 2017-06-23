/**
 * @author lingqiao
 * @description multiselecter插件
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
// multiselections模板
var templateMultiselections = Templates.multiselections;
var templateMultiselectionsFun = Templates.templateAoT(templateMultiselections);

// 初始化selecter的dom
function initDom(sharkComponent, config, targetElement) {
    if (!targetElement) {
        sharkComponent.createType = 'construct';
        var fun = config.dom ? Templates.templateAoT(config.dom) : templateSelecterFun;
        var html = fun.apply(config);
        sharkComponent.component = $(html);
    } else {
        sharkComponent.createType = 'normal';
        sharkComponent.component = $(targetElement);
    }
    sharkComponent.component.addClass('shark-multiselecter');
    return sharkComponent;
}

// 创建一个存放多级下拉菜单的容器
function initContainerDom(sharkComponent, config) {
    return $(templateMultiselectionsFun.apply(config));
}

// 创建下拉菜单
function initSelectionsDom(sharkComponent, config) {
    var selections = ListGroup.render();
    selections.addClass('shark-multiselecter-list-group');
    ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
    return selections;
}

// 移除下拉菜单及其子菜单（如果是一级下拉菜单，只是隐藏，不移除）
function removeSelectionsAndChildren(sharkComponent, selections) {
    if (selections) {
        // 菜单容器
        var container = sharkComponent.container;
        // 一级菜单
        var topSelections = sharkComponent.topSelections;
        // 子菜单
        var children = selections.data('selections');
        if (children) {
            // 递归移除
            removeSelectionsAndChildren(sharkComponent, children);
        }
        selections.selection = null;
        if (selections === topSelections) {
            selections.hide();
        } else {
            selections.remove();
        }
    }
}

// 初始化事件
function initEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    selecter.on('click.selecter', '.selecter', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.container) {
            // 如果还没有添加容器，在这里添加
            var container = initContainerDom(sharkComponent, config);
            // 在容器中添加一级菜单
            // 一级菜单
            var selections = initSelectionsDom(sharkComponent, config);
            container.append(selections);
            // 将容器及一级菜单存放在组件对象上
            sharkComponent.container = container;
            sharkComponent.topSelections = selections;

            $(document.body).append(container);
            initSelectionsEvents(sharkComponent, config);
        }
        // 一级菜单
        var selections = sharkComponent.topSelections;
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
            selecter.trigger('focusout');
        }
    }));
}

// 初始化下拉列表事件
function initSelectionsEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var topSelections = sharkComponent.topSelections;
    var container = sharkComponent.container;

    // 鼠标移入菜单中的item
    container.on('mouseenter', '.list-group-item', function (evt) {
        var item = $(this);
        var data = item.data();
        var parentUl = item.parent('.shark-multiselecter-list-group');
        removeSelectionsAndChildren(sharkComponent, parentUl.data('selections'));
        if (data.children) {
            var conf = {
                data: data.children,
                actualKey: 'value',
                displayKey: 'name'
            };
            var selections = initSelectionsDom(sharkComponent, conf);
            parentUl.selections = selections;
            container.append(selections);
            parentUl.data('selections', selections);
            var postion = DomHelper.calcOffset(item, selections, 'right');
            selections.css(postion);
            selections.show();
        }
    });

    container.on('mouseout', '.shark-multiselecter-list-group', function (evt) {
        var item = $(this);
        var toElm = $(evt.toElement);
        if (!toElm.is('.shark-multiselecter-list-group') && !toElm.parents('.shark-multiselecter-list-group').length) {
            //收起待选列表
            removeSelectionsAndChildren(sharkComponent, topSelections);
        }
    });

    container.on('click', '.list-group-item', function (evt) {
        var item = $(this);
        //设置值
        var value = item.data('value');
        sharkComponent.setValue(value, true);
        //收起待选列表
        removeSelectionsAndChildren(sharkComponent, topSelections);
        selecter.trigger('focusout');
    });
}

// 渲染下拉列表
function renderGroupList(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.topSelections;
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

function getItem(v, data, actualKey) {
    for (var i = 0; i < data.length; i++) {
        var children = data[i].children;
        if (v === data[i][actualKey]) {
            return data[i];
        }
        if (children) {
            var item = getItem(v, children, actualKey);
            if (item) {
                return item;
            }
        }
    }
}

SharkUI.sharkMultiSelecter = function (options, targetElement) {
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
            itemData = getItem(v, config.data, config.actualKey);
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