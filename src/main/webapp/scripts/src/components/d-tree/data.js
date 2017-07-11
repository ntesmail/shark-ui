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

// 通过count来决定元素的选中状态, 父级checked状态不对，可以在此修正
function setStateByCount(node, children) {
    node.checked = false;
    var checkedCount = 0;
    var len = children.length;
    for (var i = 0; i < len; i++) {
        var child = children[i];
        // 如果是存在子节点是半选状态，则父节点一定是半选状态，没有必要再循环下去，因此退出循环
        if (child.state === 1) {
            checkedCount = 'half';
            break;
        }
        if (child.checked) {
            checkedCount++;
        }
    }
    switch (checkedCount) {
        case 0:
            node.state = 0;
            break;
        case len:
            node.state = 2;
            node.checked = true;
            break;
        default:
            node.state = 1;
    }
}

// 得到node的选中状态(选中/未选中/半选)
function getNodeState(node, children, link) {
    if (children && children.length && link) { // 存在子节点，由子节点决定state状态
        setStateByCount(node, children);
    } else { // 不存在子节点，由自身的checked状态来决定state状态
        node.state = node.checked ? 2 : 0;
    }
}

// 处理节点，为每个节点加上count属性，父节点id和选中状态 | (做递归处理)
function handleNode(node, link) {
    var children = node.children || [];
    node.count = 0;
    children.forEach(function (child) {
        handleNode(child, link);
        child.parentId = node.id;
        node.count += child.count + 1;
    });
    // 得到node的选中状态(选中/未选中/半选)
    getNodeState(node, children, link);
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
        setStateByCount(node, children);
        node.parentId && changeParent(newTopNode, node.parentId);
    }
}

// 获取数据根节点
function getTopNode(nodes, link) {
    var topNode = { children: nodes };
    // 处理节点，为每个节点加上count属性和父节点id和选中状态
    handleNode(topNode, link);
    return topNode;
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

// 展开全部
function openAll(node) {
    var children = node.children || [];
    if (children.length) {
        node.open = true;
    }
    children.forEach(function (child) {
        openAll(child);
    });
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
    if (node.checked) {
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

var Data = {
    getTopNode: getTopNode,
    changeChecked: changeChecked,
    changeOpen: changeOpen,
    checkAll: checkAll,
    reverseCheck: reverseCheck,
    openAll: openAll,
    setChecked: setChecked,
    getChecked: getChecked,
    openTo: openTo
};
export { Data };
