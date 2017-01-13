/**
 * @author sweetyx & lingqiao
 * @description selecter插件和dropdown插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');
var ListGroup = require('./listgroup.ui');
(function($) {
    // selecter模板
    var templateSelecter = Templates.selecter;
    var templateSelecterFun = Templates.templateAoT(templateSelecter);
    // dropdown模板
    var templateDropdown = Templates.dropdown;
    var templateDropdownFun = Templates.templateAoT(templateDropdown);

    // 初始化selecter的dom
    function initSelecterDom(config) {
        return initDom(templateSelecterFun, config);
    }
    // 初始化dropdown的dom
    function initDropdownDom(config) {
        return initDom(templateDropdownFun, config);
    }
    // 初始化dom
    function initDom(templateFun, config) {
        var element = $(templateFun.apply(config));
        element.attr('id', UI.createUUID());
        return element;
    }
    // 初始化下拉列表的的dom
    function initSelectionsDom(element, config, type) {
        var selections = ListGroup.render();
        if (type === 'selecter') {
            selections.addClass('shark-selecter-list-group');
        }
        else{
            selections.addClass('shark-dropdown-list-group');
        }
        ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
        element.selections = selections;
        $(document.body).append(selections);
        return selections;
    }

    //  渲染下拉列表
    function renderGroupList(element, config) {
        var valuelabel = element.find('.value');
        var value = valuelabel.data(config.actualKey);
        var activeLi;
        //允许值为空字符串
        if (typeof value !== 'undefined' && value !== null) {
            activeLi = element.selections.find('.list-group-item[value="' + value + '"]');
            if (activeLi.length > 0) {
                activeLi.siblings().removeClass('active');
                activeLi.addClass('active');
                if (config.activeStyle) {
                    activeLi.siblings().removeClass(config.activeStyle);
                    activeLi.addClass(config.activeStyle);
                }
            }
        }
        if (!activeLi || activeLi.length == 0) {
            element.selections.children().removeClass('active');
            if (config.activeStyle) {
                element.selections.children().removeClass(config.activeStyle);
            }
        }
    }

    // 初始化事件
    function initEvents(element, config, type) {
        element.on('click', '.selecter, .dropdown', BaseComponent.filterComponentAction(element, function(evt) {
            if (!element.selections) {
                initSelectionsDom(element, config, type);
                // 给下拉菜单selections绑定事件
                initSelectionsEvents(element, config, type);
            }
            var selections = element.selections;
            if (selections.is(':hidden')) {
                //展开待选列表
                element.addClass('open');
                renderGroupList(element, config);
                selections.show();
                if (type === 'selecter') {
                    selections.css({
                        width: element.outerWidth()
                    });
                }
                var postion = UI.calcOffset(element, selections, 'bottom');
                selections.css(postion);
            } else {
                //收起待选列表
                element.removeClass('open');
                selections.hide();
            }
        }));
    }
    // 初始化下拉列表事件
    function initSelectionsEvents(element, config, type) {
        var selections = element.selections;
        selections.on('click', '.list-group-item', function(evt) {
            var item = $(this);
            if (type === 'selecter') {
                var value = item.data('value');
                if (typeof value === 'undefined') {
                    value = item.attr('value');
                }
                //设置值
                element.setValue(value, true);
            } else {
                if (typeof config.onSelected === 'function') {
                    config.onSelected.call(element, item.data());
                }
            }
            //收起待选列表
            element.removeClass('open');
            selections.hide();
        });
        // 点击除了组件之外的地方，收起下拉列表
        UI.addCloseListener(selections.attr('id'), [element, selections], function() {
            if (!selections.is(':hidden')) {
                element.removeClass('open');
                selections.hide();
            }
        });
    }

    $.fn.extend({
        sharkSelecter: function(options) {
            /*********默认参数配置*************/
            var config = {
                activeStyle: null, // point | nike
                data: null,
                actualKey: 'value',
                displayKey: 'name',
                onSelected: function() {}
            };
            UI.extend(config, options);
            var selecter;
            if (this === $.fn) {
                selecter = initSelecterDom(config);
            } else {
                selecter = this;
                selecter.addClass('shark-selecter position-relative');
                var selections = selecter.children('.list-group');
                selections.addClass('position-absolute');
                selections.hide();
                if (!selections.attr('id')) {
                    selections.attr('id', UI.createUUID())
                }
                selecter.selections = selections;
                initSelectionsEvents(selecter, config, 'selecter');
            }
            BaseComponent.addComponentBaseFn(selecter, config);
            initEvents(selecter, config, 'selecter');
            var valuelabel = selecter.find('.value');
            // 设置下拉框的值
            selecter.setValue = function(v, docallback) {
                var itemData = {};
                var oldData = valuelabel.data();
                //允许值为空字符串
                if (typeof v !== 'undefined' && v !== null) {
                    if (config.data) {
                        var data = config.data;
                        for (var i = 0; i < data.length; i++) {
                            if (v === data[i][config.actualKey]) {
                                itemData = data[i];
                            }
                        }
                    } else {
                        var activeLi;
                        activeLi = selecter.selections.find('.list-group-item[value="' + v + '"]');
                        if (activeLi.length > 0) {
                            itemData[config.actualKey] = activeLi.attr('value');
                            itemData[config.displayKey] = activeLi.text();
                        }
                    }
                }
                if (oldData[config.actualKey] != itemData[config.actualKey]) {
                    valuelabel.text(UI.isEmpty(itemData[config.displayKey]) ? '' : itemData[config.displayKey]);
                    $.isEmptyObject(itemData) ? valuelabel.removeData() : valuelabel.data(itemData);
                    if (docallback && typeof config.onSelected === 'function') {
                        config.onSelected.call(selecter, itemData[config.actualKey], itemData);
                    }
                }
                return selecter;
            };
            selecter.getValue = function() {
                return valuelabel.data() && valuelabel.data()[config.actualKey];
            };
            selecter.destroy = function() {
                if (selecter.selections) {
                    UI.removeCloseListener(selecter.selections.attr('id'));
                    selecter.selections.destroy();
                    selecter.selections = null;
                }
                selecter.remove();
                selecter = null;
            };
            return selecter;
        },
        sharkDropdown: function(options) {
            /*********默认参数配置*************/
            var config = {
                text: '',
                data: null,
                actualKey: 'value',
                displayKey: 'name',
                onSelected: function() {}
            };
            UI.extend(config, options);
            var dropdown;
            if (this === $.fn) {
                dropdown = initDropdownDom(config);
            } else {
                dropdown = this;
                dropdown.addClass('shark-dropdown position-relative');
                var selections = dropdown.children('.list-group');
                selections.addClass('position-absolute');
                selections.hide();
                if (!selections.attr('id')) {
                    selections.attr('id', UI.createUUID());
                }
                dropdown.selections = selections;
                initSelectionsEvents(dropdown, config, 'dropdown');
            }
            BaseComponent.addComponentBaseFn(dropdown, config);
            initEvents(dropdown, config, 'dropdown');
            dropdown.destroy = function() {
                if (dropdown.selections) {
                    UI.removeCloseListener(dropdown.selections.attr('id'));
                    dropdown.selections.destroy();
                    dropdown.selections = null;
                }
                dropdown.remove();
                dropdown = null;
            };
            return dropdown;
        }
    });
})(jQuery);
