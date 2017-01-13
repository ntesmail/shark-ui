/**
 * @author sweetyx
 * @description 列表组
 */
var UI = require('../common/core');
var Templates = require('../common/templates');
var template = Templates.listgroup;
var templateFun = Templates.templateAoT(template);
//创建列表组
function render(id) {
    var ul = $(templateFun.apply());
    ul.attr('id', id || UI.createUUID());
    ul.destroy = function() {
        ul.remove();
    };
    return ul;
}

function update(ul, data, actualKey, displayKey) {
    ul.empty();
    $.each(data, function(i, item) {
        var li = $('<li class="shark-list-group list-group-item" value="' + item[actualKey] + '">' + item[displayKey] + '</li>');
        li.data(item);
        ul.append(li);
    });
    return ul;
}

var ListGroup = {
    render: render,
    update: update
};
module.exports = ListGroup;
