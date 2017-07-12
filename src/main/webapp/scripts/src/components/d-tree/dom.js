import $ from 'jquery';

// 展开/收起子树
function toggleChildTree(treeNode, open) {
    // 控制展开收起的按钮
    var switcher = treeNode.children('.tree-switcher');
    var childTree = treeNode.children('ul');
    switcher.removeClass('tree-icon-down tree-icon-right');
    // 先收起子树，再根据状态选择要不要打开
    childTree.removeClass('tree-open');
    if (open) { // 展开子树并修改按钮状态
        switcher.addClass('tree-icon-down');
        childTree.addClass('tree-open');
    } else { // 修改按钮状态
        switcher.addClass('tree-icon-right');
    }
}

// 修改复选框的状态
function toggleCheckBox(checkbox, state) {
    if (checkbox) {
        checkbox.removeClass('tree-icon-check-empty tree-icon-check-minus tree-icon-check');
        var classObj = {
            '0': 'tree-icon-check-empty',
            '1': 'tree-icon-check-minus',
            '2': 'tree-icon-check'
        };
        checkbox.addClass(classObj[state]);
    }
}

function toggleSelected(title, selected) {
    title.removeClass('tree-node-selected');
    if (selected) {
        title.addClass('tree-node-selected');
    }
}

// 生成树节点的dom
function getTreeNode(nodeData, checkable) {
    var treeNode = $('<li></li>');
    var title = $('<span class="tree-title tree-node-name">' + nodeData.name + '</span>');
    var children = nodeData.children;
    if (nodeData.selected) {
        title.addClass('tree-node-selected');
    }
    treeNode.append(title);
    treeNode.data('id', nodeData.id);
    toggleCheckBox(checkbox, nodeData.state);
    if (checkable) {
        var checkbox = $('<span class="tree-checkbox tree-icon"></span>');
        treeNode.prepend(checkbox);
    }
    if (children) {
        var childTree = getChildTree(children, nodeData.open, checkable);
        // 存在子树则在节点前添加展开收起子树的按钮
        treeNode.prepend('<span class="tree-switcher tree-icon"></span>');
        treeNode.append(childTree);
        toggleChildTree(treeNode, nodeData.open);
    }
    return treeNode;
}

// 生成子树的dom
function getChildTree(nodesData, open, checkable) {
    var tree = $('<ul></ul>');
    nodesData.forEach(function (nodeData) {
        var treeNode = getTreeNode(nodeData, checkable);
        tree.append(treeNode);
    });
    return tree;
}

// 根据根数据根节点，初始化树组件的dom结构
function initDom(topNode, checkable) {
    var container = $('<div class="shark-d-tree shark-tree"></div>');
    var tree = getChildTree(topNode.children, checkable);
    container.append(tree);
    return container;
}

// 重新排序子节点
function reOrderChildren(node, moves) {
    moves.forEach(function (move) {
        var childTree = $(node).children('ul');
        var nodeList = childTree.children('li');
        var index = move.index;
        if (move.type === 0) {
            var treeNode = nodeList.eq(index);
            treeNode.remove();
        } else if (move.type === 1) {
            var item = move.item;
            var treeNode = getTreeNode(item);
            if (index) {
                nodeList.eq(index - 1).after(treeNode);
            } else {
                childTree.prepend(treeNode);
            }
        }
    });
}

// 根据得到的当前节点的差异，修改当前节点
function applyPatches(node, currentPatches) {
    currentPatches.forEach(function (currentPatch) {
        switch (currentPatch.type) {
            case "REORDER":
                reOrderChildren(node, currentPatch.moves);
                break;
            case "NAME":
                var title = node.children('.tree-title');
                title.text(currentPatch.name);
                break;
            case "STATE":
                var checkbox = node.children('.tree-checkbox');
                toggleCheckBox(checkbox, currentPatch.state);
                break;
            case "SELECTED":
                var title = node.children('.tree-title');
                toggleSelected(title, currentPatch.selected);
                break;
            case "OPEN":
                toggleChildTree(node, currentPatch.open);
                break;
        }
    });
}

// 根据得到的差异数组，修改组件
function applyToTree(node, walker, patches) {
    var currentPatches = patches[walker.index];
    var treeNodes = node.children('ul').children('li');
    treeNodes.each(function (i, treeNode) {
        walker.index++;
        applyToTree($(treeNode), walker, patches);
    });
    currentPatches && applyPatches(node, currentPatches);
}

var TreeDom = {
    initDom: initDom,
    applyToTree: applyToTree
};
export { TreeDom };
