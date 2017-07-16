/**
 * @author sweetyx
 * @description 列表组
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Templates } from '../common/templates';
var template = Templates.listgroup;
var templateFun = Templates.templateAoT(template);

//创建列表组
function render(id) {
    var ul = $(templateFun.apply());
    ul.attr('id', id || SharkUI.createUUID());
    ul.destroy = function () {
        ul.remove();
    };
    return ul;
}
//更新列表组
function update(ul, data, actualKey, displayKey, currentValue) {
    ul.empty();
    $.each(data, function (i, item) {
        var li = $('<li class="list-group-item" value="' + item[actualKey] + '">' + item[displayKey] + '</li>');
        if (typeof currentValue !== 'undefined' && currentValue === item[actualKey]) {
            li.addClass('active');
        }
        li.data(item);
        ul.append(li);
    });
    return ul;
}

var ListGroup = {
    render: render,
    update: update
};
export { ListGroup };