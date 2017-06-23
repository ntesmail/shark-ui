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
// multiselections容器模板
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
}

// 创建一个存放多级下拉菜单的容器dom
function createContainerDom(sharkComponent, config) {
    return $(templateMultiselectionsFun.apply(config));
}

// 创建下拉菜单dom
function createSelectionsDom(config) {
    var selections = ListGroup.render();
    selections.addClass('shark-multiselecter-list-group');
    ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
    return selections;
}

// 初始化下拉菜单
function initSelections(sharkComponent, config) {
    // 如果还没有添加容器，在这里添加
    var container = createContainerDom(sharkComponent, config);
    // 在容器中添加一级菜单
    // 一级菜单
    var selections = createSelectionsDom(config);
    container.append(selections);
    // 将容器及一级菜单存放在组件对象上
    sharkComponent.container = container;
    sharkComponent.topSelections = selections;
    // 在body中添加容器
    $(document.body).append(container);
}

// 移除下拉菜单及其子菜单（如果是一级下拉菜单，只是隐藏，不移除）
function removeSelectionsAndChildren(sharkComponent, selections) {
    if (selections) {
        // 菜单容器
        var container = sharkComponent.container;
        // 一级菜单
        var topSelections = sharkComponent.topSelections;
        // 子菜单
        var childSelections = selections.data('childSelections');
        if (childSelections) {
            // 递归移除
            removeSelectionsAndChildren(sharkComponent, childSelections);
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
    selecter.on('click.multiselecter', '.selecter', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.container) {
            // 初始化下拉菜单
            initSelections(sharkComponent, config);
            // 初始化下拉菜单事件
            initSelectionsEvents(sharkComponent, config);
        }
        // 如果一级菜单是隐藏的，将它显示出来
        var topSelections = sharkComponent.topSelections;
        if (topSelections.is(':hidden')) {
            // 渲染一级菜单
            renderTopSelections(sharkComponent, config);
            // 计算一级下拉菜单相对于组件的位置
            var postion = DomHelper.calcOffset(selecter, topSelections, 'bottom');
            // 一级菜单的位置
            topSelections.css(postion);
            // 一级菜单样式宽度与组件保持一致
            topSelections.css({
                width: selecter.outerWidth()
            });
            //显示一级菜单
            topSelections.show();
            // 组件状态为打开
            selecter.addClass('open');
        }
    }));
}

// 初始化下拉菜单事件
function initSelectionsEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var topSelections = sharkComponent.topSelections;
    var container = sharkComponent.container;

    // 鼠标移入菜单中的待选项
    container.on('mouseenter', '.list-group-item', function () {
        // 目标元素
        var item = $(this);
        // 目标元素的子菜单的数据
        var childrenData = item.data().children;
        // 目标元素所属的菜单
        var selections = item.parent('.shark-multiselecter-list-group');
        // 当前菜单的子菜单
        var childSelections = selections.data('childSelections');
        // 如果当前菜单存在子菜单，则递归移除当前菜单的孩子菜单
        if (childSelections) {
            // 递归移除当前菜单的孩子菜单
            removeSelectionsAndChildren(sharkComponent, childSelections);
        }
        // 如果目标元素存在子菜单的数据，则创建子菜单
        if (childrenData) {
            var conf = {
                data: childrenData,
                actualKey: config.actualKey,
                displayKey: config.displayKey
            };
            // 创建子菜单
            childSelections = createSelectionsDom(conf);
            // 在容器中添加子菜单
            container.append(childSelections);
            // 在当前菜单上存储子菜单
            selections.data('childSelections', childSelections);
            // 计算子菜单相对于目标元素的位置
            var postion = DomHelper.calcOffset(item, childSelections, 'right');
            childSelections.css(postion);
            // 将子菜单显示出来
            childSelections.show();
        }
    });

    // 鼠标移出下拉菜单区域
    container.on('mouseout', '.shark-multiselecter-list-group', function (evt) {
        // 目标菜单
        var item = $(this);
        // 移入区域
        var toElm = $(evt.toElement);
        // 如果鼠标移出下拉菜单区域
        if (!toElm.is('.shark-multiselecter-list-group') && !toElm.parents('.shark-multiselecter-list-group').length) {
            // 收起所有下拉菜单
            removeSelectionsAndChildren(sharkComponent, topSelections);
            selecter.trigger('focusout');
        }
    });

    // 点击待选项
    container.on('click', '.list-group-item', function () {
        // 目标元素
        var item = $(this);
        // 设置值
        var value = item.data('value');
        sharkComponent.setValue(value, true);
        // 收起所有下拉菜单
        removeSelectionsAndChildren(sharkComponent, topSelections);
        selecter.trigger('focusout');
    });
}

// 渲染一级菜单
function renderTopSelections(sharkComponent, config) {
    // 一级菜单
    var topSelections = sharkComponent.topSelections;
    // 当前选中值
    var value = sharkComponent.data[config.actualKey];
    // 当前选中项
    var activeLi;
    //允许值为空字符串
    if (typeof value !== 'undefined' && value !== null) {
        // 查找一级菜单中是否有选中项
        activeLi = topSelections.find('.list-group-item[value="' + value + '"]');
        // 如果有，则移除其兄弟节点的选中状态，并给他加上选中状态
        if (activeLi.length > 0) {
            activeLi.siblings().removeClass('active');
            activeLi.addClass('active');
            if (config.activeStyle) {
                activeLi.siblings().removeClass(config.activeStyle);
                activeLi.addClass(config.activeStyle);
            }
        }
    }
    // 如果没有，所有选项都移除选中状态
    if (!activeLi || activeLi.length == 0) {
        topSelections.children().removeClass('active');
        if (config.activeStyle) {
            topSelections.children().removeClass(config.activeStyle);
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
            sharkComponent.component.off('click.multiselecter');
        }
        sharkComponent = null;
    };
    return sharkComponent;
}