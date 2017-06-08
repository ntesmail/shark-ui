/**
 * @author sweetyx
 * @description 树插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Event } from '../common/event';
import { DomHelper } from '../common/domhelper';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
import { makeCheckable } from './tree-checkable.ui';
import { makeSelectable } from './tree-selectable.ui';
var template = Templates.tree;
var templateFun = Templates.templateAoT(template);
var isCalced = false;
//缓存icon的宽度
var baseIconWidth = 16;
var calcWidth = function () {
    if (isCalced) {
        return;
    }
    var iconWrap = $('<div class="shark-tree"><a class="tree-icon"></a></div>');
    $(document.body).append(iconWrap);
    var icon = iconWrap.children('.tree-icon');
    baseIconWidth = icon.outerWidth();
    iconWrap.remove();
    isCalced = true;
};
/**
 * 展开节点
 * @param  {tree-icon-right,tree-icon-down} element [节点前面的 展开/收起 按钮]
 * @param  {object} config [配置项]
 */
function unfoldNode(element, config) {
    var parentLable = element.parent();
    if (parentLable.attr('tree-unfold')) {
        //已展开过
        var next = parentLable.next();
        next.addClass('tree-open');
    } else {
        // 第一次展开
        var parentLi = parentLable.parent();
        var groupId = parentLable.attr('tree-group-id');
        var nodes = config.nodesMap[groupId].children;
        // 需要继承是否被check
        var checked = false;
        if (config.checkable) {
            checked = config.checkable && parentLable.find('.tree-icon-check').length > 0 && config.autolink === true;
        }
        //生成html
        var templateData = {
            nodes: nodes,
            checkable: config.checkable,
            checked: checked,
            baseIconWidth: baseIconWidth,
            basePl: parseInt(parentLi.children('.tree-group').css('padding-left')),
            isRoot: false
        };
        var ulHtml = $(templateFun.apply(templateData));
        parentLi.append(ulHtml);
        //已经展开，加上tree-unfold
        parentLable.attr('tree-unfold', true);
    }
    element.removeClass('tree-icon-right').addClass('tree-icon-down');
}
/**
 * 收起节点
 * @param  {tree-icon-right,tree-icon-down} element [节点前面的 展开/收起 按钮]
 */
function foldNode(element) {
    var parentLable = element.parent();
    var nextUl = parentLable.next();
    if (nextUl.length > 0) {
        nextUl.removeClass('tree-open');
    }
    element.removeClass('tree-icon-down').addClass('tree-icon-right');
}
/**
 * 初始化树的所有节点
 * @param  {[type]} nodes      [节点数组]
 * @param  {[type]} nodesMap   [节点map]
 * @param  {[type]} parentNode [父节点]
 */
function initNodesMap(nodes, nodesMap, parentNode) {
    if (!$.isArray(nodes))
        return;
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].parentNode = parentNode || null;
        var n = nodes[i];
        var level = 1;
        while (n.parentNode) {
            level++;
            n = n.parentNode;
        }
        nodes[i].level = level;
        nodesMap[nodes[i].node_id] = nodes[i];
        initNodesMap(nodes[i].children, nodesMap, nodes[i]);
    }
}
//初始化树的第一层级dom
function initDom(sharkComponent, config, targetElement) {
    var templateData = {
        nodes: config.nodes,
        checkable: config.checkable,
        checked: false,
        baseIconWidth: baseIconWidth,
        basePl: -baseIconWidth,
        isRoot: true
    };
    sharkComponent.createType = 'construct';
    sharkComponent.component = $(templateFun.apply(templateData));
    sharkComponent.component.addClass('shark-tree');
    if (targetElement) {
        targetElement.append(sharkComponent.component);
    }
    return sharkComponent
}
//初始化事件
function initEvents(sharkComponent, config) {
    var tree = sharkComponent.component;
    /**
     * 点击节点的 展开/收起 按钮
     */
    tree.on('click', '.tree-icon-right,.tree-icon-down', BaseComponent.filterComponentAction(tree, function (evt) {
        var iconEle = $(this);
        if (iconEle.hasClass('tree-icon-right')) {
            unfoldNode(iconEle, config);
        } else if (iconEle.hasClass('tree-icon-down')) {
            foldNode(iconEle);
        }
    }));
}

SharkUI.sharkTree = function (options, targetElement) {
    calcWidth();
    /*********默认参数配置*************/
    var config = {
        nodes: [],
        nodesMap: {}, //无需用户手动配置
        checkable: true, //是否可check
        autolink: true, //check一个节点后，是否关联其父节点和子节点的选中状态（只有checkable为true时才生效）
        selectable: false, //是否可select
        onNodeChecked: function (node, isChecked) { },
        onNodeSelected: function (node) { }
    };
    SharkUI.extend(config, options);
    initNodesMap(config.nodes, config.nodesMap);
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config, targetElement);
    var tree = sharkComponent.component;
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);
    //可check
    if (config.checkable) {
        makeCheckable(sharkComponent, config);
    }
    //可select
    if (config.selectable) {
        makeSelectable(sharkComponent, config);
    }
    /**********初始化***********************/
    /**
     * 按节点路径展开树
     * @param  {[]} path   [节点路径,eg.[{node_id:100},{node_id:110},{node_id:111}] 或者 [100,110,111]]
     */
    sharkComponent.expandByPath = function (path) {
        for (var i = 0; i < path.length; i++) {
            var nodeId = path[i].node_id || path[i];
            var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
            var iconEle = groupEle.children('.tree-icon-right');
            if (iconEle.length > 0) {
                unfoldNode(iconEle, config);
            }
        }
    };
    /**
     * 按节点展开树
     * @param node   [节点id或者节点]
     */
    sharkComponent.expandByNode = function (node) {
        var nodeId = node || node.node_id;
        var tmpNode = config.nodesMap[nodeId];
        var path = [tmpNode];
        while (tmpNode.parentNode) {
            var tmpNode = tmpNode.parentNode;
            path.unshift(tmpNode);
        }
        sharkComponent.expandByPath(path);
    };
    /**
     * 展开树的全部节点
     */
    sharkComponent.expandAll = (function () {
        var expandAll = function (nodesArr) {
            if (!$.isArray(nodesArr)) {
                return;
            }
            for (var i = 0; i < nodesArr.length; i++) {
                sharkComponent.expandByPath([nodesArr[i]]);
                expandAll(nodesArr[i].children);
            }
        };
        return function () {
            expandAll(config.nodes);
        };
    })();
    /**
     * 搜索树的节点
     * @param  {[string]} keyword [搜索关键字]
     * @return {[node]}         [节点数组]
     */
    sharkComponent.search = function (keyword) {
        var result = [];
        for (var p in config.nodesMap) {
            if (config.nodesMap.hasOwnProperty(p) && !SharkUI.isEmpty(config.nodesMap[p].node_name) && config.nodesMap[p].node_name.indexOf(keyword) !== -1) {
                result.push(config.nodesMap[p]);
            }
        }
        return result;
    };
    /**
     * 销毁树
     */
    sharkComponent.destroy = function () {
        sharkComponent.component.remove();
        sharkComponent = null;
    };
    return sharkComponent;
}

