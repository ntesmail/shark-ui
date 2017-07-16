// 修改选中列表和全选按钮状态
function changeCheckedListAndAllState(sharkComponent, node, isChecked, config) {
    var checkedList = changeCheckedList(sharkComponent, node, isChecked, config);
    var len = null;
    if (sharkComponent.selections) {
        len = sharkComponent.selections.tree.topNode.children.length;

    } else {
        len = sharkComponent.topNode.children.length;
    }
    changeAllState(sharkComponent, len, checkedList.length);
}

// 修改选中列表
function changeCheckedList(sharkComponent, node, isChecked, config) {
    var checkedList = sharkComponent.checkedList;
    var index = -1;
    for (var i = 0; i < checkedList.length; i++) {
        if (node[config.actualKey] === checkedList[i][config.actualKey]) {
            index = i;
            break;
        }
    }
    if (index === -1 && isChecked) {
        checkedList.push(node);
    }
    if (index !== -1 && !isChecked) {
        checkedList.splice(index, 1);
    }
    return checkedList;
}

// 修改全选按钮状态
function changeAllState(sharkComponent, len, checkedLen) {
    switch (checkedLen) {
        case 0:
            sharkComponent.allState = 0;
            break;
        case len:
            sharkComponent.allState = 2;
            break;
        default:
            sharkComponent.allState = 1;
            break;
    }
}

var SelectData = {
    changeCheckedListAndAllState: changeCheckedListAndAllState
};
export { SelectData };
