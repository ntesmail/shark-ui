/**
 * @author sweetyx
 * @description 日历
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Templates } from '../common/templates';
import { DomHelper } from '../common/domhelper';
var template = Templates.calendar;
var templateFun = Templates.templateAoT(template);

function parseToHTML(str) {
    var tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = str;
    return tmpDiv.children;
}

function getClassList(nativeElement) {
    var arr = nativeElement.className.split(' ');
    for (var i = 0; i < arr.length; i++) {
        if (SharkUI.isEmpty(arr[i])) {
            arr.splice(i, 1);
            i--;
        }
    }
    return arr;
}

function addClass(nativeElement, className) {
    var classList = getClassList(nativeElement);
    classList.push(className);
    nativeElement.className = classList.join(' ');
}

function removeClass(nativeElement, className) {
    var classList = getClassList(nativeElement);
    var index = classList.indexOf(className);
    if (index > -1) {
        classList.splice(index, 1);
    }
    nativeElement.className = classList.join(' ');
}

function hasClass(nativeElement, className) {
    var classList = getClassList(nativeElement);
    var index = classList.indexOf(className);
    if (index > -1) {
        return true;
    }
    else {
        return false;
    }
}

function equal(a, b) {
    if (a[0] === b[0] && a[1] === b[1] && a[2] === b[2]) {
        return true;
    }
    else {
        return false;
    }
}

function biggerThan(a, b) {
    if ((a[0] > b[0]) || (a[0] >= b[0] && a[1] > b[1]) || (a[0] >= b[0] && a[1] >= b[1] && a[2] > b[2])) {
        return true;
    }
    else {
        return false;
    }
}
// calendar function
function initEvents(calendar) {
    calendar.nativeElement.addEventListener('click', function (evt) {
        var target = evt.target;
        if (hasClass(target, 'calendar-disabled')) {
            return;
        }
        else if (hasClass(target, 'calendar-prev-year')) {
            calendar.renderValue.addYear(-1);
            calendar.render();
        }
        else if (hasClass(target, 'calendar-prev-month')) {
            calendar.renderValue.addMonth(-1);
            calendar.render();
        }
        else if (hasClass(target, 'calendar-next-year')) {
            calendar.renderValue.addYear(1);
            calendar.render();
        }
        else if (hasClass(target, 'calendar-next-month')) {
            calendar.renderValue.addMonth(1);
            calendar.render();
        }
        else if (hasClass(target, 'calendar-day')) {
            if (hasClass(target, 'calendar-selected')) {
                console.log('already selected，do nothing');
            }
            else {
                var tmp = new Date(calendar.renderValue);
                if (hasClass(target, 'calendar-premonthday')) {
                    tmp.addMonth(-1);
                }
                else if (hasClass(target, 'calendar-nextmonthday')) {
                    tmp.addMonth(1);
                }
                var year = tmp.getFullYear();
                var month = tmp.getMonth();
                var date = parseInt(target.innerText);

                calendar.renderValue.setFullYear(year);
                calendar.renderValue.setMonth(month);
                calendar.renderValue.setDate(date);
                calendar.value = new Date(calendar.renderValue);
                calendar.render();
            }
        }
    });
}

function forceRenderValueValid(calendar) {
    var tArr = [new Date(calendar.renderValue).getFullYear(), new Date(calendar.renderValue).getMonth(), new Date(calendar.renderValue).getDate()];
    var maxDate = calendar.config.maxDate;
    var minDate = calendar.config.minDate;
    var max;
    if (maxDate) {
        max = [new Date(maxDate).getFullYear(), new Date(maxDate).getMonth(), new Date(maxDate).getDate()];
        if (biggerThan(tArr, max)) {
            calendar.renderValue.setFullYear(max[0]);
            calendar.renderValue.setMonth(max[1]);
            calendar.renderValue.setDate(max[2]);
        }
    }
    var min;
    if (minDate) {
        min = [new Date(minDate).getFullYear(), new Date(minDate).getMonth(), new Date(minDate).getDate()];
        if (biggerThan(min, tArr)) {
            calendar.renderValue.setFullYear(min[0]);
            calendar.renderValue.setMonth(min[1]);
            calendar.renderValue.setDate(min[2]);
        }
    }
}

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
    removeClass(nativeElement.querySelector('.calendar-next-year'), 'calendar-disabled');
    removeClass(nativeElement.querySelector('.calendar-next-month'), 'calendar-disabled');
    removeClass(nativeElement.querySelector('.calendar-prev-year'), 'calendar-disabled');
    removeClass(nativeElement.querySelector('.calendar-prev-month'), 'calendar-disabled');
    if (max) {
        if (renderData.year >= max[0]) {
            addClass(nativeElement.querySelector('.calendar-next-year'), 'calendar-disabled');
        }
        if (renderData.year > max[0] || (renderData.year >= max[0] && renderData.month >= max[1])) {
            addClass(nativeElement.querySelector('.calendar-next-month'), 'calendar-disabled');
        }
    }
    if (min) {
        if (renderData.year <= min[0]) {
            addClass(nativeElement.querySelector('.calendar-prev-year'), 'calendar-disabled');
        }
        if (renderData.year < min[0] || (renderData.year <= min[0] && renderData.month <= min[1])) {
            addClass(nativeElement.querySelector('.calendar-prev-month'), 'calendar-disabled');
        }
    }
}


//创建列表组
function Calendar(options) {
    this.config = Object.assign({}, {
        format: 'yyyy-MM-dd',
        initDate: new Date('2017-07-09'),
        maxDate: null,
        minDate: new Date('2017-07-05'),
        beforeChange: function () { },
        onChange: function () { },
        onShow: function () { },
        onHide: function () { }
    }, options);
    this.value = this.config.initDate;
    this.renderValue = SharkUI.isEmpty(this.value) ? new Date() : new Date(this.value);
    var elements = parseToHTML(templateFun.apply());
    this.nativeElement = elements[0];
    this.nativeElement.setAttribute('id', SharkUI.createUUID());
    document.body.appendChild(this.nativeElement);
    this.element = $(this.nativeElement);
    initEvents(this);
    this.render();
}

Calendar.prototype.show = function () {
    this.element.show();
}

Calendar.prototype.hide = function () {
    this.element.hide();
}

Calendar.prototype.getId = function () {
    return this.element.attr('id');
}

Calendar.prototype.render = function () {
    // tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), tmp.getHours(), tmp.getMinutes(), tmp.getSeconds(), tmp.getMilliseconds()
    forceRenderValueValid(this);
    renderDom(this, getRenderData(this));
}

Calendar.prototype.adjustPostion = function (target) {
    var postion = DomHelper.calcOffset(target, this.element, 'bottom');
    this.element.css(postion);
}

export { Calendar };