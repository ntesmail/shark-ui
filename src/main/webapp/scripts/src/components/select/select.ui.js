/**
 * @author lq
 * @description select插件
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
import { BaseComponent } from '../../common/base';
import { Event } from '../../common/event';
import { TreeData } from '../d-tree/data';
import { SelectData } from './data';
import { SelectDom } from './dom';

// 初始化事件
function initEvents(sharkComponent, config, treeConfig) {
    var selecter = sharkComponent.component;
    selecter.on('click.selecter', '.selecter', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.selections) {
            // 如果还没有初始化过selections，在这里先初始化
            SelectDom.initSelectionsDom(sharkComponent, config, treeConfig);
            initSelectionsEvents(sharkComponent, config);
        }
        SelectDom.toggleSelections(sharkComponent);
    }));
    selecter.on('click.selecter', '.remove', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        var node = $(evt.currentTarget).parent('li').data('node');
        sharkComponent.selections.tree.setUnChecked([node[config.actualKey]]);
        SelectDom.changeSelectDom1(sharkComponent, node, false);
    }))
}

// 初始化下拉列表事件
function initSelectionsEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    selections.on('click', '.check-all', function (evt) {
        if (sharkComponent.allState === 2) {
            sharkComponent.selections.tree.checkNo();
            sharkComponent.allState = 0;
            SelectData.allSelectedSpan(sharkComponent, false);
        } else {
            sharkComponent.selections.tree.checkAll();
            sharkComponent.allState = 2;
            SelectData.allSelectedSpan(sharkComponent, true);
        }
        SelectDom.allSelectedSpanDom(sharkComponent, config);
        SelectDom.toggleAllState(sharkComponent)
    });
    // 点击除了组件之外的地方，收起下拉列表
    Event.addCloseListener(
        selections.attr('id'),
        [selecter, selections],
        BaseComponent.filterComponentAction(sharkComponent, function () {
            SelectDom.closeSelections(sharkComponent);
        }));
}

SharkUI.sharkSelect = function (options, targetElement) {
    var sharkComponent = {};
    sharkComponent.checkedList = [];
    var config = {
        data: null,
        actualKey: 'value',
        displayKey: 'name',
        multiple: false,
        onSelected: function () { }
    };
    SharkUI.extend(config, options);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    // 首先整理数据
    var treeConfig = {
        link: true,
        actualKey: config.actualKey,
        displayKey: config.displayKey,
        checkable: config.multiple,
        selectable: !config.multiple,
        checked: config.checked
    };
    var topNode = TreeData.getTopNode(config.data, treeConfig);
    if (config.multiple && config.checked) {
        TreeData.setChecked(topNode, config.checked, true, false, config);
        sharkComponent.checkedList = TreeData.getNodeList(topNode, '__checked', [], treeConfig);
    }
    if (!config.multiple && config.checked) {
        TreeData.setSelected(topNode, config.checked, true, config);
        sharkComponent.checkedList = TreeData.getNodeList(topNode, '__selected', [], treeConfig);
    }
    TreeData.setCheckState(topNode, true);
    sharkComponent.allState = topNode.__state;
    sharkComponent.topNode = topNode;
    // 初始化dom
    sharkComponent.component = SelectDom.initDom(sharkComponent.checkedList, config);
    initEvents(sharkComponent, config, treeConfig);
    return sharkComponent;
}
