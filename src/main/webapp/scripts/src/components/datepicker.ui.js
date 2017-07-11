/**
 * @author sweetyx
 * @description 日期选择器
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Event } from '../common/event';
import { DomHelper } from '../common/domhelper';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
import '../common/date';
import { Calendar } from './calendar.ui';
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
function initContainer() {
    var container = $('<div class="shark-picker-container"></div>');
    $(document.body).append(container);
    container.attr('id', SharkUI.createUUID());
    return container;
}
// 初始化事件
function initEvents(sharkComponent, config) {
    var datepicker = sharkComponent.component;
    datepicker.on('click.datepicker', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.isOpen) {
            sharkComponent.show();
        }
    }));
}
// 渲染下拉列表
function initCalendar(sharkComponent, config) {
    var container = initContainer();
    var calendar = new Calendar({
        initDate: config.initDate,
        maxDate: config.maxDate,
        minDate: config.minDate,
        beforeChange: config.beforeChange,
        onChanged: function (date) {
            sharkComponent.setValue(date);
            if (typeof config.onChanged === 'function') {
                config.onChanged.call(this, date);
            }
        }
    });
    container.append(calendar.nativeElement);
    sharkComponent.calendar = calendar;
    sharkComponent.container = container;
    Event.addCloseListener(
        container.attr('id'),
        [sharkComponent.component, container],
        BaseComponent.filterComponentAction(sharkComponent, function (evt) {
            sharkComponent.hide();
        })
    );
    sharkComponent.isCalendarInit = true;
}

SharkUI.sharkDatepicker = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        format: 'yyyy-MM-dd HH:mm:ss.S',
        initDate: new Date('2017-07-09'),
        maxDate: null,
        minDate: new Date('2017-07-05'),
        beforeChange: function (date) {
        },
        onChanged: function (date) {
        },
        onShow: function () { },
        onHide: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config, targetElement);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);

    sharkComponent.setValue = function (date) {
        var tmp = new Date(date);
        sharkComponent.component.val(tmp.Format('yyyy-MM-dd HH:mm:ss.S'));
    };
    sharkComponent.show = function () {
        if (sharkComponent.isOpen) {
            return;
        }
        if (!sharkComponent.isCalendarInit) {
            initCalendar(sharkComponent, config);
        }
        var postion = DomHelper.calcOffset(sharkComponent.component, sharkComponent.container, 'bottom');
        sharkComponent.container.css(postion);
        sharkComponent.container.show();
        sharkComponent.isOpen = true;
        if (typeof config.onShow === 'function') {
            config.onShow.call(sharkComponent);
        }
    };
    sharkComponent.hide = function () {
        if (!sharkComponent.isOpen) {
            return;
        }
        sharkComponent.container.hide();
        sharkComponent.isOpen = false;
        if (typeof config.onHide === 'function') {
            config.onHide.call(sharkComponent);
        }
    };
    sharkComponent.destroy = function () {
        if (sharkComponent.calendar) {
            sharkComponent.calendar.destroy();
        }
        if (sharkComponent.container) {
            Event.removeCloseListener(sharkComponent.container.attr('id'));
            sharkComponent.container.remove();
        }
        if (sharkComponent.createType === 'construct') {
            sharkComponent.component.remove();
        } else {
            sharkComponent.component.off('click.datepicker blur.datepicker');
        }
        sharkComponent = null;
    };
    return sharkComponent;
}