// 将数组转成 key : index 形式的字符串
function changeArrToKeyIndex(list) {
    var keyIndex = {};
    list.forEach(function (item, i) {
        var itemKey = item.id;
        keyIndex[itemKey] = i;
    });
    return keyIndex;
}

// 数组对比
function listDiff(oldList, newList) {
    var oldKeyIndex = changeArrToKeyIndex(oldList);
    var newKeyIndex = changeArrToKeyIndex(newList);
    var moves = [];
    var children = [];
    // 首先新老对比,检查相对于新集,老集是否有元素被删除
    oldList.forEach(function (item) {
        var itemKey = item.id;
        if (!newKeyIndex.hasOwnProperty(itemKey)) {
            children.push(null);
        } else {
            var newItemIndex = newKeyIndex[itemKey];
            children.push(newList[newItemIndex]);
        }
    });
    // 临时数组
    var tempList = children.slice(0);
    for (var i = 0; i < tempList.length; i++) {
        if (tempList[i] === null) {
            remove(i);
            tempList.splice(i, 1);
            i--;
        }
    }
    var j = 0;
    newList.forEach(function (item, i) {
        var itemKey = item.id;
        var tempItem = tempList[j];
        var tempItemKey = tempItem && tempItem.id;
        if (tempItem) {
            if (itemKey === tempItemKey) {
                j++;
            } else {
                if (!oldKeyIndex.hasOwnProperty(itemKey)) {
                    insert(i, item);
                } else {
                    var nextItemKey = tempList[j + 1].id;
                    if (nextItemKey === itemKey) {
                        remove(i);
                        tempList.splice(j, 1);
                        j++;
                    } else {
                        insert(i, item);
                    }
                }
            }
        } else {
            insert(i, item);
        }
    });
    function remove(index) {
        var move = { index: index, type: 0 };
        moves.push(move);
    }
    function insert(index, item) {
        var move = { index: index, item: item, type: 1 };
        moves.push(move);
    }
    return {
        moves: moves,
        children: children
    };
}

// 对比同一父节点下子节点的差异
function compareChildren(oldChildren, newChildren, index, patches, currentPatch) {
    var diffs = listDiff(oldChildren, newChildren);
    newChildren = diffs.children;
    if (diffs.moves.length) {
        var reorderPatch = { type: "REORDER", moves: diffs.moves };
        currentPatch.push(reorderPatch);
    }
    var leftNode = null;
    var currentNodeIndex = index;
    oldChildren && oldChildren.forEach(function (child, i) {
        var newChild = newChildren[i];
        currentNodeIndex = (leftNode && leftNode.count) ? currentNodeIndex + leftNode.count + 1 : currentNodeIndex + 1;
        compareNode(child, newChild, currentNodeIndex, patches);
        leftNode = child;
    });
}

function diffProps(oldNode, newNode) {
    var count = 0;
    var propsPatches = {};
    if (oldNode && newNode) {
        if (oldNode.name !== newNode.name) {
            count++;
            propsPatches.name = newNode.name;
        }
        if (oldNode.state !== newNode.state) {
            count++;
            propsPatches.state = newNode.state;
        }
        if (oldNode.open !== newNode.open) {
            count++;
            propsPatches.open = newNode.open;
        }
    }
    if (count === 0) {
        return null;
    }
    return propsPatches;
}

// 对比两个相同位置的节点之间的差异
function compareNode(oldNode, newNode, index, patches) {
    var currentPatch = [];
    if (newNode) {
        var propsPatches = diffProps(oldNode, newNode);
        if (propsPatches) {
            currentPatch.push({ type: "PROPS", props: propsPatches });
        }
        compareChildren(
            oldNode.children || [],
            newNode.children || [],
            index,
            patches,
            currentPatch
        );
    }
    if (currentPatch.length) {
        patches[index] = currentPatch;
    }
}

// 得到两棵数据树的差异
function diff(oldTopNode, newTopNode) {
    var index = 0;
    var patches = {};
    // 比较新老根元素节点
    compareNode(oldTopNode, newTopNode, index, patches);
    return patches;
}

var Diff = {
    diff: diff
};

export { Diff };