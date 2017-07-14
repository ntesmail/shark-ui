// 全选/全不选
function checkAll(topNode, flag) {
    // 修改顶层树节点的状态
    topNode.checked = flag;
    // 子节点的状态由父节点决定
    checkChildren(topNode);
}

// 修改子集的选中状态
function checkChildren(parent) {
    var children = parent.children || [];
    children.forEach(function (child) {
        child.checked = parent.checked;
        setCheckState(child, false);
        checkChildren(child);
    });
}

// 通过id查找节点，并修改节点属性值为穿入值
function changeNodeAttrById(topNode, id, attrName, attrVal) {
    var node = getNodeById(topNode, id);
    node && (node[attrName] = attrVal);
    return node;
}

// 修改数据树的展开和收起
function changeOpen(topNode, id) {
    return reverseAttrById(topNode, id, "open");
}

// 修改父集的选中状态
function checkParent(topNode, id) {
    var node = getNodeById(topNode, id);
    if (node) {
        setCheckState(node, true);
        node.parentId && checkParent(topNode, node.parentId);
    }
}

// 通过id查找节点
function getNodeById(node, id) {
    var children = node.children || [];
    if (node.id === id) {
        return node;
    } else {
        for (var i = 0; i < children.length; i++) {
            var child = getNodeById(children[i], id);
            if (child) {
                return child;
            }
        }
    }
}

// 根据某种状态获取节点列表
function getNodeList(nodeTree, key, nodeList) {
    var children = nodeTree.children || [];
    nodeList = nodeList || [];
    children.forEach(function (childTree) {
        getNodeList(childTree, key, nodeList);
    });
    if (nodeTree.id && nodeTree[key]) {
        nodeList.push(nodeTree);
    }
    return nodeList;
}

// 获取数据根节点
function getTopNode(treeData, config) {
    var topNode = { children: treeData };
    // 处理节点，为每个节点加上count属性，父id和当前选中状态
    handleNode(topNode, config);
    return topNode;
}

// 处理节点，为每个节点加上count属性，父节点id和选中状态 | (做递归处理)
function handleNode(node, config) {
    var children = node.children;
    node.count = 0;
    children && children.forEach(function (child) {
        handleNode(child, config);
        // 将父id存在节点上,方便查找
        child.parentId = node.id;
        // 统计子节点数量
        node.count += child.count + 1;
    });
    // 设置node的选中状态(选中/未选中/半选中)
    setCheckState(node, config.link);
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

// 打开某几个节点
function openTo(topNode, idList, autoOpenParent) {
    idList.forEach(function (id) {
        openNode(topNode, id, autoOpenParent);
    });
}

function openNode(topNode, id, autoOpenParent) {
    var node = changeNodeAttrById(topNode, id, 'open', true);
    if (autoOpenParent && node.parentId) {
        openNode(topNode, node.parentId, autoOpenParent);
    }
}

// 通过id查找节点，并将特定属性值取反
function reverseAttrById(topNode, id, attrName) {
    var node = getNodeById(topNode, id);
    if (node) {
        node[attrName] = !node[attrName];
    }
    return node;
}

// 反选
function reverseCheck(topNode, node) {
    var children = node.children || [];
    children.forEach(function (child) {
        if (!child.children) {
            child.checked = !child.checked;
            setCheckState(child, false);
        } else {
            reverseCheck(topNode, child);
        }
    });
    checkParent(topNode, node.id);
}

// 全选/全不选
function selectAll(node, flag) {
    var children = node.children || [];
    node.selected = flag;
    children.forEach(function (child) {
        selectAll(child);
    });
}

// 设置选中项
function setChecked(topNode, idList, flag, replace, config) {
    // 如果是替换，则将原来选中的值全部置空
    if (replace) {
        checkAll(topNode, false);
    }
    idList.forEach(function (id) {
        changeNodeAttrById(topNode, id, 'checked', flag);
    });
    handleNode(topNode, config);
}

// 设置选中状态 (decideByChildren:父节点的状态是否由由子节点决定)
function setCheckState(node, decideByChildren) {
    var children = node.children;
    if (decideByChildren && children) {
        var len = children.length;
        // 子节点的选中数量
        var checkedCount = 0;
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
                node.state = 0;
                break;
            case len: // 子节点的数量
                node.state = 2;
                break;
            default:
                node.state = 1;
        }
        node.checked = (node.state === 2 ? true : false);
    } else {
        node.state = node.checked ? 2 : 0;
    }
}

// 切换选中状态（节点本身）
function toggleSelect(topNode, id, config) {
    // 如果是单选，先将所有节点置为未选中状态
    if (!config.multiple) {
        selectAll(topNode, false);
    }
    var node = getNodeById(topNode, id);
    node.selected = !node.selected;
    return node;
}

// 修改数据节点的选中（节点本身）
function selectNode(topNode, id, config) {
    // 如果是单选，先将所有节点置为未选中状态
    if (!config.multiple) {
        selectAll(topNode, false);
    }
    return changeNodeAttrById(topNode, id, 'selected', true);
}

// 设置选中项（节点本身）
function setSelected(topNode, idList, replace, config) {
    if (replace) {
        selectAll(topNode, false);
    }
    idList.forEach(function (id) {
        selectNode(topNode, id, config);
    });
}

// 切换数据节点的选中状态
function toggleCheck(topNode, id, config) {
    var node = reverseAttrById(topNode, id, "checked");
    if (node) {
        setCheckState(node, false);
        // 修改其父子节点选中的状态
        if (config.link) {
            checkChildren(node);
            checkParent(topNode, node.parentId);
        }
    }
    return node;
}

var TreeData = {
    changeOpen: changeOpen,
    checkAll: checkAll,
    getNodeList: getNodeList,
    getTopNode: getTopNode,
    openAll: openAll,
    openTo: openTo,
    reverseCheck: reverseCheck,
    toggleSelect: toggleSelect,
    selectNode: selectNode,
    setChecked: setChecked,
    setSelected: setSelected,
    toggleCheck: toggleCheck
};
export { TreeData };
