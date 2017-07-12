/**
 * @author sweetyx
 * @description 时间面板
 */
import { SharkUI } from '../../common/core';
import { Templates } from '../../common/templates';
import { DomHelper } from '../../common/domhelper';
var template = Templates.timepicker;
var templateFun = Templates.templateAoT(template);

function createTimeArr(count) {
    var arr = [];
    for (var i = 0; i < count; i++) {
        arr.push(i);
    }
    return arr;
}

function time2Str(time) {
    if (time < 10) {
        return '0' + time;
    }
    else {
        return '' + time;
    }
}

function str2time(str) {
    return parseInt(str, 10);
}

var hours = createTimeArr(24);
var minutes = createTimeArr(60);
var seconds = createTimeArr(60);

// 日期a和b是否相等
function equal(a, b) {
    if (a instanceof Array) {
        return a.join('') === b.join('');
    }
    else {
        return a === b;
    }

}
// 日期a是否大于b
function biggerThan(a, b) {
    if (a instanceof Array) {
        return parseInt(a.join('')) > parseInt(b.join(''));
    }
    else {
        return a > b;
    }
}
// 初始化日历的事件
function initEvents(timepanel) {
    var eventHandler = function (evt) {
        var target = evt.target;
        if (DomHelper.hasClass(target, 'timepanel-disabled') || DomHelper.hasClass(target, 'timepanel-selected')) {
            return;
        }
        else if (DomHelper.hasClass(target, 'timepanel-list-item')) {
            var tmp;
            if (SharkUI.isEmpty(timepanel.value)) {
                tmp = [0, 0, 0]
            }
            else {
                tmp = [timepanel.value[0], timepanel.value[1], timepanel.value[2]];
            }
            // 设置值
            if (DomHelper.hasClass(target.parentNode, 'timepanel-list-hours')) {
                tmp[0] = str2time(target.innerText);
            }
            else if (DomHelper.hasClass(target.parentNode, 'timepanel-list-minutes')) {
                tmp[1] = str2time(target.innerText);
            }
            else if (DomHelper.hasClass(target.parentNode, 'timepanel-list-seconds')) {
                tmp[2] = str2time(target.innerText);
            }
            // 检查是否超小于最小值
            if (!SharkUI.isEmpty(timepanel.config.minTime) && biggerThan(timepanel.config.minTime, tmp)) {
                tmp = [timepanel.config.minTime[0], timepanel.config.minTime[1], timepanel.config.minTime[2]];
            }
            // 检查是否超大于最大值
            if (!SharkUI.isEmpty(timepanel.config.maxTime) && biggerThan(tmp, timepanel.config.maxTime)) {
                tmp = [timepanel.config.maxTime[0], timepanel.config.maxTime[1], timepanel.config.maxTime[2]];
            }

            timepanel.preValue = timepanel.value;
            timepanel.value = tmp;
            timepanel.render()
        }
    }
    timepanel.nativeElement.addEventListener('click', eventHandler);
    timepanel.nativeElement.cblist = [{ eventType: 'click', cb: eventHandler }];
}
// 把数据渲染成日历的dom
function renderDom(timepanel) {
    var currentHour;
    var currentMinute;
    var currentSecond;
    if (!SharkUI.isEmpty(timepanel.value)) {
        currentHour = timepanel.value[0];
        currentMinute = timepanel.value[1];
        currentSecond = timepanel.value[2];
    }
    var maxHour;
    var maxMinute;
    var maxSecond;
    if (!SharkUI.isEmpty(timepanel.config.maxTime)) {
        maxHour = timepanel.config.maxTime[0];
        maxMinute = timepanel.config.maxTime[1];
        maxSecond = timepanel.config.maxTime[2];
    }
    var minHour;
    var minMinute;
    var minSecond;
    if (!SharkUI.isEmpty(timepanel.config.minTime)) {
        minHour = timepanel.config.minTime[0];
        minMinute = timepanel.config.minTime[1];
        minSecond = timepanel.config.minTime[2];
    }
    var hoursContainer = timepanel.hoursContainer;
    var minutesContainer = timepanel.minutesContainer;
    var secondsContainer = timepanel.secondsContainer;
    var hoursHtml = '';
    var minutesHtml = '';
    var secondsHtml = '';
    hours.forEach((item) => {
        var additionClass = '';
        if (item === currentHour) {
            additionClass = additionClass + ' timepanel-selected';
        }
        if (!SharkUI.isEmpty(maxHour) && item > maxHour) {
            additionClass = additionClass + ' timepanel-disabled';
        }
        if (!SharkUI.isEmpty(minHour) && item < minHour) {
            additionClass = additionClass + ' timepanel-disabled';
        }
        hoursHtml = hoursHtml + `<div class="timepanel-list-item${additionClass}">${time2Str(item)}</div>`;
    });
    minutes.forEach((item) => {
        var additionClass = '';
        if (item === currentMinute) {
            additionClass = additionClass + ' timepanel-selected';
        }
        if (!SharkUI.isEmpty(currentHour)) {
            if (biggerThan([currentHour, item], [maxHour, maxMinute])) {
                additionClass = additionClass + ' timepanel-disabled';
            }
            if (biggerThan([minHour, minMinute], [currentHour, item])) {
                additionClass = additionClass + ' timepanel-disabled';
            }
        }
        minutesHtml = minutesHtml + `<div class="timepanel-list-item${additionClass}">${time2Str(item)}</div>`;
    });
    seconds.forEach((item) => {
        var additionClass = '';
        if (item === currentSecond) {
            additionClass = additionClass + ' timepanel-selected';
        }
        if (!SharkUI.isEmpty(currentHour) && !SharkUI.isEmpty(currentMinute)) {
            if (biggerThan([currentHour, currentMinute, item], [maxHour, maxMinute, maxSecond])) {
                additionClass = additionClass + ' timepanel-disabled';
            }
            if (biggerThan([minHour, minMinute, minSecond], [currentHour, currentMinute, item])) {
                additionClass = additionClass + ' timepanel-disabled';
            }
        }
        secondsHtml = secondsHtml + `<div class="timepanel-list-item${additionClass}">${time2Str(item)}</div>`
    });
    hoursContainer.innerHTML = hoursHtml;
    minutesContainer.innerHTML = minutesHtml;
    secondsContainer.innerHTML = secondsHtml;
    // scroll
    var preHour;
    var preMinute;
    var preSecond;
    if (!SharkUI.isEmpty(timepanel.preValue)) {
        preHour = timepanel.preValue[0];
        preMinute = timepanel.preValue[1];
        preSecond = timepanel.preValue[2];
    }
    if (!SharkUI.isEmpty(currentHour) && currentHour !== preHour) {
        console.log('scroll hour');
        DomHelper.scrollTo(hoursContainer, currentHour * hoursContainer.childNodes.item(currentHour).offsetHeight);
    }
    if (!SharkUI.isEmpty(currentMinute) && currentMinute !== preMinute) {
        console.log('scroll minute');
        DomHelper.scrollTo(minutesContainer, currentMinute * minutesContainer.childNodes.item(currentMinute).offsetHeight);
    }
    if (!SharkUI.isEmpty(currentSecond) && currentSecond !== preSecond) {
        console.log('scroll second');
        DomHelper.scrollTo(secondsContainer, currentSecond * secondsContainer.childNodes.item(currentSecond).offsetHeight);
    }

}

// 日历组件
function Timepanel(options) {
    this.config = Object.assign({}, {
        initTime: null,
        maxTime: [20, 20, 20],
        minTime: [10, 10, 10],
        beforeChange: function () { },
        onChanged: function () { }
    }, options);
    this.nativeElement = DomHelper.parseToHTML(templateFun.apply())[0];
    this.hoursContainer = this.nativeElement.querySelector('.timepanel-list-hours');
    this.minutesContainer = this.nativeElement.querySelector('.timepanel-list-minutes');
    this.secondsContainer = this.nativeElement.querySelector('.timepanel-list-seconds');
    document.body.appendChild(this.nativeElement);
    initEvents(this);
    this.value = this.config.initTime;
    this.render();
}
// 获取值
Timepanel.prototype.getValue = function () {
    return this.value;
}
// 设置值
Timepanel.prototype.setValue = function (date) {
    this.value = new Date(date);
    this.render();
}
// 渲染
Timepanel.prototype.render = function () {
    renderDom(this);
}
// 销毁
Timepanel.prototype.destroy = function () {
    this.nativeElement.cblist && this.nativeElement.cblist.forEach((item) => {
        this.nativeElement.removeEventListener(item.eventType, item.cb);
    });
    DomHelper.remove(this.nativeElement);
}

export { Timepanel };