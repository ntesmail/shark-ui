// 通过count来决定元素的选中状态, 父级checked状态不对，可以在此修正
function setStateByCount(node, children) {
    var checkedCount = 0;
    var len = children.length;
    for (var i = 0; i < len; i++) {
        var child = children[i];
        // 如果是存在子节点是半选状态，则父节点一定是半选状态，没有必要再循环下去，因此结束循环
        if (child.state === 1) {
            checkedCount = 'minus';
            break;
        }
        if (child.checked) {
            checkedCount++;
        }
    }
    switch (checkedCount) {
        case 0:
            node.state = 0;
            node.checked = false;
            break;
        case len:
            node.state = 2;
            node.checked = true;
            break;
        default:
            node.state = 1;
            node.checked = false;
    }
}

// 得到node的选中状态(选中/未选中/半选)
function getNodeState(node, children) {
    if (children) { // 存在子节点，由子节点决定state状态
        // 通过count来决定元素的选中状态
        setStateByCount(node, children);
    } else { // 不存在子节点，由自身的checked状态来决定state状态
        node.state = node.checked ? 2 : 0;
    }
}

// 处理节点，为每个节点加上count属性，父节点id和选中状态 | (做递归处理)
function handleNode(node) {
    var children = node.children;
    node.count = 0;
    children && children.forEach(function (child) {
        handleNode(child);
        child.parentId = node.node_id;
        node.count += child.count + 1;
    });
    // 得到node的选中状态(选中/未选中/半选)
    getNodeState(node, children);
}

// 获取数据根节点
function getTopNode(nodes) {
    var topNode = { children: nodes };
    // 处理节点，为每个节点加上count属性和父节点id和选中状态
    handleNode(topNode);
    return topNode;
}

// 修改子集的选中状态
function changeChildren(children, checked) {
    children.forEach(function (child) {
        child.checked = checked;
        child.state = checked ? 2 : 0;
        var iChildren = child.children;
        iChildren && changeChildren(iChildren, checked);
    });
}

// 修改父集的选中状态
function changeParent(newTopNode, node, id) {
    var children = node.children || [];
    if (node.node_id === id) {
        setStateByCount(node, children);
        // 检查是否还存在父级
        node.parentId && changeParent(newTopNode, newTopNode, node.parentId);
        return node;
    } else {
        for (var i = 0; i < children.length; i++) {
            var node = changeParent(newTopNode, children[i], id);
            if (node) {
                return node;
            }
        }
    }
}

// 修改数据树的选中状态
function changeChecked(newTopNode, node, id) {
    var children = node.children || [];
    if (node.node_id === id) {
        // 切换节点checked状态
        node.checked = !node.checked;
        node.state = node.checked ? 2 : 0;
        // 子集的checked属性与父级保持一致
        changeChildren(children, node.checked);
        changeParent(newTopNode, newTopNode, node.parentId);
        return node;
    } else {
        for (var i = 0; i < children.length; i++) {
            var node = changeChecked(newTopNode, children[i], id);
            // 如果node存在，没有必要再循环下去，直接返回
            if (node) {
                return node;
            }
        }
    }
}

// 修改数据树的选中状态
function changeOpen(node, id) {
    var children = node.children || [];
    if (node.node_id === id) {
        // 切换节点checked状态
        node.open = !node.open;
        return node;
    } else {
        for (var i = 0; i < children.length; i++) {
            var node = changeOpen(children[i], id);
            // 如果node存在，没有必要再循环下去，直接返回
            if (node) {
                return node;
            }
        }
    }
}

var DataProcess = {
    getTopNode: getTopNode,
    changeChecked: changeChecked,
    changeOpen: changeOpen
};

export { DataProcess };