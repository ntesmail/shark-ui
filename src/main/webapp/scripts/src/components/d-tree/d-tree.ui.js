/**
 * @author lq
 * @description d-tree插件
 * selectable和checkable与数据树无关，只在dom操作中体现
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
import { TransTree } from '../../common/trans-tree';
import { BaseComponent } from '../../common/base';
import { Diff } from './diff';
import { TreeData } from './data';
import { TreeDom } from './dom';

// 初始化事件
function initEvents(sharkComponent, config) {
    sharkComponent.component.on('click', 'li', function (evt) {
        var id = $(evt.currentTarget).data('id');
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        var target = $(evt.target);
        if (target.hasClass('tree-switcher')) { // 修改展开收起的状态
            var node = TreeData.changeOpen(newTopNode, id, config);
            compareAndRender(sharkComponent, newTopNode, config);
            config.onExpand.call(sharkComponent, node, node.open);
        } else if (!target.hasClass('disabled') && target.hasClass('tree-checkbox') && config.checkable) {  // 修改新的数据树的选中状态
            var node = TreeData.toggleCheck(newTopNode, id, config);
            compareAndRender(sharkComponent, newTopNode, config);
            config.onNodeChecked.call(sharkComponent, node, node.__checked);
        } else if (!target.hasClass('disabled') && target.hasClass('tree-title') && config.selectable) {
            var node = TreeData.toggleSelect(newTopNode, id, config);
            compareAndRender(sharkComponent, newTopNode, config);
            config.onNodeSelected.call(sharkComponent, node, node.selected);
        }
        // 阻止冒泡
        evt.stopPropagation();
    });
}

// 比较两棵数据树的差异，并且渲染
function compareAndRender(sharkComponent, newTopNode, config) {
    // 得到两棵数据树的差异
    var patches = Diff.diff(sharkComponent.topNode, newTopNode, config);
    TreeDom.applyToTree(sharkComponent.component, { index: 0 }, patches, config);
    sharkComponent.topNode = newTopNode;
}

function checkAll(sharkComponent, flag, config) {
    var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
    TreeData.checkAll(newTopNode, flag);
    compareAndRender(sharkComponent, newTopNode, config);
}

function internalDTree(topNode, config, targetElement) {
    var sharkComponent = {};
    sharkComponent.topNode = topNode;
    // 添加基础方法
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    // 初始化dom节点
    sharkComponent.component = TreeDom.initDom(sharkComponent.topNode, config);
    if (targetElement) {
        targetElement.append(sharkComponent.component);
    }
    // 初始化事件
    initEvents(sharkComponent, config);
    // reRender方法
    sharkComponent.reRender = function (nodes) {
        var newTopNode = TreeData.getTopNode(nodes, config);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 全选
    sharkComponent.checkAll = function () {
        checkAll(sharkComponent, true, config);
    };
    // 全不选
    sharkComponent.checkNo = function () {
        checkAll(sharkComponent, false, config);
    };
    // 反选
    sharkComponent.reverseCheck = function () {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.reverseCheck(newTopNode, newTopNode, config);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 设置某几个节点为选中的(replace，替换掉原来的选中值)
    sharkComponent.setChecked = function (idList, replace) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.setChecked(newTopNode, idList, true, replace, config);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 设置某几个节点为不选中的
    sharkComponent.setUnChecked = function (idList, replace) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.setChecked(newTopNode, idList, false, replace, config);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 设置某几个节点为选中的
    sharkComponent.setSelected = function (idList, replace) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.setSelected(newTopNode, idList, replace, config);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 展开全部
    sharkComponent.openAll = function () {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.openAll(newTopNode);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 展开某几个节点(autoOpenParent:打开子节点后是否自动打开父节点)
    sharkComponent.openTo = function (idList, autoOpenParent) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.openTo(newTopNode, idList, autoOpenParent);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 设置某几个节点为禁用的
    sharkComponent.setDisabled = function (idList) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.setDisabled(newTopNode, idList, config);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 设置某几个checkbox为禁用的
    sharkComponent.setDisabledCheckBox = function (idList) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.setDisabledCheckBox(newTopNode, idList, config);
        compareAndRender(sharkComponent, newTopNode, config);
    };
    // 获取选中的id列表
    sharkComponent.getChecked = function () {
        if (config.checkable) {
            return TreeData.getNodeList(sharkComponent.topNode, '__checked', [], config);
        }
    };
    // 获取选中的id列表
    sharkComponent.getSelected = function () {
        if (config.selectable) {
            return TreeData.getNodeList(sharkComponent.topNode, '__selected', [], config);
        }
    }
    // 销毁组件
    sharkComponent.destroy = function () {
        sharkComponent.component.remove();
        sharkComponent = null;
    };
    return sharkComponent;
}

SharkUI.sharkDTree = function (options, targetElement) {
    var config = {
        nodes: [], // 树数据
        actualKey: 'id',
        displayKey: 'name',
        actualKey: 'pid',
        openAll: true, // 是否全部展开，默认true
        link: true, // 父子级节点是否关联，默认为true
        selectable: false, // 节点是否可选中，默认为false
        disabled: false, // 节点是否禁用，默认为false
        multiple: false, // 节点是否可多选，默认为true
        checkable: true, // 是否有checkbox，默认为true
        onExpand: function () { }, // 节点展开时的回调
        onNodeChecked: function () { }, // 节点选中的回调
        onNodeSelected: function () { } // checkbox选中的回调
    };
    SharkUI.extend(config, options);
    var treeList = TransTree.transTree(config.nodes);
    // 获取经过一系列处理的数据根节点(加上了count,修改了checked和state)
    var topNode = TreeData.getTopNode(treeList, config);
    // 默认情况下checked的节点
    if (config.checkable && config.checked) {
        TreeData.setChecked(topNode, config.checked, true, false, config);
    }
    // 默认情况下selected的节点
    if (config.selectable && config.selected) {
        TreeData.setSelected(topNode, config.selected, false, config);
    }
    // 是否全部展开，如果是，重新处理数据树
    if (config.openAll) {
        TreeData.openAll(topNode);
    }
    // 节点全部不能选
    if (config.disabled) {
        TreeData.disabledAll(topNode);
    }
    // checkbox全部不能选
    if (config.disableCheckbox) {
        TreeData.disableCheckboxAll(topNode);
    }
    return internalDTree(topNode, config, targetElement);
};

var DTree = {
    internalDTree: internalDTree
};
export { DTree };
