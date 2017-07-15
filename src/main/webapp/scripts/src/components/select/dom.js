import $ from 'jquery';
import { Templates } from '../../common/templates';
import { DomHelper } from '../../common/domhelper';
import { DTree } from '../d-tree/d-tree.ui';

// 初始化selecter的dom
function initDom(checkedList, config) {
    var selecter = $(`<div class="shark-selecter position-relative">
                        <a class="selecter">
                            <span class="value"></span>
                            <span class="caret"></span>
                        </a>
                    </div>`);
    // 多选
    if (config.multiple) {
        selecter.addClass('selecter-multiple');
        // 存放选中项的容器
        var selectedConent = $('<ul class="selecter-items"></ul>');
        setSelectedMultiple(selectedConent, checkedList, config);
    } else {
        selecter.addClass('selecter-single');
        var selectedConent = $('<span class="selected"></span>');
        setSelectedSingle(selectedConent, checkedList, config);
    }
    selecter.append(selectedConent);
    return selecter;
}

function setSelectedSingle(selectedConent, checkedList, config) {
    if(checkedList.length) {
        selectedConent.html(checkedList[0][config.displayKey]);
    } else {
        selectedConent.empty();
    }
}

// 设置选中项
function setSelectedMultiple(selectedConent, checkedList, config) {
    selectedConent.empty();
    for (var i = 0; i < checkedList.length; i++) {
        var selecterItem = $(`<li class="selecter-item">${checkedList[i][config.displayKey]}</li>`);
        selectedConent.append(selecterItem);
    }
}

function allSelectedSpanDom(sharkComponent, config) {
    var checkedList = sharkComponent.checkedList;
    var selectedConent = sharkComponent.component.children('.selecter-items');
    setSelectedMultiple(selectedConent, checkedList, config);
}

function changeSelectDom1(sharkComponent, node, isChecked, config) {
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
    allSelectedSpanDom(sharkComponent, config);
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

// 初始化下拉列表的的dom
function initSelectionsDom(sharkComponent, config, treeConfig) {
    var selections = $('<div class="position-absolute shark-tree" style="display: none;"></div>');
    selections.attr('id', SharkUI.createUUID());
    treeConfig.onNodeChecked = function (node, isChecked) {
        changeSelectDom1(sharkComponent, node, isChecked, config);
    };
    treeConfig.onNodeSelected = function (node, isChecked) {
        changeSelectDom2(sharkComponent, node);
    };
    if (!config.multiple) {
        treeConfig.checkable = false;
        treeConfig.selectable = true;
    } else {
        treeConfig.checkable = true;
        treeConfig.selectable = false;
        var all = $(`<div><span class="tree-title tree-node-name">全部</span></div>`);
        var checkbox = $('<span class="tree-checkbox tree-icon tree-icon-check-empty check-all"></span>');
        all.prepend(checkbox);
        selections.append(all);
    }
    selections.tree = DTree.internalDTree(sharkComponent.topNode, treeConfig);
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

function toggleSelections(sharkComponent) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    if (selections.is(':hidden')) {
        var postion = DomHelper.calcOffset(selecter, selections, 'bottom');
        selections.css(postion);
        //显示待选列表
        selecter.addClass('open');
        selections.show();
        //设置待选列表样式
        selections.css({
            width: selecter.outerWidth()
        });
    } else {
        //隐藏待选列表
        selecter.removeClass('open');
        selections.hide();
        selecter.trigger('focusout');
    }
}

function closeSelections(sharkComponent) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    if (!selections.is(':hidden')) {
        selecter.removeClass('open');
        selections.hide();
        selecter.trigger('focusout');
    }
}

var SelectDom = {
    changeSelectDom1: changeSelectDom1,
    changeSelectDom2: changeSelectDom2,
    initDom: initDom,
    initSelectionsDom: initSelectionsDom,
    toggleAllState: toggleAllState,
    allSelectedSpanDom: allSelectedSpanDom,
    toggleSelections: toggleSelections,
    closeSelections: closeSelections
};
export { SelectDom };
