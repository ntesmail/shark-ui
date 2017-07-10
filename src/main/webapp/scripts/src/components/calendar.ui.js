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

function isLeapYear(year) {
    if (year % 100 === 0) {
        //整百年
        if (year % 400 === 0) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        //非整百年
        if (year % 4 === 0) {
            return true;
        }
        else {
            return false;
        }
    }
}

function getMonthDayCount(year, month) {
    month = month + 1;
    switch (month) {
        case 1:
            return 31;
        case 2:
            if (isLeapYear(year)) {
                return 29;
            }
            else {
                return 28;
            }
        case 3:
            return 31;
        case 4:
            return 30;
        case 5:
            return 31;
        case 6:
            return 30;
        case 7:
            return 31;
        case 8:
            return 31;
        case 9:
            return 30;
        case 10:
            return 31;
        case 11:
            return 30;
        case 12:
            return 31;
        default:
            return 30;
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

function initEvents(nativeElement) {
    nativeElement.addEventListener('click', function (evt) {
        var target = evt.target;
        if (target.className.indexOf('calendar-disabled') > -1) {
            return;
        }
        else if (target.className.split(' ').indexOf('calendar-prev-year') > -1) {
            addYear(-1);
        }
        else if (target.className.split(' ').indexOf('calendar-prev-month') > -1) {
            addMonth(-1);
        }
        else if (target.className.split(' ').indexOf('calendar-next-year') > -1) {
            addYear(1);
        }
        else if (target.className.split(' ').indexOf('calendar-next-month') > -1) {
            addMonth(1);
        }
        else if (target.className.split(' ').indexOf('calendar-day') > -1) {
            if (target.className.split(' ').indexOf('calendar-selected') > -1) {
                console.log('already selected，do nothing');
            }
            else {
                setDay(target.innerText);
            }
        }
    });
}

function getRenderData(date) {
    var tmp;
    if (date) {
        tmp = new Date(date);
    }
    else {
        tmp = new Date();
    }
    tmp.addMonth(-1);
    var lastYear = tmp.getFullYear();
    var lastMonth = tmp.getMonth();
    var lastMonthTotalDayCount = getMonthDayCount(lastYear, lastMonth);
    tmp.addMonth(1);
    var currentYear = tmp.getFullYear();
    var currentMonth = tmp.getMonth();
    var currentMonthTotalDayCount = getMonthDayCount(currentYear, currentMonth);
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

function renderDom(nativeElement, data, currentDate, maxDate, minDate) {
    document.querySelector('.calendar-current-year').value = data.year;
    document.querySelector('.calendar-current-month').value = data.month + 1;

    var today = [new Date().getFullYear(), new Date().getMonth(), new Date().getDate()];
    var current;
    if (currentDate) {
        current = [new Date(currentDate).getFullYear(), new Date(currentDate).getMonth(), new Date(currentDate).getDate()];
    }
    var max;
    if (maxDate) {
        max = [new Date(maxDate).getFullYear(), new Date(maxDate).getMonth(), new Date(maxDate).getDate()];
    }
    var min;
    if (minDate) {
        min = [new Date(minDate).getFullYear(), new Date(minDate).getMonth(), new Date(minDate).getDate()];
    }
    var html = '';
    var flag = 0;
    data.days.forEach(function (item) {
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
        if (item[0] < data.year || item[1] < data.month) {
            additionClass = additionClass + ' calendar-nextmonthday'
        }
        else if (item[0] > data.year || item[1] > data.month) {
            additionClass = additionClass + ' calendar-nextmonthday'
        }
        html = html + `<span class="calendar-day${additionClass}">${item[2]}</span>`;
    });
    document.querySelector('.calendar-day-wrap').innerHTML = html;
}

function addYear(count) {
    console.log(count);
}

function addMonth(count) {
    console.log(count);
}

function setDay(day) {
    console.log(day);
}


//创建列表组
function Calendar(options) {
    this.config = Object.assign({}, {
        format: 'yyyy-MM-dd',
        initDate: new Date('2017-07-09'),
        maxDate: new Date('2017-07-15'),
        minDate: new Date('2017-07-05'),
        onChange: function () { },
        onShow: function () { },
        onHide: function () { }
    }, options);
    this.value = this.config.initDate;
    var elements = parseToHTML(templateFun.apply());
    this.nativeElement = elements[0];
    this.nativeElement.setAttribute('id', SharkUI.createUUID());
    document.body.appendChild(this.nativeElement);
    this.element = $(this.nativeElement);

    initEvents(this.nativeElement);

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
    var renderData = getRenderData(this.value);
    renderDom(this.nativeElement, renderData, this.value, this.config.maxDate, this.config.minDate);
}

Calendar.prototype.adjustPostion = function (target) {
    var postion = DomHelper.calcOffset(target, this.element, 'bottom');
    this.element.css(postion);
}

export { Calendar };