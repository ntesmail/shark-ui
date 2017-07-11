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
function initEvents(sharkComponent) {
    var component = sharkComponent.component;
    component.on('click', 'li', function (evt) {
        var li = $(evt.currentTarget);
        var id = li.data('id');
        var newTopNode = {};
        SharkUI.extend(newTopNode, sharkComponent.topNode);
        if (evt.target.tagName.toUpperCase() === 'I') {
            // 修改展开收起的状态
            Data.changeOpen(newTopNode, id);
        } else {
            // 修改新的数据树的选中状态
            Data.changeChecked(newTopNode, newTopNode, id);
        }
        // 得到两棵数据树的差异
        var patches = Diff.diff(sharkComponent.topNode, newTopNode);
        Dom.modifyComponent(component, { index: 0 }, patches);
        sharkComponent.topNode = newTopNode;
        // 阻止冒泡
        evt.stopPropagation();
    });
}

// 重新render
function render(sharkComponent, newTreeData) {
    var newTopNode = Data.getTopNode(newTreeData);
    var patches = Diff.diff(sharkComponent.topNode, newTopNode);
    Dom.modifyComponent(sharkComponent.component, { index: 0 }, patches);
    sharkComponent.topNode = newTopNode;
}

SharkUI.sharkDTree = function (options, targetElement) {
    var config = {
        nodes: []
    };
    SharkUI.extend(config, options);
    // 组件对象
    var sharkComponent = {};
    // 获取数据根节点
    sharkComponent.topNode = Data.getTopNode(config.nodes);
    // 初始化dom节点
    Dom.initDom(sharkComponent, targetElement);
    // 添加基础方法
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    // 初始化事件
    initEvents(sharkComponent);
    // 在组件对象上添加render方法
    sharkComponent.render = function (nodes) {
        render(sharkComponent, nodes);
    };
    return sharkComponent;
}
