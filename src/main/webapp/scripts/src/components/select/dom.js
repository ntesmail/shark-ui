import $ from 'jquery';
import { Templates } from '../../common/templates';

// selecter模板
var templateSelecter = Templates.selecter;
var templateSelecterFun = Templates.templateAoT(templateSelecter);

function changeSelectDom1(sharkComponent, node, isChecked) {
    var checkedList = sharkComponent.checkedList;
    var index = -1;
    for (var i = 0; i < checkedList.length; i++) {
        if (node.id === checkedList[i].id) {
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

    allSelectedSpanDom(sharkComponent);
    var len = sharkComponent.selections.tree.topNode.children.length;
    switch (checkedList.length) {
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
    SelectDom.toggleAllState(sharkComponent);
}

function changeSelectDom2(sharkComponent, node) {
    sharkComponent.component.empty();
    var li = $(`<li style="font-size: 16px;display: inline;">${node.name}</li>`);
    sharkComponent.component.append(li);
    sharkComponent.selections.hide();
    sharkComponent.component.trigger('focusout');
}

// 初始化selecter的dom
function initDom(sharkComponent, config) {
    var component = $(templateSelecterFun.apply(config));
    component.addClass('shark-selecter');
    return component;
}

// 初始化下拉列表的的dom
function initSelectionsDom(sharkComponent, config) {
    var selections = $('<div class="position-absolute shark-tree" style="display: none;"></div>');
    selections.attr('id', SharkUI.createUUID());
    var options = {
        nodes: config.data,
        actualKey: config.actualKey,
        displayKey: config.displayKey,
        onNodeChecked: function (node, isChecked) {
            changeSelectDom1(sharkComponent, node, isChecked);
        },
        onNodeSelected: function (node, isChecked) {
            changeSelectDom2(sharkComponent, node);
        }
    };
    if (!config.multiple) {
        options.checkable = false;
        options.selectable = true;
    } else {
        options.checkable = true;
        options.selectable = false;
        var all = $(`<div><span class="tree-title tree-node-name">全部</span></div>`);
        var checkbox = $('<span class="tree-checkbox tree-icon tree-icon-check-empty check-all"></span>');
        all.prepend(checkbox);
        selections.append(all);
    }
    selections.tree = SharkUI.sharkDTree(options);
    selections.tree.appendTo(selections);
    sharkComponent.selections = selections;
    toggleAllState(sharkComponent)
    $(document.body).append(selections);
}

function toggleAllState(sharkComponent) {
    var checkbox = sharkComponent.selections.find('.check-all');
    checkbox.removeClass('tree-icon-check-empty tree-icon-check-minus tree-icon-check');
    var classObj = {
        '0': 'tree-icon-check-empty',
        '1': 'tree-icon-check-minus',
        '2': 'tree-icon-check'
    };
    checkbox.addClass(classObj[sharkComponent.allState]);
}

function allSelectedSpanDom(sharkComponent) {
    var checkedList = sharkComponent.checkedList;
    sharkComponent.component.empty();
    for (var i = 0; i < checkedList.length; i++) {
        var li = $(`<li style="font-size: 16px;display: inline;">
                        ${checkedList[i].name}
                        <span class="remove">X</span>
                    </li>`);
        li.data('node', checkedList[i]);
        sharkComponent.component.append(li);
    }
}

var SelectDom = {
    changeSelectDom1: changeSelectDom1,
    changeSelectDom2: changeSelectDom2,
    initDom: initDom,
    initSelectionsDom: initSelectionsDom,
    toggleAllState: toggleAllState,
    allSelectedSpanDom: allSelectedSpanDom
};
export { SelectDom };
