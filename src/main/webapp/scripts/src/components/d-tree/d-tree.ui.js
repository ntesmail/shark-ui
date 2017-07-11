/**
 * @author lq
 * @description d-tree插件
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
import { BaseComponent } from '../../common/base';
import { Diff } from './diff';
import { Data } from './data';

// 根据得到的差异数组，修改组件
function modifyComponent(node, walker, patches) {
    var currentPatches = patches[walker.index];
    var aLi = node.children('ul').children('li');
    aLi.each(function (i, oLi) {
        walker.index++;
        modifyComponent($(oLi), walker, patches);
    });
    currentPatches && applyPatches(node, currentPatches);
}

// 根据得到的当前节点的差异，修改当前节点
function applyPatches(node, currentPatches) {
    currentPatches.forEach(function (currentPatch) {
        switch (currentPatch.type) {
            case "REORDER":
                reOrderChildren(node, currentPatch.moves);
                break;
            case "PROPS":
                setProps(node, currentPatch.props);
                break;
        }
    });
}

// 修改复选框的状态
function changeCheckState(oA, state) {
    oA.removeClass('tree-icon-check-empty tree-icon-check-minus tree-icon-check');
    var classObj = {
        '0': 'tree-icon-check-empty',
        '1': 'tree-icon-check-minus',
        '2': 'tree-icon-check'
    };
    oA.addClass(classObj[state]);
}

function changeOpenDom(node, open) {
    var oI = node.children('i');
    var oUl = node.children('ul');
    oI.removeClass('tree-icon-down tree-icon-right');
    oUl.removeClass();
    if (open) {
        oI.addClass('tree-icon-down');
        oUl.addClass('tree-open');
    } else {
        oI.addClass('tree-icon-right');
    }
}

function setProps(node, props) {
    var oSpan = node.children('span');
    var oA = node.children('a');
    if (oA.length) {
        for (var key in props) {
            switch (key) {
                case "node_name":
                    oSpan.text(props[key]);
                    break;
                case "state":
                    changeCheckState(oA, props[key]);
                    break;
                case "open":
                    changeOpenDom(node, props[key]);
                    break;
            }
        }
    }
}

// 重新排序子节点
function reOrderChildren(node, moves) {
    moves.forEach(function (move) {
        var ul = $(node).children('ul');
        var staticNodeList = $(node).children('ul').children('li');
        var index = move.index;
        if (move.type === 0) {
            var li = staticNodeList.eq(index);
            li.remove();
        } else if (move.type === 1) {
            var item = move.item;
            var li = getNodeDom(item);
            if (index) {
                staticNodeList.eq(index - 1).after(li);
            } else {
                ul.prepend(li);
            }
        }
    });
}

// 获取node的dom节点
function getNodeDom(node) {
    var children = node.children;
    var open = !!node.open;
    var oA = $('<a class="tree-icon"></a>');
    changeCheckState(oA, node.state);
    var oSpan = $('<span class="tree-node-name"></span>');
    oSpan.html(node.node_name);
    var oLi = $('<li></li>');
    oLi.data('id', node.node_id);
    oLi.append(oA);
    oLi.append(oSpan);
    if (children) {
        var oUl = getUlDom(children);
        oLi.prepend('<i class="tree-icon"></i>');
        oLi.append(oUl);
        changeOpenDom(oLi, open);
    }
    return oLi;
}

// 获取ul的dom节点
function getUlDom(nodes, open) {
    var oUl = $('<ul></ul>');
    nodes.forEach(function (node) {
        var oLi = getNodeDom(node);
        oUl.append(oLi);
    });
    return oUl;
}

// 根据根数据根节点，初始化树组件的dom结构
function initDom(sharkComponent, targetElement) {
    var component = $('<div class="shark-d-tree shark-tree"></div>');
    var children = sharkComponent.topNode.children;
    if (children) {
        var oUl = getUlDom(children);
        component.append(oUl);
    }
    if (targetElement) {
        targetElement.append(component);
    }
    sharkComponent.component = component;
}

// 初始化事件
function initEvents(sharkComponent) {
    var component = sharkComponent.component;
    // 选中/取消勾选
    component.on('click', 'li', function (e) {
        var li = $(e.currentTarget);
        var id = li.data('id');
        var newTopNode = {};
        SharkUI.extend(newTopNode, sharkComponent.topNode);
        // 修改新的数据树的选中状态
        Data.changeChecked(newTopNode, newTopNode, id);
        // 得到两棵数据树的差异
        var patches = Diff.diff(sharkComponent.topNode, newTopNode);
        modifyComponent(component, { index: 0 }, patches);
        sharkComponent.topNode = newTopNode;
        // 阻止冒泡
        e.stopPropagation();
    });
    // 展开/收起
    component.on('click', 'i', function (e) {
        var li = $(e.currentTarget).parent('li');
        var id = li.data('id');
        var newTopNode = {};
        SharkUI.extend(newTopNode, sharkComponent.topNode);
        // 修改展开收起的状态
        Data.changeOpen(newTopNode, id);
        // 得到两棵数据树的差异
        var patches = Diff.diff(sharkComponent.topNode, newTopNode);
        modifyComponent(component, { index: 0 }, patches);
        sharkComponent.topNode = newTopNode;
        // 阻止冒泡
        e.stopPropagation();
    });
}

// 重新render
function render(sharkComponent, newTreeData) {
    var newTopNode = Data.getTopNode(newTreeData);
    var patches = Diff.diff(sharkComponent.topNode, newTopNode);
    modifyComponent(sharkComponent.component, { index: 0 }, patches);
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
    initDom(sharkComponent, targetElement);
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
