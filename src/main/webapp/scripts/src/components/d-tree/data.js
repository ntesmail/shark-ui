// 通过子节点的选中状态来决定父节点的选中状态（假设父节点的checked状态不对，也可以在此修正）
function setStateByChildNodes(parent, children) {
    // 子节点的数量
    var len = children.length;
    // 子节点的选中数量
    var checkedCount = 0;
    // 先将父节点的checked状态设为false，如果子节点全部选中了，再将其设为true
    parent.checked = false;
    for (var i = 0; i < len; i++) {
        var state = children[i].state;
        // 如果存在子节点处于半选状态，则父节点一定是半选状态，退出循环
        if (state === 1) {
            checkedCount = 'half';
            break;
        } else if (state === 2) {
            checkedCount++;
        }
    }
    switch (checkedCount) {
        case 0:
            parent.state = 0;
            break;
        case len:
            parent.state = 2;
            parent.checked = true;
            break;
        default:
            parent.state = 1;
    }
}

// 得到node的选中状态(选中/未选中/半选)
function getNodeState(node, children, link) {
    // 存在子节点并且父子节点之间有关联关系，由子节点决定父节点的state状态
    if (children && link) {
        setStateByChildNodes(node, children);
    } else {
        // 不存在子节点或者父子节点之间没有关联关系，由自身的checked状态来决定state状态
        node.state = node.checked ? 2 : 0;
    }
}

// 处理节点，为每个节点加上count属性，父节点id和选中状态 | (做递归处理)
function handleNode(node, link) {
    var children = node.children;
    node.count = 0;
    children && children.forEach(function (child) {
        handleNode(child, link);
        // 将父id存在节点上,方便查找
        child.parentId = node.id;
        // 统计子节点数量
        node.count += child.count + 1;
    });
    // 得到当前node的选中状态(选中/未选中/半选中)
    getNodeState(node, children, link);
}

// 获取数据根节点
function getTopNode(treeData, link) {
    var topNode = { children: treeData };
    // 处理节点，为每个节点加上count属性，父id和当前选中状态
    handleNode(topNode, link);
    return topNode;
}

// 全部展开（递归展开）
function openAll(node) {
    var children = node.children;
    if (children) {
        node.open = true;
        children.forEach(function (child) {
            openAll(child);
        });
    }
}

// 通过id查找节点
function getNodeById(node, id) {
    var children = node.children || [];
    if (node.id === id) {
        return node;
    } else {
        for (var i = 0; i < children.length; i++) {
            var node = getNodeById(children[i], id);
            if (node) {
                return node;
            }
        }
    }
}

// 修改子集的选中状态
function changeChildren(node) {
    var children = node.children || [];
    var checked = node.checked;
    children.forEach(function (child) {
        child.checked = checked;
        child.state = checked ? 2 : 0;
        changeChildren(child);
    });
}

// 修改父集的选中状态
function changeParent(newTopNode, id) {
    var node = getNodeById(newTopNode, id);
    if (node) {
        var children = node.children || [];
        setStateByChildNodes(node, children);
        node.parentId && changeParent(newTopNode, node.parentId);
    }
}

// 修改数据树的选中状态
function changeChecked(newTopNode, node, id, link) {
    var node = getNodeById(newTopNode, id);
    if (node) {
        // 切换节点checked状态
        node.checked = !node.checked;
        node.state = node.checked ? 2 : 0;
        if (link) {
            // 子集的checked属性与父级保持一致
            changeChildren(node);
            changeParent(newTopNode, node.parentId);
        }
    }
    return node;
}

// 修改数据树的展开和收起
function changeOpen(newTopNode, id) {
    var node = getNodeById(newTopNode, id);
    node.open = !node.open;
}

// 全选
function checkAll(newTopNode, flag) {
    newTopNode.checked = flag;
    changeChildren(newTopNode);
}

// 反选
function reverseCheck(newTopNode, node) {
    var children = node.children || [];
    children.forEach(function (child) {
        if (!child.children) {
            child.checked = !child.checked;
            child.state = child.checked ? 2 : 0;
        } else {
            reverseCheck(newTopNode, child);
        }
    });
    changeParent(newTopNode, node.id);
}

// 设置选中项
function setChecked(newTopNode, idList, link) {
    checkAll(newTopNode, false);
    idList.forEach(function (id) {
        var node = getNodeById(newTopNode, id);
        if (node) {
            node.checked = true;
        }
    });
    handleNode(newTopNode, link);
}

// 获取选中的id列表
function getChecked(topNode) {
    var idList = [];
    getCheckedItem(topNode, idList);
    return idList;
}

// 获取选中的id
function getCheckedItem(node, idList) {
    var children = node.children || [];
    children.forEach(function (child) {
        getCheckedItem(child, idList);
    });
    if (node.id && node.checked) {
        idList.push(node.id);
    }
}

// 打开某几个节点
function openTo(newTopNode, idList) {
    idList.forEach(function (id) {
        var node = getNodeById(newTopNode, id);
        if (node && node.children) {
            node.open = true;
        }
    });
}

var TreeData = {
    getTopNode: getTopNode,
    changeChecked: changeChecked,
    changeOpen: changeOpen,
    checkAll: checkAll,
    reverseCheck: reverseCheck,
    openAll: openAll,
    openTo: openTo,
    setChecked: setChecked,
    getChecked: getChecked
};
export { TreeData };
