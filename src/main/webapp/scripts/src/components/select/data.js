
function allSelectedSpan(sharkComponent, checked) {
    sharkComponent.checkedList = [];
    var list = sharkComponent.selections.tree.topNode.children;
    if (checked) {
        list.forEach(function (item) {
            sharkComponent.checkedList.push(item);
        });
    }
}

var SelectData = {
    allSelectedSpan: allSelectedSpan
};
export { SelectData };
