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
function initEvents(sharkComponent, treeConfig, config) {
    var selecter = sharkComponent.component;
    selecter.on('click.selecter', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.selections) {
            // 如果还没有初始化过selections，在这里先初始化
            SelectDom.initSelectionsDom(sharkComponent, sharkComponent.topNode, treeConfig, config);
            initSelectionsEvents(sharkComponent, config);
        }
        SelectDom.toggleSelections(sharkComponent);
    }));

    selecter.on('click.selecter', '.selecter-item', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        evt.stopPropagation();
    }));
    selecter.on('click.selecter', '.remove', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        var node = $(evt.currentTarget).parent('li').data('node');
        if (sharkComponent.selections) {
            sharkComponent.selections.tree.setUnChecked([node[config.actualKey]]);
        }
        SelectData.changeCheckedListAndAllState(sharkComponent, node, false, config);
        SelectDom.changeSelectedMultiple(sharkComponent, node, false, config);
        TreeData.setChecked(sharkComponent.topNode, [node], false, true, treeConfig);
    }));
}

// 初始化下拉列表事件
function initSelectionsEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    selections.on('click', '.check-all', function (evt) {
        // 取消选中
        if (sharkComponent.allState === 2) {
            sharkComponent.selections.tree.checkNo();
            sharkComponent.allState = 0;
            sharkComponent.checkedList = [];
        } else { // 全选
            sharkComponent.selections.tree.checkAll();
            sharkComponent.allState = 2;
            sharkComponent.checkedList = selections.tree.getChecked();
        }
        SelectDom.setSelectedMultiple(sharkComponent, config);
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
        checked: [], // 多选时使用
        selected: null, // 单选时使用
        multiple: false,
        onSelected: function () { },
        onChecked: function () { }
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
        onNodeChecked: function (node, isChecked) {
            SelectData.changeCheckedListAndAllState(sharkComponent, node, isChecked, config);
            SelectDom.changeSelectedMultiple(sharkComponent, node, isChecked, config);
            config.onChecked.call(sharkComponent, node, isChecked);
        },
        onNodeSelected: function (node, isSeleted) {
            sharkComponent.selectedItem = node;
            SelectDom.changeSelectSingle(sharkComponent, node, config);
            config.onSelected.call(sharkComponent, node, isSeleted);
        }
    };
    var topNode = TreeData.getTopNode(config.data, treeConfig);
    // 单选
    if (!config.multiple && config.selected) {
        TreeData.setSelected(topNode, [config.selected], true, treeConfig);
        var selectedList = TreeData.getNodeList(topNode, '__selected', [], treeConfig);
        sharkComponent.selectedItem = selectedList.length && selectedList[0];
    }
    // 多选
    if (config.multiple && config.checked.length) {
        TreeData.setChecked(topNode, config.checked, true, false, treeConfig);
        sharkComponent.checkedList = TreeData.getNodeList(topNode, '__checked', [], treeConfig);
        // 全选按钮的状态
        sharkComponent.allState = topNode.__state;
    }
    sharkComponent.topNode = topNode;
    // 初始化dom
    sharkComponent.component = SelectDom.initDom(sharkComponent, config);
    // 初始化事件
    initEvents(sharkComponent, treeConfig, config);

    // 设置选中项（单选）
    sharkComponent.setSelected = function (selected) {
        if (!config.multiple) {
            TreeData.setSelected(sharkComponent.topNode, [selected], true, treeConfig);
            sharkComponent.selectedItem = TreeData.getNodeList(sharkComponent.topNode, '__selected', [], treeConfig).length && TreeData.getNodeList(sharkComponent.topNode, '__selected', [], treeConfig)[0];
            SelectDom.setSelectedSingle(sharkComponent, config);
            SelectDom.toggleAllState(sharkComponent);
        }
    };


    // 设置选中项（多选）
    sharkComponent.setChecked = function (checked, replace) {
        if (config.multiple) {
            TreeData.setChecked(sharkComponent.topNode, checked, true, replace, treeConfig);
            sharkComponent.checkedList = TreeData.getNodeList(sharkComponent.topNode, '__checked', [], treeConfig);
            // 全选按钮的状态
            sharkComponent.allState = topNode.__state;
            SelectDom.setSelectedMultiple(sharkComponent, config);
            SelectDom.toggleAllState(sharkComponent);
        }
    };

    // 获取选中项（多选）
    sharkComponent.getChecked = function () {
        return sharkComponent.checkedList;
    };
    // 获取选中项（单选）
    sharkComponent.getSelected = function () {
        return sharkComponent.selectedItem;
    };
    // 销毁组件
    sharkComponent.destroy = function () {
        sharkComponent.component.remove();
        sharkComponent.selections.remove();
        sharkComponent = null;
    };
    return sharkComponent;
}
