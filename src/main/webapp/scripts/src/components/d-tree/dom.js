import $ from 'jquery';

// 展开/收起子树
function toggleChildTree(node, open) {
    var switcher = node.children('.tree-switcher');
    var childTree = node.children('ul');
    switcher.removeClass('tree-icon-down tree-icon-right');
    // 先收起子树，再根据状态选择要不要打开
    childTree.removeClass('tree-open');
    if (open) {
        switcher.addClass('tree-icon-down');
        childTree.addClass('tree-open');
    } else {
        switcher.addClass('tree-icon-right');
    }
}

// 获取node的dom节点
function getTreeNode(nodeData) {
    var children = nodeData.children;
    var checkbox = $('<span class="tree-checkbox tree-icon"></span>');
    var treeNode = $('<li><span class="tree-title tree-node-name">' + nodeData.name + '</span></li>');
    changeCheckState(checkbox, nodeData.state);
    treeNode.data('id', nodeData.id);
    treeNode.prepend(checkbox);
    if (children) {
        var childTree = getChildTree(children);
        treeNode.prepend('<span class="tree-switcher tree-icon"></span>');
        treeNode.append(childTree);
        toggleChildTree(treeNode, nodeData.open);
    }
    return treeNode;
}

// 获取子树的dom
function getChildTree(nodes, open) {
    var tree = $('<ul></ul>');
    nodes.forEach(function (node) {
        var treeNode = getTreeNode(node);
        tree.append(treeNode);
    });
    return tree;
}

// 根据根数据根节点，初始化树组件的dom结构
function initDom(topNode) {
    var container = $('<div class="shark-d-tree shark-tree"></div>');
    var tree = getChildTree(topNode.children);
    container.append(tree);
    return container;
}

// 根据得到的差异数组，修改组件
function modifyComponent(node, walker, patches) {
    var currentPatches = patches[walker.index];
    var treeNodes = node.children('ul').children('li');
    treeNodes.each(function (i, treeNode) {
        walker.index++;
        modifyComponent($(treeNode), walker, patches);
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
            case "NAME":
                var title = node.children('.tree-title');
                title.text(currentPatch.name);
                break;
            case "STATE":
                var checkbox = node.children('.tree-checkbox');
                changeCheckState(checkbox, currentPatch.state);
                break;
            case "OPEN":
                toggleChildTree(node, currentPatch.open);
                break;
        }
    });
}

// 修改复选框的状态
function changeCheckState(checkbox, state) {
    checkbox.removeClass('tree-icon-check-empty tree-icon-check-minus tree-icon-check');
    var classObj = {
        '0': 'tree-icon-check-empty',
        '1': 'tree-icon-check-minus',
        '2': 'tree-icon-check'
    };
    checkbox.addClass(classObj[state]);
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

var TreeDom = {
    initDom: initDom,
    modifyComponent: modifyComponent
};
export { TreeDom };
