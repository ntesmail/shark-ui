/**
 * @author sweetyx
 * @description 分页插件
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var Templates = require('../common/templates');
(function($) {
    //初始化分页器外层ul的dom，内层的li不用模板生成（因为重新渲染分页器时，仍然需要提供renderPages方法重置分页）
    function initDom(actionObj, config) {
        if (this === $.fn) {
            actionObj.createType = 'construct';
            actionObj.component = $(config.dom || Templates.pager);
        } else {
            actionObj.createType = 'normal';
            actionObj.component = this;
        }
        actionObj.component.addClass('shark-pager pagination');
        return actionObj;
    }
    //初始化事件
    function initEvents(actionObj, config) {
        var pager = actionObj.component;
        var lastvalue = '';
        pager.on('input.pager propertychange.pager', '.form-control', function(evt) {
            var pageinput = $(this);
            var v = pageinput.val();
            if (UI.testNum(v)) {
                lastvalue = v;
            } else {
                pageinput.val(lastvalue);
            }
        });
        pager.on('keydown.pager', '.form-control', function(evt) {
            if (evt.keyCode == 13) {
                pager.find('.btn').trigger('click');
            }
        });
        pager.on('click.pager', '.page,.presegment,.nextsegment,.firstpage,.prevpage,.nextpage,.lastpage,.btn', BaseComponent.filterComponentAction(actionObj, function(evt) {
            var curEle = $(this);
            var newPage;
            if (curEle.hasClass('page')) {
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
                if (UI.isEmpty(newPage) || !UI.testNum(newPage) || newPage == pager.find('.active').children().text() || parseInt(newPage) > config.totalPages || parseInt(newPage) < config.startFrom) {
                    return;
                }
                curEle.prev().val('');
                lastvalue = '';
            }
            willPageChange(actionObj, parseInt(newPage), config);
        }));
    }
    //生成页码
    function renderPages(actionObj, config) {
        var pager = actionObj.component;
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
            pager.append('<li class="firstpage"><a>' + config.hl['firstpage'] + '</a></li>');
            pager.append('<li class="prevpage"><a>' + config.hl['prevpage'] + '</a></li>');
        } else {
            pager.append('<li class="disabled"><a>' + config.hl['firstpage'] + '</a></li>');
            pager.append('<li class="disabled"><a>' + config.hl['prevpage'] + '</a></li>');
        }
        /*********中间页码*********/
        //如果当前最页大于一段的页数，生成前边的...
        if (page > segmentSize) {
            pager.append('<li class="presegment"><a>...</a></li>');
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
                htmlStr = '<li class="active"><a>' + i + '</a></li>'
            } else {
                htmlStr = '<li class="page"><a>' + i + '</a></li>';
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
            pager.append('<li class="nextsegment"><a>...</a></li>');
        }
        /*********尾页、下一页*********/
        if (page < totalPages) {
            pager.append('<li class="nextpage"><a>' + config.hl['nextpage'] + '</a></li>');
            pager.append('<li class="lastpage"><a>' + config.hl['lastpage'] + '</a></li>');
        } else {
            pager.append('<li class="disabled"><a>' + config.hl['nextpage'] + '</a></li>');
            pager.append('<li class="disabled"><a>' + config.hl['lastpage'] + '</a></li>');
        }
        if (config.gopage) {
            pager.append($('<li class="gopage"><input class="form-control" type="text"/><a class="btn">' + config.hl['gopage'] + '</a></li>'));
        }
    };
    //将要改变页码时调用的函数
    function willPageChange(actionObj, newPage, config) {
        var startFrom = config.startFrom;
        newPage = newPage - (1 - startFrom);
        if (typeof config.onWillChange === 'function') {
            config.onWillChange.call(actionObj, newPage);
        }
    };
    $.fn.extend({
        sharkPager: function(options) {
            /*********默认参数配置*************/
            var config = {
                totalPages: 1,
                page: 1,
                hl: {
                    firstpage: '首页',
                    prevpage: '上一页',
                    nextpage: '下一页',
                    lastpage: '尾页',
                    gopage: '跳转'
                },
                segmentSize: 5,
                startFrom: 1,
                gopage: false,
                dom: '',
                onWillChange: function() {}
            };
            UI.extend(config, options);
            /*********初始化组件*************/
            var actionObj = {};
            initDom.call(this, actionObj, config);
            BaseComponent.addComponentBaseFn(actionObj, config);
            initEvents(actionObj, config);
            renderPages(actionObj, config);
            /**********初始化***********************/
            actionObj.setPage = function(page, totalPages) {
                config.page = page;
                if (!UI.isEmpty(totalPages)) {
                    config.totalPages = totalPages;
                }
                renderPages(actionObj, config);
            };
            actionObj.destroy = function() {
                // 销毁component
                if (actionObj.createType === 'construct') {
                    actionObj.component.remove();
                } else {
                    actionObj.component.off('input.pager propertychange.pager keydown.pager click.pager');
                }
                actionObj = null;
            };
            return actionObj;
        }
    });
})(jQuery || $);
