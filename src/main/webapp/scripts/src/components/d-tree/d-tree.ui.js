/**
 * @author lq
 * @description d-tree插件
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
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
            var node = TreeData.changeOpen(newTopNode, id);
            compareAndRender(sharkComponent, newTopNode, config.checkable);
            config.onExpand.call(sharkComponent, node, node.open);
        } else if (target.hasClass('tree-checkbox') && config.checkable) {  // 修改新的数据树的选中状态
            var node = TreeData.changeChecked(config.checkable, newTopNode, newTopNode, id, config.link);
            compareAndRender(sharkComponent, newTopNode, config.checkable);
            config.onNodeChecked.call(sharkComponent, node, node.checked);
        } else if (target.hasClass('tree-title') && config.selectable) {
            var node = TreeData.selectNode(config.selectable, newTopNode, id, config.multiple);
            compareAndRender(sharkComponent, newTopNode, config.checkable);
            config.onNodeSelected.call(sharkComponent, node);
        }
        // 阻止冒泡
        evt.stopPropagation();
    });
}

// 比较两棵数据树的差异，并且渲染
function compareAndRender(sharkComponent, newTopNode, checkable) {
    // 得到两棵数据树的差异
    var patches = Diff.diff(sharkComponent.topNode, newTopNode);
    TreeDom.applyToTree(sharkComponent.component, { index: 0 }, patches, checkable);
    sharkComponent.topNode = newTopNode;
}

function checkAll(sharkComponent, flag, config) {
    var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
    TreeData.checkAll(newTopNode, flag);
    compareAndRender(sharkComponent, newTopNode, config.checkable);
}

SharkUI.sharkDTree = function (options, targetElement) {
    // 组件对象
    var sharkComponent = {};
    var config = {
        nodes: [], // 树数据
        openAll: true, // 是否全部展开，默认true
        link: true, // 父子级节点是否关联，默认为true
        selectable: false,
        multiple: false,
        checkable: true,
        onExpand: function () { },
        onNodeChecked: function () { }, // check之后的回调
        onNodeSelected: function () { }
    };
    SharkUI.extend(config, options);
    // 添加基础方法
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    // 获取经过一系列处理的数据根节点
    sharkComponent.topNode = TreeData.getTopNode(config.nodes, config.link, config.checkable);
    // 是否全部展开，如果是则重新处理数据树
    if (config.openAll) {
        TreeData.openAll(sharkComponent.topNode);
    }
    // 初始化dom节点
    sharkComponent.component = TreeDom.initDom(sharkComponent.topNode, config.checkable);
    if (targetElement) {
        targetElement.append(sharkComponent.component);
    }
    // 初始化事件
    initEvents(sharkComponent, config);
    // reRender方法
    sharkComponent.reRender = function (nodes) {
        var newTopNode = TreeData.getTopNode(nodes, config.link, config.checkable);
        compareAndRender(sharkComponent, newTopNode, config.checkable);
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
        TreeData.reverseCheck(newTopNode, newTopNode);
        compareAndRender(sharkComponent, newTopNode, config.checkable);
    };
    // 设置某几个节点为选中的
    sharkComponent.setChecked = function (idList) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.setChecked(newTopNode, idList, config.link, true, config.checkable);
        compareAndRender(sharkComponent, newTopNode, config.checkable);
    };
    sharkComponent.setUnChecked = function (idList) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.setChecked(newTopNode, idList, config.link, false, config.checkable);
        compareAndRender(sharkComponent, newTopNode, config.checkable);
    };
    // 设置某几个节点为选中的
    sharkComponent.setSelected = function (idList) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.setSelected(newTopNode, idList, config.multiple);
        compareAndRender(sharkComponent, newTopNode, config.checkable);
    }
    // 展开全部
    sharkComponent.openAll = function () {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.openAll(newTopNode);
        compareAndRender(sharkComponent, newTopNode, config.checkable);
    };
    // 展开某几个节点
    sharkComponent.openTo = function (idList) {
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        TreeData.openTo(newTopNode, idList);
        compareAndRender(sharkComponent, newTopNode, config.checkable);
    };
    // 获取选中的id列表
    sharkComponent.getChecked = function () {
        return TreeData.getNodeIdList(sharkComponent.topNode, 'checked', config.checkable);
    };
    // 获取选中的id列表
    sharkComponent.getSelected = function () {
        return TreeData.getNodeIdList(sharkComponent.topNode, 'selected', config.selectable);
    }
    // 销毁组件
    sharkComponent.destroy = function () {
        sharkComponent.component.remove();
        sharkComponent = null;
    };
    return sharkComponent;
}
