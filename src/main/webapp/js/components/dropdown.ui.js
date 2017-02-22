/**
 * @author sweetyx & lingqiao
 * @description selecter插件和dropdown插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');
var ListGroup = require('./listgroup.ui');
(function($) {
    // dropdown模板
    var templateDropdown = Templates.dropdown;
    var templateDropdownFun = Templates.templateAoT(templateDropdown);
    // 初始化dropdown的dom
    function initDom(sharkComponent, config) {
        if (this === $.fn) {
            sharkComponent.createType = 'construct';
            var fun = config.dom ? Templates.templateAoT(config.dom) : templateDropdownFun;
            var html = fun.apply(config);
            sharkComponent.component = $(html);
        } else {
            sharkComponent.createType = 'normal';
            sharkComponent.component = this;
        }
        sharkComponent.component.addClass('shark-dropdown');
        return sharkComponent;
    }
    // 初始化下拉列表的的dom
    function initSelectionsDom(sharkComponent, config) {
        var selections = ListGroup.render();
        selections.addClass('shark-dropdown-list-group');
        ListGroup.update(selections, config.data, config.actualKey, config.displayKey);
        sharkComponent.selections = selections;
        $(document.body).append(selections);
    }
    // 初始化下拉列表事件
    function initSelectionsEvents(sharkComponent, config) {
        var dropdown = sharkComponent.component;
        var selections = sharkComponent.selections;
        selections.on('click', '.list-group-item', function(evt) {
            var item = $(this);
            if (typeof config.onSelected === 'function') {
                config.onSelected.call(sharkComponent, item.data());
            }
            //收起待选列表
            dropdown.removeClass('open');
            selections.hide();
        });
        // 点击除了组件之外的地方，收起下拉列表
        UI.addCloseListener(selections.attr('id'), [dropdown, selections], function() {
            if (!selections.is(':hidden')) {
                dropdown.removeClass('open');
                selections.hide();
            }
        });
    }
    // 初始化事件
    function initEvents(sharkComponent, config) {
        var dropdown = sharkComponent.component;
        dropdown.on('click.dropdown', '.dropdown', BaseComponent.filterComponentAction(sharkComponent, function(evt) {
            if (!sharkComponent.selections) {
                initSelectionsDom(sharkComponent, config);
                // 给下拉菜单selections绑定事件
                initSelectionsEvents(sharkComponent, config);
            }
            var selections = sharkComponent.selections;
            if (selections.is(':hidden')) {
                //展开待选列表
                dropdown.addClass('open');
                selections.show();
                var postion = UI.calcOffset(dropdown, selections, 'bottom');
                selections.css(postion);
            } else {
                //收起待选列表
                dropdown.removeClass('open');
                selections.hide();
            }
        }));
    }

    $.fn.extend({
        sharkDropdown: function(options) {
            /*********默认参数配置*************/
            var config = {
                text: '',
                data: null,
                actualKey: 'value',
                displayKey: 'name',
                dom: '',
                onSelected: function() {}
            };
            UI.extend(config, options);
            /*********初始化组件*************/
            var sharkComponent = {};
            initDom.call(this, sharkComponent, config);
            BaseComponent.addComponentBaseFn(sharkComponent, config);
            initEvents(sharkComponent, config);
            sharkComponent.destroy = function() {
                if (sharkComponent.selections) {
                    UI.removeCloseListener(sharkComponent.selections.attr('id'));
                    sharkComponent.selections.destroy();
                }
                // 销毁component
                if (sharkComponent.createType === 'construct') {
                    sharkComponent.component.remove();
                } else {
                    sharkComponent.component.off('click.dropdown');
                }
                sharkComponent = null;
            };
            return sharkComponent;
        }
    });
})(jQuery);
