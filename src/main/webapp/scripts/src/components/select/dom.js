import $ from 'jquery';
import { Templates } from '../../common/templates';
import { DomHelper } from '../../common/domhelper';
import { DTree } from '../d-tree/d-tree.ui';

// 初始化selecter的dom
function initDom(sharkComponent, config) {
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
        sharkComponent.selectedConent = selectedConent;
        setSelectedMultiple(sharkComponent, config);
    } else {
        selecter.addClass('selecter-single');
        var selectedConent = $('<span class="selected"></span>');
        sharkComponent.selectedConent = selectedConent;
        setSelectedSingle(sharkComponent, config);
    }
    selecter.append(selectedConent);
    return selecter;
}

// 设置单选选中项
function setSelectedSingle(sharkComponent, config) {
    if (sharkComponent.selectedItem) {
        sharkComponent.selectedConent.html(sharkComponent.selectedItem[config.displayKey]);
    } else {
        sharkComponent.selectedConent.empty();
    }
}

// 设置多选选中项
function setSelectedMultiple(sharkComponent, config) {
    sharkComponent.selectedConent.empty();
    for (var i = 0; i < sharkComponent.checkedList.length; i++) {
        var selecterItem = $(`<li class="selecter-item">${sharkComponent.checkedList[i][config.displayKey]}</li>`);
        sharkComponent.selectedConent.append(selecterItem);
    }
}

// 初始化下拉列表的的dom
function initSelectionsDom(sharkComponent, topNode, treeConfig, config) {
    var selections = $('<div class="position-absolute shark-tree" style="display: none;"></div>');
    selections.attr('id', SharkUI.createUUID());
    // 多选
    if (config.multiple) {
        var checkAllItem = $(`<div><span class="tree-title tree-node-name">全部</span></div>`);
        var checkAllBtn = $('<span class="tree-checkbox tree-icon tree-icon-check-empty check-all"></span>');
        checkAllItem.prepend(checkAllBtn);
        selections.append(checkAllItem);
        sharkComponent.checkAllBtn = checkAllBtn;
        toggleAllState(sharkComponent);
    }
    selections.tree = DTree.internalDTree(topNode, treeConfig);
    selections.tree.appendTo(selections);
    sharkComponent.selections = selections;
    $(document.body).append(selections);
}

// checked值发生变化时，下拉菜单发生的变化（多选）
function changeSelectedMultiple(sharkComponent, node, isChecked, config) {
    setSelectedMultiple(sharkComponent, config);
    toggleAllState(sharkComponent);
}

// selected值发生变化时，下拉菜单发生的变化(单选)
function changeSelectSingle(sharkComponent, node, config) {
    setSelectedSingle(sharkComponent, config);
    sharkComponent.selections.hide();
    sharkComponent.component.trigger('focusout');
}

// 修改全选按钮的状态
function toggleAllState(sharkComponent) {
    sharkComponent.checkAllBtn.removeClass('tree-icon-check-empty tree-icon-check-minus tree-icon-check');
    var classObj = {
        '0': 'tree-icon-check-empty',
        '1': 'tree-icon-check-minus',
        '2': 'tree-icon-check'
    };
    sharkComponent.checkAllBtn.addClass(classObj[sharkComponent.allState]);
}

// 下拉菜单的展开和收起
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
        closeSelections(sharkComponent);
    }
}

// 收起下拉菜单
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
    changeSelectedMultiple: changeSelectedMultiple,
    changeSelectSingle: changeSelectSingle,
    initDom: initDom,
    initSelectionsDom: initSelectionsDom,
    toggleAllState: toggleAllState,
    setSelectedMultiple: setSelectedMultiple,
    toggleSelections: toggleSelections,
    closeSelections: closeSelections
};
export { SelectDom };
