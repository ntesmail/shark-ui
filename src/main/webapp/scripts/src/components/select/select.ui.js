/**
 * @author lq
 * @description select插件
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
import { BaseComponent } from '../../common/base';
import { Event } from '../../common/event';
import { DomHelper } from '../../common/domhelper';
import { SelectData } from './data';
import { SelectDom } from './dom';

function allSelectedSpan(sharkComponent, checked) {
    sharkComponent.checkedList = [];
    var list = sharkComponent.selections.tree.topNode.children;
    if (checked) {
        list.forEach(function (item) {
            sharkComponent.checkedList.push(item);
        });
    }
    SelectDom.allSelectedSpanDom(sharkComponent);
}

// 初始化事件
function initEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    selecter.on('click.selecter', '.selecter', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.selections) {
            // 如果还没有初始化过selections，在这里先初始化
            SelectDom.initSelectionsDom(sharkComponent, config);
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
        sharkComponent.selections.tree.setUnChecked([node[config.actualKey]]);
        SelectDom.changeSelectDom1(sharkComponent, node, false);
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
            allSelectedSpan(sharkComponent, false);
        } else {
            sharkComponent.selections.tree.checkAll();
            sharkComponent.allState = 2;
            allSelectedSpan(sharkComponent, true);
        }
        SelectDom.toggleAllState(sharkComponent)
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
    var sharkComponent = {};
    var config = {
        data: null,
        actualKey: 'value',
        displayKey: 'name',
        multiple: false,
        // showSearch: false,
        onSelected: function () { }
    };
    SharkUI.extend(config, options);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    sharkComponent.component = SelectDom.initDom(sharkComponent, config);
    sharkComponent.allState = 0;
    sharkComponent.checkedList = [];
    initEvents(sharkComponent, config);
    return sharkComponent;
}