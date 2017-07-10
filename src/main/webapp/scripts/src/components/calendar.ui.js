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

function initEvents(element) {

}

//创建列表组
function Calendar(options) {
    this.config = Object.assign({}, {
        format: 'yyyy-MM-dd',
        defaultDate: Date.now(),
        maxDate: null,
        minDate: null,
        onChange: function () { },
        onShow: function () { },
        onHide: function () { }
    }, options);
    this.currentData = [];
    var elements = parseToHTML(templateFun.apply());
    this.nativeElement = elements[0];
    this.nativeElement.setAttribute('id', SharkUI.createUUID());
    document.body.appendChild(this.nativeElement);
    this.element = $(this.nativeElement);
    initEvents(this.element);
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

Calendar.prototype.adjustPostion = function (target) {
    var postion = DomHelper.calcOffset(target, this.element, 'bottom');
    this.element.css(postion);
}

export { Calendar };