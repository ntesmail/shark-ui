/**
 * @author sweetyx
 * @description 树插件的扩展，可select树
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { BaseComponent } from '../common/base';

export function makeSelectable(sharkComponent, config) {
    var tree = sharkComponent.component;
    tree.addClass('tree-selectable');
    //获取selected的节点
    function getSelectedNode() {
        var nameEle = tree.find('.tree-node-selected');
        var label = nameEle.parent();
        var groupId = label.attr('tree-group-id');
        var node = config.nodesMap[groupId];
        return node;
    }
    /**
     * select节点
     */
    function selectNode(nameEle, callback) {
        if (!nameEle.hasClass('tree-node-selected')) {
            tree.find('.tree-node-selected').removeClass('tree-node-selected');
            nameEle.addClass('tree-node-selected');
            var parentLabel = nameEle.parent();
            var node_id = parentLabel.attr('tree-group-id');
            var node = config.nodesMap[node_id];
            if (typeof callback === 'function') {
                callback.call(tree, node);
            }
        }
    }
    /**
     * 获取selected的节点
     * @return {[nodes]}
     */
    sharkComponent.getSelectedNode = function() {
        return getSelectedNode();
    };
    /**
     * 选中节点
     * @param  {node}   node            [节点对象或节点id]
     * @param  {boolean}   updateLinkNodes [是否需要check相关联的节点]
     * @param  {Function} callback        [回调函数]
     * @return {[tree]}                   [tree]
     */
    sharkComponent.selectNode = function(node) {
        var nodeId = node.node_id || node;
        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
        if (groupEle.length > 0) {
            var nameEle = groupEle.children('.tree-node-name');
            selectNode(nameEle, config.onNodeSelected);
        }
    };
    //树的点击事件
    tree.on('click', '.tree-node-name', BaseComponent.filterComponentAction(tree, function(evt) {
        var nameEle = $(this);
        selectNode(nameEle, config.onNodeSelected);
    }));
}
