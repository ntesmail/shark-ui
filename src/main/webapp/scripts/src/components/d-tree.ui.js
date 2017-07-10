/**
 * @author lq
 * @description d-tree插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { BaseComponent } from '../common/base';

var patch = {
    REORDER: 1,
    PROPS: 2
};

// 得到两棵数据树的差异
function diff(oldTopNode, newTopNode) {
    var index = 0;
    var patches = {};
    compareNode(oldTopNode, newTopNode, index, patches);
    return patches;
}

// 对比两个相同位置的节点之间的差异
function compareNode(oldNode, newNode, index, patches) {
    var currentPatch = [];
    if (newNode) {
        var propsPatches = diffProps(oldNode, newNode);
        if (propsPatches) {
            currentPatch.push({ type: patch.PROPS, props: propsPatches });
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

// 对比同一父节点下子节点的差异
function compareChildren(oldChildren, newChildren, index, patches, currentPatch) {
    var diffs = listDiff(oldChildren, newChildren);
    newChildren = diffs.children;
    if (diffs.moves.length) {
        var reorderPatch = { type: patch.REORDER, moves: diffs.moves };
        currentPatch.push(reorderPatch);
    }
    var leftNode = null;
    var currentNodeIndex = index;
    oldChildren && oldChildren.forEach(function (child, i) {
        var newChild = newChildren[i]
        currentNodeIndex = (leftNode && leftNode.count) ? currentNodeIndex + leftNode.count + 1 : currentNodeIndex + 1;
        compareNode(child, newChild, currentNodeIndex, patches);
        leftNode = child;
    });
}

function listDiff(oldList, newList) {
    var oldKeyIndex = changeArrToKeyIndex(oldList);
    var newKeyIndex = changeArrToKeyIndex(newList);
    var moves = [];
    var children = [];
    var i = 0;
    var item, itemKey;
    for (var i = 0; i < oldList.length; i++) {
        item = oldList[i];
        itemKey = item.node_id;
        if (!newKeyIndex.hasOwnProperty(itemKey)) {
            children.push(null);
        } else {
            var newItemIndex = newKeyIndex[itemKey]
            children.push(newList[newItemIndex]);
        }
    }
    var simulateList = children.slice(0);
    for (var i = 0; i < simulateList.length; i++) {
        if (simulateList[i] === null) {
            remove(i);
            removeSimulate(i);
            i--;
        }
    }
    var j = 0;
    for (var i = 0; i < newList.length; i++) {
        item = newList[i];
        itemKey = item.node_id;
        var simulateItem = simulateList[j];
        var simulateItemKey = simulateItem && simulateItem.node_id;
        if (simulateItem) {
            if (itemKey === simulateItemKey) {
                j++;
            } else {
                if (!oldKeyIndex.hasOwnProperty(itemKey)) {
                    insert(i, item);
                } else {
                    var nextItemKey = simulateList[j + 1].node_id;
                    if (nextItemKey === itemKey) {
                        remove(i);
                        removeSimulate(j);
                        j++
                    } else {
                        insert(i, item);
                    }
                }
            }
        } else {
            insert(i, item);
        }
    }
    function remove(index) {
        var move = { index: index, type: 0 };
        moves.push(move);
    }
    function insert(index) {
        var move = { index: index, item: item, type: 1 };
        moves.push(move);
    }
    function removeSimulate(index) {
        simulateList.splice(index, 1);
    }
    return {
        moves: moves,
        children: children
    }
}

function diffProps(oldNode, newNode) {
    var count = 0;
    var propsPatches = {};
    if (oldNode && newNode) {
        if (oldNode.node_id !== newNode.node_id) {
            count++;
            propsPatches.node_id = newNode.node_id;
        }
        if (oldNode.node_name !== newNode.node_name) {
            count++;
            propsPatches.node_name = newNode.node_name;
        }
        if (oldNode.checked !== newNode.checked) {
            count++;
            propsPatches.checked = newNode.checked;
        }
    }
    if (count === 0) {
        return null;
    }
    return propsPatches;
}

// 将数组转成 key : index 形式的字符串
function changeArrToKeyIndex(list) {
    var keyIndex = {};
    var len = list && list.length;
    for (var i = 0; i < len; i++) {
        var itemKey = list[i].node_id;
        keyIndex[itemKey] = i;
    }
    return keyIndex;
}

// 为每个节点加上count属性
function getNodeCount(node) {
    var children = node.children || [];
    node.count = 0;
    children.forEach(function (child, i) {
        getNodeCount(child);
        child.parent = node.node_id;
        node.count += child.count + 1;
    });
}

// 获取数据根节点
function getTopNode(nodes) {
    var topNode = { children: nodes };
    getNodeCount(topNode);
    return topNode;
}

function getUlDom(nodes) {
    var ul = $('<ul></ul>');
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var li = $('<li></li>');
        li.attr('id', node.node_id);
        var checkbox = $('<input type="checkbox" />');
        checkbox.prop('checked', node.checked);
        var span = $('<span></span>');
        span.html(node.node_name);
        li.append(checkbox);
        li.append(span);
        if (node && node.children) {
            var cUl = getUlDom(node.children);
            li.append(cUl);
        }
        ul.append(li);
    }
    return ul;
}

// 初始化树
function initDom(sharkComponent, config, targetElement) {
    sharkComponent.component = $('<div></div>');
    var oUl = getUlDom(sharkComponent.topNode.children || []);
    sharkComponent.component.append(oUl);
    if (targetElement) {
        targetElement.append(sharkComponent.component);
    }
}

// 修改子集的选中状态
function changeChildren(children, checked) {
    for (var i = 0; i < children.length; i++) {
        children[i].checked = checked;
        changeChildren(children[i].children || [], checked);
    }
}

// 修改父集的选中状态
function changeParent(sharkComponent, node, id) {
    var children = node.children || [];
    if (node.node_id === id) {
        var checked = true;
        for (var i = 0; i < children.length; i++) {
            if (!children[i].checked) {
                checked = false;
            }
        }
        node.checked = checked;
        if (node.parent) {
            changeParent(sharkComponent, sharkComponent.newTopNode, node.parent);
        }

        return true;
    } else {
        for (var i = 0; i < children.length; i++) {
            var flag = changeParent(sharkComponent, children[i], id);
            if (flag) {
                return true;
            }
        }
    }
}

// 修改数据树的选中状态
function changeChecked(sharkComponent, node, id) {
    var children = node.children || [];
    var checked = null;
    if (node.node_id === id) {
        node.checked = !node.checked;
        checked = node.checked;
        changeChildren(children, checked);
        changeParent(sharkComponent, sharkComponent.newTopNode, node.parent);
        return true;
    } else {
        for (var i = 0; i < children.length; i++) {
            var flag = changeChecked(sharkComponent, children[i], id);
            if (flag) {
                return true;
            }
        }
    }
}

function patchs(node, patches) {
    var walker = { index: 0 };
    aaa(node, walker, patches);
}

function aaa(node, walker, patches) {
    var currentPatches = patches[walker.index];
    var node = $(node);
    var aLi = node.children('ul').children('li');
    for (var i = 0; i < aLi.length; i++) {
        var child = aLi[i];
        walker.index++;
        aaa(child, walker, patches);
    }
    if (currentPatches) {
        applyPatches(node, currentPatches);
    }
}

function applyPatches(node, currentPatches) {
    for (var i = 0; i < currentPatches.length; i++) {
        var currentPatch = currentPatches[i];
        switch (currentPatch.type) {
            case patch.REORDER:
                reOrderChildren(node, currentPatch.moves);
                break;
            case patch.PROPS:
                setProps(node, currentPatch.props);
                break;
        }
    }
}

function setProps(node, props) {
    var span = node.children('span');
    var checkbox = node.children('input');
    if (checkbox.length) {
        for (var key in props) {
            switch (key) {
                case "node_name":
                    span.text(props[key]);
                    break;
                case "checked":
                    if (!props[key]) {
                        checkbox.prop('checked', false);
                    } else {
                        checkbox.prop('checked', true);
                    }
                    break;
            }
        }
    }
}

function reOrderChildren(node, moves) {
    for (var i = 0; i < moves.length; i++) {
        var ul = $(node).children('ul');
        var staticNodeList = $(node).children('ul').children('li');
        var move = moves[i];
        var index = move.index;
        if (move.type === 0) {
            var li = staticNodeList.eq(index);
            li.remove();
        } else if (move.type === 1) {
            var item = move.item;
            var li = $('<li>');
            li.attr('id', item.node_id);
            var checkbox = $('<input type="checkbox" />');
            checkbox.prop('checked', item.checked);
            checkbox.attr('readonly', 'readonly');
            var span = $('<span>');
            span.html(item.node_name);
            li.append(checkbox);
            li.append(span);

            if (item.children) {
                var ul = getUlDom(item.children);
                li.append(ul);
            }
            if (index) {
                staticNodeList.eq(index - 1).after(li);
            } else {
                ul.prepend(li);
            }
        }
    }
}

// 初始化事件
function initEvents(sharkComponent, config) {
    sharkComponent.component.on('click', 'li', function (e) {
        var li = $(e.currentTarget);
        var id = li.attr('id');
        sharkComponent.newTopNode = $.extend(true, {}, sharkComponent.topNode);
        // 修改新的数据树的选中状态
        changeChecked(sharkComponent, sharkComponent.newTopNode, id);
        // 得到两棵数据树的差异
        var patches = diff(sharkComponent.topNode, sharkComponent.newTopNode);
        patchs(sharkComponent.component, patches);
        sharkComponent.topNode = sharkComponent.newTopNode;
        e.stopPropagation();
    });
}

// 重新render
function render(sharkComponent, newTreeData) {
    var topNode = { children: newTreeData };
    getNodeCount(topNode);
    var patches = diff(sharkComponent.topNode, topNode);
    patchs(sharkComponent.component, patches);
    sharkComponent.topNode = topNode;
}

SharkUI.sharkDTree = function (options, targetElement) {
    var config = {
        nodes: []
    };
    SharkUI.extend(config, options);
    var sharkComponent = {};
    sharkComponent.topNode = getTopNode(config.nodes);
    initDom(sharkComponent, config, targetElement);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);
    sharkComponent.render = function (nodes) {
        render(sharkComponent, nodes);
    };
    return sharkComponent;
}
