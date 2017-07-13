/**
 * @author lq
 * @description select插件
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
import { BaseComponent } from '../../common/base';
import { Templates } from '../../common/templates';
import { Event } from '../../common/event';
import { DomHelper } from '../../common/domhelper';

// selecter模板
var templateSelecter = Templates.selecter;
var templateSelecterFun = Templates.templateAoT(templateSelecter);

// 初始化selecter的dom
function initDom(sharkComponent, config, targetElement) {
    sharkComponent.component = $(templateSelecterFun.apply(config));
    sharkComponent.component.addClass('shark-selecter');
}

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
    sharkComponent.component.empty();
    for (var i = 0; i < checkedList.length; i++) {
        var li = $(`<li style="font-size: 16px;display: inline;">
                        ${checkedList[i].name}
                        <span class="remove">X</span>
                    </li>`);
        li.data('node', checkedList[i]);
        sharkComponent.component.append(li);
    }
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
    toggleAllState(sharkComponent);
}

function changeSelectDom2(sharkComponent, node) {
    sharkComponent.component.empty();
    var li = $(`<li style="font-size: 16px;display: inline;">${node.name}</li>`);
    sharkComponent.component.append(li);
    sharkComponent.selections.hide();
    sharkComponent.component.trigger('focusout');
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

// 初始化下拉列表的的dom
function initSelectionsDom(sharkComponent, config) {
    var selections = $('<div class="position-absolute shark-tree" style="display: none;"></div>');
    selections.attr('id', SharkUI.createUUID());
    var options = {
        nodes: config.data,
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

// 初始化事件
function initEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    selecter.on('click.selecter', '.selecter', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.selections) {
            // 如果还没有初始化过selections，在这里先初始化
            initSelectionsDom(sharkComponent, config);
            initSelectionsEvents(sharkComponent, config);
        }
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
    }));

    selecter.on('click.selecter', '.remove', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        var node = $(evt.currentTarget).parent('li').data('node');
        sharkComponent.selections.tree.setUnChecked([node.id]);
        changeSelectDom1(sharkComponent, node, false);
    }))
}

// 初始化下拉列表事件
function initSelectionsEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    selections.on('click', '.check-all', function (evt) {
        if (sharkComponent.allState === 2) {
            sharkComponent.selections.tree.checkNo();
            sharkComponent.allState = 0;

        } else {
            sharkComponent.selections.tree.checkAll();
            sharkComponent.allState = 2;
        }
        toggleAllState(sharkComponent)
    });

    // 点击除了组件之外的地方，收起下拉列表
    Event.addCloseListener(
        selections.attr('id'),
        [selecter, selections],
        BaseComponent.filterComponentAction(sharkComponent, function () {
            if (!selections.is(':hidden')) {
                selecter.removeClass('open');
                selections.hide();
                selecter.trigger('focusout');
            }
        }));
}

SharkUI.sharkSelect = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        activeStyle: null,
        data: null,
        actualKey: 'value',
        displayKey: 'name',
        multiple: false,
        showSearch: false,
        onSelected: function () { }
    };
    SharkUI.extend(config, options);
    var sharkComponent = {};
    sharkComponent.allState = 0;
    sharkComponent.checkedList = [];
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initDom(sharkComponent, config, targetElement);
    initEvents(sharkComponent, config);
    return sharkComponent;
}