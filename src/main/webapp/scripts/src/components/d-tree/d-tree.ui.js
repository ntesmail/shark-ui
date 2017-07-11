/**
 * @author lq
 * @description d-tree插件
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
import { BaseComponent } from '../../common/base';
import { Diff } from './diff';
import { Data } from './data';
import { Dom } from './dom';

// 初始化事件
function initEvents(sharkComponent, config) {
    sharkComponent.component.on('click', 'li', function (evt) {
        var id = $(evt.currentTarget).data('id');
        var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
        if (evt.target.tagName.toUpperCase() === 'I') { // 修改展开收起的状态
            Data.changeOpen(newTopNode, id);
        } else {  // 修改新的数据树的选中状态
            var node = Data.changeChecked(newTopNode, newTopNode, id, config.link);
            config.onNodeChecked.call(sharkComponent, node, node.checked);
        }
        compareAndRender(sharkComponent, newTopNode);
        // 阻止冒泡
        evt.stopPropagation();
    });
}

// 比较两棵数据树的差异，并且渲染
function compareAndRender(sharkComponent, newTopNode) {
    // 得到两棵数据树的差异
    var patches = Diff.diff(sharkComponent.topNode, newTopNode);
    Dom.modifyComponent(sharkComponent.component, { index: 0 }, patches);
    sharkComponent.topNode = newTopNode;
}

// 用新数据重新render
function reRender(sharkComponent, newTreeData, config) {
    var newTopNode = Data.getTopNode(newTreeData, config.link);
    compareAndRender(sharkComponent, newTopNode);
}

function checkAll(sharkComponent, flag) {
    var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
    Data.checkAll(newTopNode, flag);
    compareAndRender(sharkComponent, newTopNode);
}

// 反选
function reverseCheck(sharkComponent) {
    var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
    Data.reverseCheck(newTopNode, newTopNode);
    compareAndRender(sharkComponent, newTopNode);
}

function openAll(sharkComponent) {
    var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
    Data.openAll(newTopNode);
    compareAndRender(sharkComponent, newTopNode);
}

function setChecked(sharkComponent, idList, config) {
    var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
    Data.setChecked(newTopNode, idList, config.link);
    compareAndRender(sharkComponent, newTopNode);
}

function openTo(sharkComponent, idList) {
    var newTopNode = SharkUI.extend({}, sharkComponent.topNode);
    Data.openTo(newTopNode, idList);
    compareAndRender(sharkComponent, newTopNode);
}

SharkUI.sharkDTree = function (options, targetElement) {
    var config = {
        nodes: [],
        openAll: true,
        link: true,
        onNodeChecked: function () { }
    };
    SharkUI.extend(config, options);
    // 组件对象
    var sharkComponent = {};
    // 获取数据根节点
    sharkComponent.topNode = Data.getTopNode(config.nodes, config.link);
    if (config.openAll) {
        Data.openAll(sharkComponent.topNode);
    }
    // 初始化dom节点
    Dom.initDom(sharkComponent, targetElement);
    // 添加基础方法
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    // 初始化事件
    initEvents(sharkComponent, config);
    // 在组件对象上添加reRender方法
    sharkComponent.reRender = function (nodes) {
        reRender(sharkComponent, nodes, config);
    };
    // 全选
    sharkComponent.checkAll = function () {
        checkAll(sharkComponent, true);
    };
    // 全不选
    sharkComponent.checkNo = function () {
        checkAll(sharkComponent, false);
    };
    // 反选
    sharkComponent.reverseCheck = function () {
        reverseCheck(sharkComponent);
    };
    // 设置某几个节点为选中的
    sharkComponent.setChecked = function (idList) {
        setChecked(sharkComponent, idList, config);
    };
    // 展开全部
    sharkComponent.openAll = function () {
        openAll(sharkComponent);
    };
    // 获取选中的id列表
    sharkComponent.getChecked = function () {
        return Data.getChecked(sharkComponent.topNode);
    };
    // 打开某几个节点
    sharkComponent.openTo = function (idList) {
        openTo(sharkComponent, idList);
    };
    return sharkComponent;
}
