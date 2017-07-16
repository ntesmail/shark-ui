/**
 * @author sweetyx
 * @description 分页插件
 */
import $ from 'jquery';
import { SharkUI } from '../common/core';
import { Templates } from '../common/templates';
import { BaseComponent } from '../common/base';
import { Event } from '../common/event';
import { ListGroup } from './listgroup.ui';
import { DomHelper } from '../common/domhelper';

// selecter模板
var templatePager = Templates.pager;
var templatePagerFun = Templates.templateAoT(templatePager);

function testNum(val) {
    return /^[0-9]{0,}$/.test(val);
};
//初始化分页器外层ul的dom，内层的li不用模板生成（因为重新渲染分页器时，仍然需要提供renderPages方法重置分页）
function initDom(sharkComponent, config, targetElement) {
    if (!targetElement) {
        sharkComponent.createType = 'construct';
        var fun = config.dom ? Templates.templateAoT(config.dom) : templatePagerFun;
        var html = fun.apply(config);
        sharkComponent.component = $(html);
    } else {
        sharkComponent.createType = 'normal';
        sharkComponent.component = $(targetElement);
    }
    sharkComponent.component.addClass('shark-pager pagination');
    if (config.mini) {
        sharkComponent.component.addClass('mini');
    }
    var selections = ListGroup.render();
    var datas = [];
    config.pageSizeArr.forEach(function (item) {
        datas.push({
            value: item,
            name: item + '条/页'
        });
    });
    ListGroup.update(selections, datas, 'value', 'name');
    sharkComponent.selections = selections;
    $(document.body).append(selections);
    return sharkComponent;
}
//初始化事件
function initEvents(sharkComponent, config) {
    var pager = sharkComponent.component;
    var selections = sharkComponent.selections;
    var lastvalue = '';
    pager.on('input.pager propertychange.pager', '.input-page', function (evt) {
        var pageinput = $(this);
        var v = pageinput.val();
        if (testNum(v)) {
            lastvalue = v;
        } else {
            pageinput.val(lastvalue);
        }
    });
    pager.on('keydown.pager', '.input-page', function (evt) {
        if (evt.keyCode == 13) {
            pager.find('.btn').trigger('click');
        }
    });
    pager.on('click.pager', '.page,.presegment,.nextsegment,.firstpage,.prevpage,.nextpage,.lastpage,.btn,.sizechanger', BaseComponent.filterComponentAction(sharkComponent, function (evt) {
        var curEle = $(this);
        var newPage;
        if (curEle.hasClass('sizechanger')) {
            var postion = DomHelper.calcOffset(pager, selections, 'bottom');
            selections.css(postion);
            selections.show();
            return;
        }
        else if (curEle.hasClass('page')) {
            newPage = parseInt(curEle.children().text());
        }
        //点击前一页码段
        else if (curEle.hasClass('presegment')) {
            newPage = (pager.data('minpage') - 1) || 1;
        }
        //点击后一页码段
        else if (curEle.hasClass('nextsegment')) {
            newPage = (pager.data('maxpage') + 1) || 1;
        }
        //点击首页
        else if (curEle.hasClass('firstpage')) {
            newPage = 1;
        }
        //点击上一页
        else if (curEle.hasClass('prevpage')) {
            newPage = (parseInt(pager.find('.active').children().text()) - 1) || 1;
        }
        //点击下一页
        else if (curEle.hasClass('nextpage')) {
            newPage = (parseInt(pager.find('.active').children().text()) + 1) || 1;
        }
        //点击尾页
        else if (curEle.hasClass('lastpage')) {
            newPage = config.totalPages;
        }
        //点击跳转按钮
        else if (curEle.hasClass('btn')) {
            newPage = curEle.prev().val();
            if (SharkUI.isEmpty(newPage) || !testNum(newPage) || newPage == pager.find('.active').children().text() || parseInt(newPage) > config.totalPages || parseInt(newPage) < config.startFrom) {
                return;
            }
            curEle.prev().val('');
            lastvalue = '';
        }
        var startFrom = config.startFrom;
        newPage = newPage - (1 - startFrom);
        var preventDefault = false;
        if (typeof config.onPageWillChange === 'function') {
            preventDefault = config.onPageWillChange.call(sharkComponent, newPage, evt) === false ? true : false;
        }
        if (preventDefault === false && typeof config.onPageChanged === 'function') {
            sharkComponent.setPage(newPage);
            config.onPageChanged.call(sharkComponent, newPage);
        }
    }));

    selections.on('click', '.list-group-item', function (evt) {
        var item = $(this);
        //设置值
        var data = item.data();
        selections.hide();
        var preventDefault = false;
        if (typeof config.onSizeWillChange === 'function') {
            preventDefault = config.onSizeWillChange.call(sharkComponent, data.value, evt) === false ? true : false;
        }
        if (preventDefault === false && typeof config.onSizeChanged === 'function') {
            config.pageSize = data.value;
            item.siblings().removeClass('active');
            item.addClass('active');
            renderPages(sharkComponent, config);
            config.onSizeChanged.call(sharkComponent, config.pageSize);
        }
    });

    // 点击除了组件之外的地方，收起下拉列表
    Event.addCloseListener(
        selections.attr('id'),
        [pager, selections],
        BaseComponent.filterComponentAction(sharkComponent, function () {
            if (!selections.is(':hidden')) {
                selections.hide();
            }
        }
        ));
}
//生成页码
function renderPages(sharkComponent, config) {
    var pager = sharkComponent.component;
    var page = config.page;
    var totalPages = config.totalPages;
    var startFrom = config.startFrom;
    var segmentSize = config.segmentSize;
    if (page > totalPages) {
        // console.log('当前页码不能大于总页码');
        return;
    }
    if (page < 0) {
        // console.log('当前页码不能小于0');
        return;
    }
    if (totalPages < 0) {
        // console.log('总页码不能小于0');
        return;
    }
    if (page < startFrom) {
        // console.log('当前页码不能小于起始页码');
        return;
    }
    page = page + (1 - startFrom);
    pager.empty();
    /*********首页、上一页*********/
    if (page > 1) {
        pager.append('<li class="pagination-fisrt firstpage"><a></a></li>');
        pager.append('<li class="pagination-prev prevpage"><a></a></li>');
    } else {
        pager.append('<li class="pagination-fisrt pagination-disabled disabled"><a></a></li>');
        pager.append('<li class="pagination-prev pagination-disabled disabled"><a></a></li>');
    }
    /*********中间页码*********/
    //如果当前最页大于一段的页数，生成前边的...
    if (page > segmentSize) {
        pager.append('<li class="pagination-jump-prev presegment"><a>...</a></li>');
    }
    //生成中间页码
    var segment = Math.floor((page - 1) / segmentSize);
    var start = segment * segmentSize + 1;
    var end;
    if (totalPages < (segment * segmentSize + segmentSize)) {
        end = totalPages;
    } else {
        end = segment * segmentSize + segmentSize;
    }
    for (var i = start; i <= end; i++) {
        var htmlStr = '';
        if (page == i) {
            htmlStr = '<li class="pagination-item pagination-item-active active"><a>' + i + '</a></li>'
        } else {
            htmlStr = '<li class="pagination-item page"><a>' + i + '</a></li>';
        }
        var htmlEle = $(htmlStr);
        if (i == start) {
            //记录当前状态最小页
            pager.data('minpage', i);
        }
        if (i == end) {
            //记录当前状态最大页
            pager.data('maxpage', i);
        }
        pager.append(htmlEle);
    }
    //如果当前最大页小于总页数，生成后边边的...
    if (end < totalPages) {
        pager.append('<li class="pagination-jump-next nextsegment"><a>...</a></li>');
    }
    /*********尾页、下一页*********/
    if (page < totalPages) {
        pager.append('<li class="pagination-next nextpage"><a></a></li>');
        pager.append('<li class="pagination-last lastpage"><a></a></li>');
    } else {
        pager.append('<li class="pagination-next pagination-disabled disabled"><a></a></li>');
        pager.append('<li class="pagination-last pagination-disabled disabled"><a></a></li>');
    }
    if (config.changer) {
        pager.append('<li class="pagination-size-changer sizechanger"><div class="selecter selecter-single"><span class="selected">' + config.pageSize + '条/页</span></div></li>');
    }
    if (config.gopage) {
        pager.append($('<li class="pagination-quick-jumper gopage">跳至<input class="input-page" type="text"/>页<a class="btn" style="display:none;"></a></li>'));
    }
};
SharkUI.sharkPager = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        totalPages: 1,
        page: 1,
        pageSize: 10,
        pageSizeArr: [10, 20, 50],
        segmentSize: 5,
        startFrom: 1,
        dom: '',
        mini: false,
        changer: true,
        gopage: true,
        onPageWillChange: function () { },
        onPageChanged: function () { },
        onSizeWillChange: function () { },
        onSizeChanged: function () { },
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config, targetElement);
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    initEvents(sharkComponent, config);
    renderPages(sharkComponent, config);
    /**********初始化***********************/
    sharkComponent.setPage = function (page, totalPages) {
        config.page = page;
        if (!SharkUI.isEmpty(totalPages)) {
            config.totalPages = totalPages;
        }
        renderPages(sharkComponent, config);
    };
    sharkComponent.destroy = function () {
        if (sharkComponent.selections) {
            Event.removeCloseListener(sharkComponent.selections.attr('id'));
            sharkComponent.selections.destroy();
        }
        // 销毁component
        if (sharkComponent.createType === 'construct') {
            sharkComponent.component.remove();
        } else {
            sharkComponent.component.off('input.pager propertychange.pager keydown.pager click.pager');
        }
        sharkComponent = null;
    };
    return sharkComponent;
};
