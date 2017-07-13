/**
 * @author lq
 * @description select插件
 */
import $ from 'jquery';
import { SharkUI } from '../../common/core';
import { BaseComponent } from '../../common/base';
import { Templates } from '../../common/templates';

// selecter模板
var templateSelecter = Templates.selecter;
var templateSelecterFun = Templates.templateAoT(templateSelecter);

// 初始化selecter的dom
function initDom(sharkComponent, config, targetElement) {
    sharkComponent.component = $(templateSelecterFun.apply(config));
    sharkComponent.component.addClass('shark-selecter');
}

// 初始化下拉列表的的dom
function initSelectionsDom(sharkComponent, config) {
    var selections = $('<div class=""></div>');
    var options = {
        nodes: config.data
    };
    console.log(config.data);
    var tree = SharkUI.sharkDTree(options);
    tree.appendTo(selections);
    $(document.body).append(selections);
}

SharkUI.sharkSelect = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        activeStyle: null,
        data: null,
        actualKey: 'value',
        displayKey: 'name',
        showSearch: false,
        onSelected: function () { }
    };
    SharkUI.extend(config, options);
    var sharkComponent = {};
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initDom(sharkComponent, config, targetElement);
    initSelectionsDom(sharkComponent, config);
    return sharkComponent;
}