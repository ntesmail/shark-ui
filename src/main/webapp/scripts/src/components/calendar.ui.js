/**
 * @author sweetyx
 * @description 日历
 */
import { SharkUI } from '../common/core';
import { Templates } from '../common/templates';
import { DomHelper } from '../common/domhelper';
var template = Templates.calendar;
var templateFun = Templates.templateAoT(template);

// 日期a和b是否相等
function equal(a, b) {
    if (a[0] === b[0] && a[1] === b[1] && a[2] === b[2]) {
        return true;
    }
    else {
        return false;
    }
}
// 日期a是否大于b
function biggerThan(a, b) {
    if ((a[0] > b[0]) || (a[0] >= b[0] && a[1] > b[1]) || (a[0] >= b[0] && a[1] >= b[1] && a[2] > b[2])) {
        return true;
    }
    else {
        return false;
    }
}
// 初始化日历的事件
function initEvents(calendar) {
    var eventHandler = function (evt) {
        var target = evt.target;
        if (DomHelper.hasClass(target, 'calendar-disabled')) {
            return;
        }
        else if (DomHelper.hasClass(target, 'calendar-prev-year')) {
            calendar.renderValue.addYear(-1);
            calendar.render();
        }
        else if (DomHelper.hasClass(target, 'calendar-prev-month')) {
            calendar.renderValue.addMonth(-1);
            calendar.render();
        }
        else if (DomHelper.hasClass(target, 'calendar-next-year')) {
            calendar.renderValue.addYear(1);
            calendar.render();
        }
        else if (DomHelper.hasClass(target, 'calendar-next-month')) {
            calendar.renderValue.addMonth(1);
            calendar.render();
        }
        else if (DomHelper.hasClass(target, 'calendar-day')) {
            if (DomHelper.hasClass(target, 'calendar-selected')) {
                console.log('already selected，do nothing');
            }
            else {
                var year = calendar.renderValue.getFullYear();
                var month = calendar.renderValue.getMonth();
                var date = parseInt(target.innerText);
                if (DomHelper.hasClass(target, 'calendar-premonthday')) {
                    --month;
                    if (month === -1) {
                        --year;
                        month = 11;
                    }
                }
                else if (DomHelper.hasClass(target, 'calendar-nextmonthday')) {
                    ++month;
                    if (month === 12) {
                        ++year;
                        month = 0;
                    }
                }
                var beforeChangeCb;
                if (typeof calendar.config.beforeChange === 'function') {
                    beforeChangeCb = calendar.config.beforeChange.call(calendar, new Date(year, month, date, 0, 0, 0, 0));
                }
                if (beforeChangeCb === false) {
                    return;
                }
                else {
                    calendar.renderValue = new Date(year, month, date, 0, 0, 0, 0);
                    calendar.value = new Date(year, month, date, 0, 0, 0, 0);
                    calendar.render();
                    if (typeof calendar.config.onChanged === 'function') {
                        beforeChangeCb = calendar.config.onChanged.call(calendar, new Date(year, month, date, 0, 0, 0, 0));
                    }
                }
            }
        }
    }
    calendar.nativeElement.addEventListener('click', eventHandler);
    calendar.nativeElement.cblist = [{ eventType: 'click', cb: eventHandler }];
}
// 强制把renderValue设置为合法（min<=renderValue<=max）
function forceRenderValueValid(calendar) {
    var tArr = [new Date(calendar.renderValue).getFullYear(), new Date(calendar.renderValue).getMonth(), new Date(calendar.renderValue).getDate()];
    var maxDate = calendar.config.maxDate;
    var minDate = calendar.config.minDate;
    var max;
    if (maxDate) {
        max = [new Date(maxDate).getFullYear(), new Date(maxDate).getMonth(), new Date(maxDate).getDate()];
        if (biggerThan(tArr, max)) {
            calendar.renderValue = new Date(max[0], max[1], max[2], 0, 0, 0, 0);
        }
    }
    var min;
    if (minDate) {
        min = [new Date(minDate).getFullYear(), new Date(minDate).getMonth(), new Date(minDate).getDate()];
        if (biggerThan(min, tArr)) {
            calendar.renderValue = new Date(min[0], min[1], min[2], 0, 0, 0, 0);
        }
    }
}
// 生成要渲染的数据
function getRenderData(calendar) {
    var tmp = new Date(calendar.renderValue);
    tmp.addMonth(-1);
    var lastYear = tmp.getFullYear();
    var lastMonth = tmp.getMonth();
    var lastMonthTotalDayCount = Date.getMonthDayCount(lastYear, lastMonth);
    tmp.addMonth(1);
    var currentYear = tmp.getFullYear();
    var currentMonth = tmp.getMonth();
    var currentMonthTotalDayCount = Date.getMonthDayCount(currentYear, currentMonth);
    tmp.setDate(1);
    var currentMonthFirstDay = tmp.getDay();
    tmp.addMonth(1);
    var nextYear = tmp.getFullYear();
    var nextMonth = tmp.getMonth();

    var weekDaysArray = [];
    for (var i = (currentMonthFirstDay - 1); i >= 0; i--) {
        weekDaysArray[i] = [lastYear, lastMonth, lastMonthTotalDayCount];
        lastMonthTotalDayCount--;
    }
    for (var i = 1; i <= currentMonthTotalDayCount; i++) {
        weekDaysArray[currentMonthFirstDay - 1 + i] = [currentYear, currentMonth, i];
    }
    for (var i = (currentMonthFirstDay + currentMonthTotalDayCount), j = 1; i < 42; i++) {
        weekDaysArray[i] = [nextYear, nextMonth, j];
        j++;
    }
    return {
        year: currentYear,
        month: currentMonth,
        days: weekDaysArray
    }
}
// 把数据渲染成日历的dom
function renderDom(calendar, renderData) {
    var today = [new Date().getFullYear(), new Date().getMonth(), new Date().getDate()];
    var current;
    if (calendar.value) {
        current = [new Date(calendar.value).getFullYear(), new Date(calendar.value).getMonth(), new Date(calendar.value).getDate()];
    }
    var max;
    if (calendar.config.maxDate) {
        max = [new Date(calendar.config.maxDate).getFullYear(), new Date(calendar.config.maxDate).getMonth(), new Date(calendar.config.maxDate).getDate()];
    }
    var min;
    if (calendar.config.minDate) {
        min = [new Date(calendar.config.minDate).getFullYear(), new Date(calendar.config.minDate).getMonth(), new Date(calendar.config.minDate).getDate()];
    }
    var html = '';
    var flag = 0;
    renderData.days.forEach(function (item) {
        var additionClass = '';
        // 今天
        if (today && equal(item, today)) {
            additionClass = additionClass + ' calendar-today'
        }
        // 选择日
        if (current && equal(item, current)) {
            additionClass = additionClass + ' calendar-selected'
        }
        // 超过最大值/最小值
        if (max && biggerThan(item, max)) {
            additionClass = additionClass + ' calendar-disabled'
        }
        else if (min && biggerThan(min, item)) {
            additionClass = additionClass + ' calendar-disabled'
        }
        // 上个月/下个月
        if (biggerThan([renderData.year, renderData.month, 1], [item[0], item[1], 1])) {
            additionClass = additionClass + ' calendar-premonthday'
        }
        else if (biggerThan([item[0], item[1], 1], [renderData.year, renderData.month, 1])) {
            additionClass = additionClass + ' calendar-nextmonthday'
        }
        html = html + `<span class="calendar-day${additionClass}">${item[2]}</span>`;
    });
    var nativeElement = calendar.nativeElement;
    nativeElement.querySelector('.calendar-weekday-wrap').innerHTML = html;
    nativeElement.querySelector('.calendar-current-year').value = renderData.year;
    nativeElement.querySelector('.calendar-current-month').value = renderData.month + 1;
    DomHelper.removeClass(nativeElement.querySelector('.calendar-next-year'), 'calendar-disabled');
    DomHelper.removeClass(nativeElement.querySelector('.calendar-next-month'), 'calendar-disabled');
    DomHelper.removeClass(nativeElement.querySelector('.calendar-prev-year'), 'calendar-disabled');
    DomHelper.removeClass(nativeElement.querySelector('.calendar-prev-month'), 'calendar-disabled');
    if (max) {
        if (renderData.year >= max[0]) {
            DomHelper.addClass(nativeElement.querySelector('.calendar-next-year'), 'calendar-disabled');
        }
        if (renderData.year > max[0] || (renderData.year >= max[0] && renderData.month >= max[1])) {
            DomHelper.addClass(nativeElement.querySelector('.calendar-next-month'), 'calendar-disabled');
        }
    }
    if (min) {
        if (renderData.year <= min[0]) {
            DomHelper.addClass(nativeElement.querySelector('.calendar-prev-year'), 'calendar-disabled');
        }
        if (renderData.year < min[0] || (renderData.year <= min[0] && renderData.month <= min[1])) {
            DomHelper.addClass(nativeElement.querySelector('.calendar-prev-month'), 'calendar-disabled');
        }
    }
}

// 日历组件
function Calendar(options) {
    // tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), tmp.getHours(), tmp.getMinutes(), tmp.getSeconds(), tmp.getMilliseconds()
    this.config = Object.assign({}, {
        initDate: null,
        maxDate: null,
        minDate: null,
        beforeChange: function () { },
        onChanged: function () { }
    }, options);
    this.nativeElement = DomHelper.parseToHTML(templateFun.apply())[0];
    this.nativeElement.setAttribute('id', 'xxx');
    document.body.appendChild(this.nativeElement);
    initEvents(this);
    this.value = this.config.initDate;
    this.renderValue = SharkUI.isEmpty(this.value) ? new Date() : new Date(this.value);
    this.render();
}
// 获取值
Calendar.prototype.getValue = function () {
    return this.value;
}
// 设置值
Calendar.prototype.setValue = function (date) {
    this.value = new Date(date);
    this.renderValue = new Date(date);
    this.render();
}
// 渲染
Calendar.prototype.render = function () {
    forceRenderValueValid(this);
    renderDom(this, getRenderData(this));
}
// 销毁
Calendar.prototype.destroy = function () {
    this.nativeElement.cblist && this.nativeElement.cblist.forEach((item) => {
        this.nativeElement.removeEventListener(item.eventType, item.cb);
    });
    DomHelper.remove(this.nativeElement);
}

export { Calendar };