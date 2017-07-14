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

// 切换复选框的状态
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

// 切换选中状态（节点本身）
function toggleSelected(title, selected, config) {
    if (config.selectable) {
        title.removeClass('tree-node-selected');
        if (selected) {
            title.addClass('tree-node-selected');
        }
    }
}

// 生成树节点的dom
function getTreeNode(nodeData, config) {
    var treeNode = $('<li></li>');
    var title = $('<span class="tree-title tree-node-name">' + nodeData.name + '</span>');
    var children = nodeData.children;
    if (nodeData.disabled) {
        title.addClass('disabled');
    }
    if (config.selectable && nodeData.selected) {
        title.addClass('tree-node-selected');
    }
    treeNode.append(title);
    treeNode.data('id', nodeData.id);
    if (config.checkable) {
        var checkbox = $('<span class="tree-checkbox tree-icon"></span>');
        toggleCheckBox(checkbox, nodeData.state);
        if (nodeData.disabledCheckbox) {
            checkbox.addClass('disabled');
        }
        treeNode.prepend(checkbox);
    }
    if (children) {
        var childTree = getChildTree(children, nodeData.open, config);
        // 存在子树则在节点前添加展开收起子树的按钮
        treeNode.prepend('<span class="tree-switcher tree-icon"></span>');
        treeNode.append(childTree);
        toggleChildTree(treeNode, nodeData.open);
    }
    return treeNode;
}

// 生成子树的dom
function getChildTree(nodesData, open, config) {
    var tree = $('<ul></ul>');
    nodesData.forEach(function (nodeData) {
        var treeNode = getTreeNode(nodeData, config);
        tree.append(treeNode);
    });
    return tree;
}

// 根据根数据根节点，初始化树组件的dom结构
function initDom(topNode, config) {
    var container = $('<div class="shark-d-tree shark-tree"></div>');
    var tree = getChildTree(topNode.children, topNode.open, config);
    container.append(tree);
    return container;
}

// 重新排序子节点
function reOrderChildren(node, moves, config) {
    moves.forEach(function (move) {
        var childTree = $(node).children('ul');
        var nodeList = childTree.children('li');
        var index = move.index;
        if (move.type === 0) {
            var treeNode = nodeList.eq(index);
            treeNode.remove();
        } else if (move.type === 1) {
            var item = move.item;
            var treeNode = getTreeNode(item, config);
            if (index) {
                nodeList.eq(index - 1).after(treeNode);
            } else {
                childTree.prepend(treeNode);
            }
        }
    });
}

// 根据得到的当前节点的差异，修改当前节点
function applyPatches(node, currentPatches, config) {
    var title = node.children('.tree-title');
    var checkbox = node.children('.tree-checkbox');
    currentPatches.forEach(function (currentPatch) {
        switch (currentPatch.type) {
            case "REORDER":
                reOrderChildren(node, currentPatch.moves, config);
                break;
            case "NAME":
                title.text(currentPatch.name);
                break;
            case "STATE":
                toggleCheckBox(checkbox, currentPatch.state);
                break;
            case "SELECTED":
                toggleSelected(title, currentPatch.selected, config);
                break;
            case "OPEN":
                toggleChildTree(node, currentPatch.open);
                break;
            case "DISABLED":
                disabledNode(title, currentPatch.disabled);
                break;
            case "DISABLEDCHECKBOX":
                disabledCheckbox(checkbox, currentPatch.disabledCheckbox);
                break;
        }
    });
}

// 将节点状态设为disabled
function disabledNode(title, disabled) {
    title.removeClass('disabled');
    if (disabled) {
        title.addClass('disabled');
    }
}

// 将checkbox状态设为disabled
function disabledCheckbox(checkbox, disabledCheckbox) {
    checkbox.removeClass('disabled');
    if (disabledCheckbox) {
        checkbox.addClass('disabled');
    }
}

// 根据得到的差异数组，修改组件
function applyToTree(node, walker, patches, config) {
    var currentPatches = patches[walker.index];
    var treeNodes = node.children('ul').children('li');
    treeNodes.each(function (i, treeNode) {
        walker.index++;
        applyToTree($(treeNode), walker, patches, config);
    });
    currentPatches && applyPatches(node, currentPatches, config);
}

var TreeDom = {
    initDom: initDom,
    applyToTree: applyToTree
};
export { TreeDom };
