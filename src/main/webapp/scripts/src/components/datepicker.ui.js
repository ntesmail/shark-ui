/**
 * @author sweetyx & lingqiao
 * @description selecter插件和dropdown插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Event } from '../common/event';
import { DomHelper } from '../common/domhelper';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
import '../common/date';
import { ListGroup } from './listgroup.ui';
// input模板
var templateInput = Templates.input;
var templateInputFun = Templates.templateAoT(templateInput);
// 初始化selecter的dom
function initDom(sharkComponent, config, targetElement) {
    if (!targetElement) {
        sharkComponent.createType = 'construct';
        var fun = config.dom ? Templates.templateAoT(config.dom) : templateInputFun;
        var html = fun.apply(config);
        sharkComponent.component = $(html);
    } else {
        sharkComponent.createType = 'normal';
        sharkComponent.component = $(targetElement);
    }
    sharkComponent.component.addClass('shark-datapicker');
    return sharkComponent;
}
// 初始化下拉列表的的dom
function initSelectionsDom(sharkComponent, config) {
    var selections = ListGroup.render();
    selections.addClass('shark-selecter-list-group');
    ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
    sharkComponent.selections = selections;
    $(document.body).append(selections);
}
// 初始化下拉列表事件
function initSelectionsEvents(sharkComponent, config) {
    var selecter = sharkComponent.component;
    var selections = sharkComponent.selections;
    selections.on('click', '.list-group-item', function (evt) {
        var item = $(this);
        //设置值
        var value = item.data('value');
        sharkComponent.setValue(value, true);
        //收起待选列表
        selecter.removeClass('open');
        selections.hide();
        selecter.trigger('focusout');
    });
    // 点击除了组件之外的地方，收起下拉列表
    Event.addCloseListener(selections.attr('id'), [selecter, selections], function () {
        if (!selections.is(':hidden')) {
            selecter.removeClass('open');
            selections.hide();
            selecter.trigger('focusout');
        }
    });
}
// 初始化事件
function initEvents(sharkComponent, config) {
    var datepicker = sharkComponent.component;
    datepicker.on('click.datepicker', '.datepicker', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.selections) {
            // 如果还没有初始化过selections，在这里先初始化
            initSelectionsDom(sharkComponent, config);
            initSelectionsEvents(sharkComponent, config);
        }
        var selections = sharkComponent.selections;
        if (selections.is(':hidden')) {
            renderGroupList(sharkComponent, config);
            var postion = DomHelper.calcOffset(datepicker, selections, 'bottom');
            selections.css(postion);
            //显示待选列表
            datepicker.addClass('open');
            selections.show();
            //设置待选列表样式
            selections.css({
                width: datepicker.outerWidth()
            });
        } else {
            //隐藏待选列表
            datepicker.removeClass('open');
            selections.hide();
            datepicker.trigger('focusout');
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

SharkUI.sharkDatepicker = function (options, targetElement) {
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