/**
 * @author lingqiao
 * @description selecter插件和dropdown插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Event } from '../common/event';
import { DomHelper } from '../common/domhelper';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
import { ListGroup } from './listgroup.ui';

// selecter模板
var templateSelecter = Templates.selecter;
var templateSelecterFun = Templates.templateAoT(templateSelecter);

// 初始化selecter的dom
function initDom(sharkComponent, config, targetElement) {
    if (!targetElement) {
        sharkComponent.createType = 'construct';
        var fun = config.dom ? Templates.templateAoT(config.dom) : templateSelecterFun;
        var html = fun.apply(config);
        sharkComponent.component = $(html);
    } else {
        sharkComponent.createType = 'normal';
        sharkComponent.component = $(targetElement);
    }
    sharkComponent.component.addClass('shark-selecter');
    return sharkComponent;
}

// 初始化下拉框容器的dom
function initContainerDom(sharkComponent, config) {
    var container = $('<div class="selections-container">');
    var selections = initSelectionDom(sharkComponent, config);
    sharkComponent.selections = selections;
    sharkComponent.container = container;
    container.append(selections);
    $(document.body).append(container);
}

// 初始化下拉列表的的dom
function initSelectionDom(sharkComponent, config, level) {
    var selections = ListGroup.render();
    selections.addClass('shark-selecter-list-group');
    ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
    return selections;
}

// 移除子集下拉框
function removeChildSelection(sharkComponent, selection) {
    if (selection) {
        var container = sharkComponent.container;
        var children = selection && selection.data('selections');
        if (children) {
            removeChildSelection(sharkComponent, children);
        }
        selection.selection = null;
        selection.remove();
    }
}

// 初始化下拉列表事件
function initSelectionsEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    var container = sharkComponent.container;

    container.on('mouseenter', '.list-group-item', function (evt) {
        var item = $(this);
        var data = item.data();
        var parentUl = item.parent('.shark-selecter-list-group');
        removeChildSelection(sharkComponent, parentUl.data('selections'));
        if (data.children) {
            var level = item.parent('.shark-selecter-list-group').data('level');
            var conf = {
                data: data.children,
                actualKey: 'value',
                displayKey: 'name'
            };
            var selections = initSelectionDom(sharkComponent, conf, level + 1);
            parentUl.selections = selections;
            container.append(selections);
            parentUl.data('selections', selections);
            var postion = DomHelper.calcOffset(item, selections, 'right');
            selections.css(postion);
            selections.show();
        }
    });

    container.on('mouseout', '.shark-selecter-list-group', function (evt) {
        var item = $(this);
        var toElm = $(evt.toElement);
        if (!toElm.is('.shark-selecter-list-group') && !toElm.parents('.shark-selecter-list-group').length) {
            selecter.removeClass('open');
            selections.hide();
            removeChildSelection(sharkComponent, selections.data('selections'));
        }
    });

    container.on('click', '.list-group-item', function (evt) {
        var item = $(this);
        //设置值
        var value = item.data('value');
        sharkComponent.setValue(value, true);
        //收起待选列表
        selecter.removeClass('open');
        selections.hide();
        removeChildSelection(sharkComponent, selections.data('selections'));
        selecter.trigger('focusout');
    });

}

// 初始化事件
function initEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    selecter.on('click.selecter', '.selecter', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.selections) {
            // 如果还没有初始化过selections，在这里先初始化
            initContainerDom(sharkComponent, config);
            initSelectionsEvents(sharkComponent, config);
        }
        var selections = sharkComponent.selections;
        if (selections.is(':hidden')) {
            renderGroupList(sharkComponent, config);
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
}
// 渲染下拉列表
function renderGroupList(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    var value = sharkComponent.data[config.actualKey];
    var activeLi;
    //允许值为空字符串
    if (typeof value !== 'undefined' && value !== null) {
        activeLi = selections.find('.list-group-item[value="' + value + '"]');
        if (activeLi.length > 0) {
            activeLi.siblings().removeClass('active');
            activeLi.addClass('active');
            if (config.activeStyle) {
                activeLi.siblings().removeClass(config.activeStyle);
                activeLi.addClass(config.activeStyle);
            }
        }
    }
    if (!activeLi || activeLi.length == 0) {
        selections.children().removeClass('active');
        if (config.activeStyle) {
            selections.children().removeClass(config.activeStyle);
        }
    }
}

function getItem(v, data, actualKey) {
    for (var i = 0; i < data.length; i++) {
        var children = data[i].children;
        if (v === data[i][actualKey]) {
            return data[i];
        }
        if (children) {
            var item = getItem(v, children, actualKey);
            if (item) {
                return item;
            }
        }
    }
}


SharkUI.sharkMultiSelecter = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        activeStyle: null, // point | nike
        data: null,
        actualKey: 'value',
        displayKey: 'name',
        dom: '',
        onSelected: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config, targetElement);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);
    sharkComponent.data = {};
    sharkComponent.setValue = function (v, docallback) {
        var itemData = {};
        var oldData = sharkComponent.data;
        //允许值为空字符串
        if (typeof v !== 'undefined' && v !== null) {
            itemData = getItem(v, config.data, config.actualKey);
        }
        if (oldData[config.actualKey] != itemData[config.actualKey]) {
            //设置新值
            $.isEmptyObject(itemData) ? sharkComponent.data = {} : sharkComponent.data = itemData;
            var valuelabel = sharkComponent.component.find('.value');
            valuelabel.text(SharkUI.isEmpty(itemData[config.displayKey]) ? '' : itemData[config.displayKey]);
            //触发回调函数
            if (docallback && typeof config.onSelected === 'function') {
                config.onSelected.call(sharkComponent, itemData[config.actualKey], itemData);
            }
        }
    };
    sharkComponent.getValue = function () {
        return sharkComponent.data[config.actualKey];
    };
    sharkComponent.destroy = function () {
        if (sharkComponent.selections) {
            Event.removeCloseListener(sharkComponent.selections.attr('id'));
            sharkComponent.selections.destroy();
        }
        // 销毁component
        if (sharkComponent.createType === 'construct') {
            sharkComponent.component.remove();
        } else {
            sharkComponent.component.off('click.selecter');
        }
        sharkComponent = null;
    };
    return sharkComponent;
}