/**
 * @author sweetyx
 * @description 树插件的扩展，可check树
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');

function makeCheckable(sharkComponent, config) {
    var tree = sharkComponent.component;
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
            if (config.autolink === true) {
                var nextUl = label.next('ul');
                if (nextUl.length === 0) {
                    getAllChildren(nodeList, node);
                }
            }
        };
        return nodeList;
    }
    //获取所有子节点
    function getAllChildren(nodeList, node) {
        if (!$.isArray(node.children))
            return;
        for (var i = 0; i < node.children.length; i++) {
            nodeList.push(node.children[i]);
            getAllChildren(nodeList, node.children[i]);
        };
    }
    // 全选,全不选
    function checkAll(flag) {
        if (flag) {
            tree.find('.tree-icon-check-empty,.tree-icon-check-minus').removeClass('tree-icon-check-empty tree-icon-check-minus').addClass('tree-icon-check');
        } else {
            tree.find('.tree-icon-check,.tree-icon-check-minus').removeClass('tree-icon-check tree-icon-check-minus').addClass('tree-icon-check-empty');
        }
    }
    // 反选
    function reverseCheckAll() {
        var emptys = tree.find('.tree-icon-check-empty');
        var checks = tree.find('.tree-icon-check');
        emptys.removeClass('tree-icon-check-empty').addClass('tree-icon-check');
        checks.removeClass('tree-icon-check').addClass('tree-icon-check-empty');
    }
    /**
     * 修改所有子节点
     * @param  {element}  liEle    li
     * @param  {Boolean} isChecked 是否check
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
    function reverseCheckNode(checkEle, updateLinkNodes, callback) {
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
        if (typeof callback === 'function') {
            callback.call(tree, node, isChecked);
        }
        return tree;
    }
    /**
     * 获取所有选中的节点
     * @return {[nodes]}
     */
    sharkComponent.getCheckedNodes = function() {
        return getCheckedNodes();
    };
    /**
     * 全选
     */
    sharkComponent.checkAll = function() {
        checkAll(true);
    };
    /**
     * 反选
     */
    sharkComponent.reverseCheck = function() {
        reverseCheckAll();
    };
    /**
     * 全不选
     */
    sharkComponent.checkNo = function() {
        checkAll(false);
    };
    /**
     * check节点
     * @param  {node}   node            [节点对象或节点id]
     */
    sharkComponent.reverseCheckNode = function(node) {
        var nodeId = node.node_id || node;
        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
        if (groupEle.length > 0) {
            var checkEle = groupEle.children('.tree-icon-check-empty,.tree-icon-check-minus,.tree-icon-check');
            reverseCheckNode(checkEle, config.autolink, config.onNodeChecked);
        }
    };
    /**
     * 强制check节点
     * @param  {node}   node            [节点对象或节点id]
     */
    sharkComponent.checkNode = function(node) {
        var nodeId = node.node_id || node;
        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
        if (groupEle.length > 0) {
            var checkEle = groupEle.children('.tree-icon-check-empty,.tree-icon-check-minus');
            if (checkEle.length > 0) {
                reverseCheckNode(checkEle, config.autolink, config.onNodeChecked);
            }
        }
    };
    /**
     * 强制取消check节点
     * @param  {node}   node            [节点对象或节点id]
     */
    sharkComponent.unCheckNode = function(node) {
        var nodeId = node.node_id || node;
        var groupEle = tree.find('.tree-group[tree-group-id="' + nodeId + '"]');
        if (groupEle.length > 0) {
            var checkEle = groupEle.children('.tree-icon-check');
            if (checkEle.length > 0) {
                reverseCheckNode(checkEle, config.autolink, config.onNodeChecked);
            }
        }
    };
    //点击复选框
    tree.on('click', '.tree-icon-check-empty,.tree-icon-check-minus,.tree-icon-check', BaseComponent.filterComponentAction(tree, function(evt) {
        var checkEle = $(this);
        reverseCheckNode(checkEle, config.autolink, config.onNodeChecked);
    }));
}
module.exports = makeCheckable;
