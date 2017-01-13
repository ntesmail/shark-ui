/**
 * @author sweetyx
 * @description 树插件的扩展，可check树
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');

function makeCheckable(tree, config) {
    tree.addClass('tree-checkable');
    //获取Checked的节点
    function getCheckedNodes() {
        var nodeList = [];
        var checkedNodes = tree.find('.tree-icon-check');
        var addedMap = {};
        for (var i = 0; i < checkedNodes.length; i++) {
            var label = $(checkedNodes[i]).parent();
            var groupId = label.attr('tree-group-id');
            var node = config.nodesMap[groupId];
            if (addedMap[node.node_id])
                continue;
            addedMap[node.node_id] = true;
            nodeList.push(node);
            if(config.autolink === true){
                var nextUl = label.next('ul');
                if (nextUl.length === 0) {
                    getAllChildren(nodeList, node);
                }
            }
        };
        return nodeList;
    }
    //获取所有子节点
    function getAllChildren(list, node) {
        if (!$.isArray(node.children))
            return;
        for (var i = 0; i < node.children.length; i++) {
            list.push(node.children[i]);
            getAllChildren(list, node.children[i]);
        };
    }
    // 全选,全不选
    function selectAll(flag) {
        if (flag) {
            tree.find('.tree-icon-check-empty,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check-minus').addClass('tree-icon-check');
        } else {
            tree.find('.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check tree-icon-check-minus').addClass('tree-icon-check-empty');
        }
    }
    // 反选
    function reverseSelect() {
        var emptys = tree.find('.tree-icon-check-empty');
        var checks = tree.find('.tree-icon-check');
        emptys.removeClass('tree-icon-check-empty').addClass('tree-icon-check');
        checks.removeClass('tree-icon-check').addClass('tree-icon-check-empty');
    }
    /**
     * 修改所有子节点
     * @param  {element}  liEle    li
     * @param  {Boolean} isChecked 是否check
     * @return {void} 
     */
    function changeChildChecked(liEle, isChecked) {
        var groupEle = liEle.children('.tree-group');
        if (isChecked) {
            groupEle.find('.tree-icon-check-empty,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check-minus').addClass('tree-icon-check');
        } else {
            groupEle.find('.tree-icon-check').removeClass('tree-icon-check').addClass('tree-icon-check-empty');
        }
        var nextUl = groupEle.next('ul');
        if (nextUl.length > 0) {
            var childs = nextUl.children('li');
            for (var i = 0; i < childs.length; i++) {
                changeChildChecked($(childs[i]), isChecked);
            };
        }
    }
    /**
     * 修改所有父节点
     * @param  {element}  liEle    li
     * @return {void} 
     */
    function changeParentChecked(liEle) {
        var ul = liEle.parent();
        var groupEle = ul.prev('.tree-group');
        if (groupEle.length === 0) {
            return;
        }
        if (ul.find('.tree-icon-check-minus').length > 0 || (ul.find('.tree-icon-check-empty').length > 0 && ul.find('.tree-icon-check').length > 0)) {
            // 半选
            groupEle.find('.tree-icon-check-empty,.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check tree-icon-check-minus').addClass('tree-icon-check-minus');
        } else if (ul.find('.tree-icon-check-empty').length === 0 && ul.find('.tree-icon-check-minus').length == 0) {
            // 全选
            groupEle.find('.tree-icon-check-empty,.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check tree-icon-check-minus').addClass('tree-icon-check');
        } else {
            // 全不选
            groupEle.find('.tree-icon-check-empty,.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check tree-icon-check-minus').addClass('tree-icon-check-empty');
        }
        changeParentChecked(groupEle.parent('li'));
    }
    /**
     * check节点的复选框
     */
    function checkNode(checkEle, updateLinkNodes, callback) {
        var parentLabel = checkEle.parent();
        var parentLi = parentLabel.parent();
        var isChecked = false;
        if (checkEle.hasClass('tree-icon-check')) {
            checkEle.removeClass('tree-icon-check').addClass('tree-icon-check-empty');
            isChecked = false;
        } else if (checkEle.hasClass('tree-icon-check-empty') || checkEle.hasClass('tree-icon-check-minus')) {
            checkEle.removeClass('tree-icon-check-empty tree-icon-check-minus').addClass('tree-icon-check');
            isChecked = true;
        }
        if (updateLinkNodes) {
            // 更新已展开的子节点
            changeChildChecked(parentLi, isChecked);
            // 更新父节点
            changeParentChecked(parentLi);
        }
        var node_id = parentLabel.attr('tree-group-id');
        var node = config.nodesMap[node_id];
        if(typeof callback === 'function') {
            callback.call(tree, node, isChecked);
        }
        return tree;
    }
    /**
     * 获取所有选中的节点
     * @return {[nodes]}
     */
    tree.getCheckedNodes = function() {
        return getCheckedNodes();
    };
    /**
     * 全选
     */
    tree.selectAll = function() {
        selectAll(true);
        return tree;
    };
    /**
     * 反选
     */
    tree.reverseSelect = function() {
        reverseSelect();
        return tree;
    };
    /**
     * 全不选
     */
    tree.selectNo = function() {
        selectAll(false);
        return tree;
    };
    /**
     * check节点的复选框
     * @param  {node}   node            [节点对象或节点id]
     * @param  {boolean}   updateLinkNodes [是否需要check相关联的节点]
     * @param  {Function} callback        [回调函数]
     * @return {[tree]}                   [tree]
     */
    tree.checkNode = function(node, updateLinkNodes, callback) {
        var nodeId = node.node_id || node;
        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
        if (groupEle.length == 0) {
            //节点不存在
            return tree;
        } else {
            var checkEle = groupEle.children('.tree-icon-check-empty,.tree-icon-check-minus,.tree-icon-check');
            checkNode(checkEle, updateLinkNodes, callback || function() {});
            return tree;
        }
    };
    /**
     * check节点的复选框（强制选中状态）
     * @param  {node}   node            [节点对象或节点id]
     * @param  {boolean}   updateLinkNodes [是否需要check相关联的节点]
     * @param  {Function} callback        [回调函数]
     * @return {[tree]}                   [tree]
     */
    tree.checkNodeForce = function(node, updateLinkNodes, callback) {
        var nodeId = node.node_id || node;
        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
        if (groupEle.length == 0) {
            //节点不存在
            return tree;
        }
        var checkEle = groupEle.children('.tree-icon-check-empty,.tree-icon-check-minus');
        if (checkEle.length == 0) {
            //节点已经check
            return tree;
        } else {
            checkNode(checkEle, updateLinkNodes, callback || function() {});
            return tree;
        }
    };
    //点击复选框
    tree.on('click', '.tree-icon-check-empty,.tree-icon-check-minus,.tree-icon-check', BaseComponent.filterComponentAction(tree, function(evt) {
        var checkEle = $(this);
        checkNode(checkEle, config.autolink, config.onNodeChecked);
    }));
    return tree;
}
module.exports = makeCheckable;
