/**
 * @author sweetyx
 * @description 日期选择器
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
import { Event } from '../../common/event';
import { DomHelper } from '../../common/domhelper';
import { Templates } from '../../common/templates';
import { BaseComponent } from '../../common/base';
import '../../common/date';
import { Calendar } from './calendar.ui';
import { Timepanel } from './timepanel.ui';
// input模板
var templateDatetimepicker = Templates.datetimepicker;
var templateDatetimepickerFun = Templates.templateAoT(templateDatetimepicker);

function equalArray(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    else {
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
}
function getEnableTypes(format) {
    var tmp = {};
    if (/yyyy/.test(format)) {
        tmp.year = true;
    }
    if (/MM/.test(format)) {
        tmp.month = true;
    }
    if (/dd/.test(format)) {
        tmp.date = true;
    }
    if (/HH/.test(format)) {
        tmp.hour = true;
    }
    if (/mm/.test(format)) {
        tmp.minute = true;
    }
    if (/ss/.test(format)) {
        tmp.second = true;
    }
    return tmp;
}
function date2TimeArray(date) {
    if (!SharkUI.isEmpty(date)) {
        return [new Date(date).getHours(), new Date(date).getMinutes(), new Date(date).getSeconds()];
    }
    else {
        return null;
    }
}
function date2FullArray(date, enableTypes) {
    if (!SharkUI.isEmpty(date)) {
        var tmp = new Date(date);
        return [tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), tmp.getHours(), tmp.getMinutes(), tmp.getSeconds()];
    } else {
        return [
            enableTypes.year ? null : 0,
            enableTypes.month ? null : 0,
            enableTypes.date ? null : 0,
            enableTypes.hour ? null : 0,
            enableTypes.minute ? null : 0,
            enableTypes.second ? null : 0
        ];
    }
}
function fullArray2Date(array) {
    if (array instanceof Array) {
        return new Date(array[0], array[1], array[2], array[3], array[4], array[5]);
    }
    else {
        return null;
    }
}
// 初始化selecter的dom
function initDom(sharkComponent, config, targetElement) {
    if (!targetElement) {
        sharkComponent.createType = 'construct';
        var fun = config.dom ? Templates.templateAoT(config.dom) : templateDatetimepickerFun;
        var html = fun.apply(config);
        sharkComponent.component = $(html);
    } else {
        sharkComponent.createType = 'normal';
        sharkComponent.component = $(targetElement);
    }
    sharkComponent.valueinput = sharkComponent.component.find('input');
    sharkComponent.clearbtn = sharkComponent.component.find('.clear');
    sharkComponent.component.addClass('shark-datetimepicker datetimepicker');
    return sharkComponent;
}
// 初始化事件
function initEvents(sharkComponent, config) {
    sharkComponent.valueinput.on('click.datepicker', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        if (!sharkComponent.isOpen) {
            sharkComponent.show();
        }
    }));
    sharkComponent.clearbtn.on('click.datepicker', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        sharkComponent.setValue(null, true);
    }));
}
// 渲染最外层容器
function initContainer() {
    var container = $('<div class="pickercontainer"></div>');
    $(document.body).append(container);
    container.attr('id', SharkUI.createUUID());
    return container;
}
// 渲染时间选择面板
function initTimepanel(sharkComponent, config) {
    // timewrap 容器
    // timepanel 时间选择器面板
    // timeinput 时间输入框
    // timenowbtn 此刻按钮
    var timewrap = $(`
        <div class="timewrap">
            <a class="nowtime">当前</a>
            <div class="input-time-wrap">
                <input class="input-time" readonly="readonly" />
            </div>
        </div>
    `);
    sharkComponent.container.append(timewrap);
    sharkComponent.timepanel = new Timepanel({
        initTime: date2TimeArray(config.initDate),
        beforeChange: function () { },
        maxTime: getNeedMaxTime(sharkComponent),
        minTime: getNeedMinTime(sharkComponent),
        onChanged: function (time) {
            sharkComponent.value[3] = time[0];
            sharkComponent.value[4] = time[1];
            sharkComponent.value[5] = time[2];
            renderValue(sharkComponent);
            if (typeof sharkComponent.getConfig().onChanged === 'function') {
                sharkComponent.getConfig().onChanged.call(sharkComponent, sharkComponent.getValue(), sharkComponent.value);
            }
        }
    });
    timewrap.find('.input-time-wrap').append(sharkComponent.timepanel.nativeElement);
    sharkComponent.timeinput = timewrap.find('.input-time');
    sharkComponent.timenowbtn = timewrap.find('.nowtime');
    sharkComponent.timeinput.on('click', function () {
        if ($(sharkComponent.timepanel.nativeElement).is(':hidden')) {
            $(sharkComponent.timepanel.nativeElement).show();
            sharkComponent.timepanel.render();
        }
        else {
            $(sharkComponent.timepanel.nativeElement).hide();
        }
    });
    sharkComponent.timenowbtn.on('click', function () {
        sharkComponent.setValue(new Date(), true);
    });
    rederTimedom(sharkComponent);
}
// 渲染日期选择面板
function initCalendar(sharkComponent, config) {
    // calendarwrap 容器
    // container 日期选择器面板
    var calendarwrap = $(`
        <div class="calendarwrap">
        </div>
    `);
    sharkComponent.container.append(calendarwrap);
    sharkComponent.calendar = new Calendar({
        initDate: config.initDate,
        maxDate: config.maxDate,
        minDate: config.minDate,
        beforeChange: config.beforeChange,
        onChanged: function (date) {
            sharkComponent.value[0] = date.getFullYear();
            sharkComponent.value[1] = date.getMonth();
            sharkComponent.value[2] = date.getDate();
            renderValue(sharkComponent);
            checkMaxMinTime(sharkComponent);
            if (typeof sharkComponent.getConfig().onChanged === 'function') {
                sharkComponent.getConfig().onChanged.call(sharkComponent, sharkComponent.getValue(), sharkComponent.value);
            }
        }
    });
    calendarwrap.append(sharkComponent.calendar.nativeElement);
}
// 渲染datetimepicker面板
function initDatetimepicker(sharkComponent, config) {
    sharkComponent.container = initContainer();
    initCalendar(sharkComponent, config);
    if (sharkComponent.enableTypes.hour) {
        initTimepanel(sharkComponent, config);
    }
    Event.addCloseListener(
        sharkComponent.container.attr('id'),
        [sharkComponent.component, sharkComponent.container],
        BaseComponent.filterComponentAction(sharkComponent, function (evt) {
            sharkComponent.hide();
        })
    );
    sharkComponent.isCalendarInit = true;
}
// 把值渲染到dom
function rederTimedom(sharkComponent) {
    if (sharkComponent.timeinput) {
        var selectedHour = sharkComponent.value[3];
        var selectedMinute = sharkComponent.value[4];
        var selectedSecond = sharkComponent.value[5];
        if (!SharkUI.isEmpty(selectedHour) && !SharkUI.isEmpty(selectedMinute) && !SharkUI.isEmpty(selectedSecond)) {
            sharkComponent.timeinput.val(new Date(0, 0, 0, selectedHour, selectedMinute, selectedSecond).Format(sharkComponent.getConfig().format.split(' ')[1]));
        }
        else {
            sharkComponent.timeinput.val('');
        }
    }
}
function renderValue(sharkComponent) {
    rederTimedom(sharkComponent);
    if (sharkComponent.isValid()) {
        sharkComponent.valueinput.val(sharkComponent.getValue().Format(sharkComponent.getConfig().format));
    }
    else {
        sharkComponent.valueinput.val('');
    }
}
// 初始化，改变最大/小值，日历选中值，外部调用setValue时，更新时间的最大最小值
function getNeedMaxTime(sharkComponent) {
    var selectedYear = sharkComponent.value[0];
    var selectedMonth = sharkComponent.value[1];
    var selectedDate = sharkComponent.value[2];
    if (!SharkUI.isEmpty(selectedYear) && !SharkUI.isEmpty(selectedMonth) && !SharkUI.isEmpty(selectedDate)) {
        var maxDate = sharkComponent.getConfig().maxDate;
        if (!SharkUI.isEmpty(maxDate)) {
            var tmp = date2FullArray(maxDate);
            var maxTime;
            if (new Date(selectedYear, selectedMonth, selectedDate, 0, 0, 0).getTime() >= new Date(tmp[0], tmp[1], tmp[2], 0, 0, 0).getTime()) {
                maxTime = [tmp[3], tmp[4], tmp[5]];
            }
            else {
                maxTime = [23, 59, 59];
            }
            return maxTime;
        }
    }
    return null;
}
function getNeedMinTime(sharkComponent) {
    var selectedYear = sharkComponent.value[0];
    var selectedMonth = sharkComponent.value[1];
    var selectedDate = sharkComponent.value[2];
    if (!SharkUI.isEmpty(selectedYear) && !SharkUI.isEmpty(selectedMonth) && !SharkUI.isEmpty(selectedDate)) {
        var minDate = sharkComponent.getConfig().minDate;
        if (!SharkUI.isEmpty(minDate)) {
            var tmp = date2FullArray(minDate);
            var minTime;
            if (new Date(selectedYear, selectedMonth, selectedDate, 0, 0, 0).getTime() <= new Date(tmp[0], tmp[1], tmp[2], 0, 0, 0).getTime()) {
                minTime = [tmp[3], tmp[4], tmp[5]];
            }
            else {
                minTime = [0, 0, 0];
            }
            return minTime;
        }
    }
    return null;
}
function checkMaxMinTime(sharkComponent) {
    var maxTime = getNeedMaxTime(sharkComponent);
    if (!SharkUI.isEmpty(maxTime) && !SharkUI.isEmpty(sharkComponent.timepanel)) {
        if (SharkUI.isEmpty(sharkComponent.timepanel.config.maxTime) || !equalArray(sharkComponent.timepanel.config.maxTime, maxTime)) {
            sharkComponent.timepanel.setConfig('maxTime', maxTime);
        }
    }
    var minTime = getNeedMinTime(sharkComponent);
    if (!SharkUI.isEmpty(minTime) && !SharkUI.isEmpty(sharkComponent.timepanel)) {
        if (SharkUI.isEmpty(sharkComponent.timepanel.config.minTime) || !equalArray(sharkComponent.timepanel.config.minTime, minTime)) {
            sharkComponent.timepanel.setConfig('minTime', minTime);
        }
    }
}

SharkUI.sharkDatepicker = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        format: 'yyyy-MM-dd HH:mm:ss',
        initDate: new Date('2017-07-05 10:10:10'), //new Date('2017-07-09 10:10:10')
        maxDate: new Date('2017-07-18 08:08:08'), //new Date('2017-07-08 08:08:08')
        minDate: new Date('2017-07-05 05:05:05'), //new Date('2017-07-05 05:05:05')
        beforeChange: function () {
        },
        onChanged: function () {
        },
        onShow: function () { },
        onHide: function () { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var sharkComponent = {};
    // 获取 年/月/日/时/分/秒 的启用状态
    sharkComponent.enableTypes = getEnableTypes(config.format);
    initDom(sharkComponent, config, targetElement);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);
    // functions
    sharkComponent.isValid = function () {
        if (SharkUI.isEmpty(this.value) || this.value.length === 0) {
            return false;
        }
        for (var i = 0; i < this.value.length; i++) {
            if (SharkUI.isEmpty(this.value[i])) {
                return false;
            }
        }
        if (!SharkUI.isEmpty(config.maxDate) && new Date(config.maxDate).getTime() < fullArray2Date(this.value).getTime()) {
            return false;
        }
        if (!SharkUI.isEmpty(config.minDate) && new Date(config.minDate).getTime() > fullArray2Date(this.value).getTime()) {
            return false;
        }
        return true;
    };
    sharkComponent.getValue = function (datetime) {
        if (this.isValid()) {
            return fullArray2Date(this.value);
        }
        else {
            return null;
        }
    };
    sharkComponent.setValue = function (datetime, needCb) {
        this.value = date2FullArray(datetime, this.enableTypes);
        if (this.calendar) {
            if (!SharkUI.isEmpty(datetime)) {
                this.calendar.setValue(new Date(datetime));
            }
            else {
                this.calendar.setValue(null);
            }
        }
        if (this.enableTypes.hour && this.timepanel) {
            if (!SharkUI.isEmpty(datetime)) {
                this.timepanel.setValue([new Date(datetime).getHours(), new Date(datetime).getMinutes(), new Date(datetime).getSeconds()]);
            }
            else {
                this.timepanel.setValue(null);
            }
        }
        renderValue(sharkComponent);
        checkMaxMinTime(sharkComponent);
        if (needCb && typeof config.onChanged === 'function') {
            config.onChanged.call(this, this.getValue(), this.value);
        }
    };
    sharkComponent.setConfig = function (key, value) {
        config[key] = value;
        if (key === 'maxDate' || key === 'minDate') {
            sharkComponent.calendar.setConfig(key, value);
            checkMaxMinTime(sharkComponent);
        }
    };
    // show/hide/destroy
    sharkComponent.show = function () {
        if (sharkComponent.isOpen) {
            return;
        }
        if (!sharkComponent.isCalendarInit) {
            initDatetimepicker(sharkComponent, config);
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
        if (sharkComponent.timepanel) {
            $(sharkComponent.timepanel.nativeElement).hide();
        }
        sharkComponent.isOpen = false;
        if (typeof config.onHide === 'function') {
            config.onHide.call(sharkComponent);
        }
    };
    sharkComponent.destroy = function () {
        if (sharkComponent.timeinput) {
            sharkComponent.timeinput.off('click');
        }
        if (sharkComponent.timenowbtn) {
            sharkComponent.timenowbtn.off('click');
        }
        if (sharkComponent.timepanel) {
            sharkComponent.timepanel.destroy();
        }
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
            sharkComponent.component.off('click.datepicker');
        }
        sharkComponent = null;
    };
    sharkComponent.setValue(config.initDate);
    return sharkComponent;
}