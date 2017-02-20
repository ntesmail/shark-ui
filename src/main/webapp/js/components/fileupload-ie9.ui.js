/**
 * @author sweetyx
 * @description 文件上传插件的扩展，兼容ie9以下浏览器
 */
var UI = require('../common/core');
var BaseComponent = require('../common/base');
var blankSrc = /^https/i.test(window.location.href || '') ? 'javascript:void(0);' : 'about:blank';
//创建input
function createInput(inputId) {
    if ($('#' + inputId).length != 0) {
        $('#' + inputId).remove();
    }
    var html = '<input style="width:0;height:0;" id=' + inputId + ' name="file" type="file" />';
    var input = $(html);
    return input;
}
//创建form
function createForm(formId, iframeId, url) {
    if ($('#' + formId).length != 0) {
        $('#' + formId).remove();
    }
    var html = '<form style="width:0;height:0;" id="' + formId + '" name="' + formId + '" action="' + url + '" target="' + iframeId + '" enctype="multipart/form-data" accept-charset="UTF-8" method="post"></form>';
    var form = $(html);
    return form;
}
//创建iframe
function createIframe(iframeId) {
    if ($('#' + iframeId).length != 0) {
        $('#' + iframeId).remove();
    }
    var html = '<iframe style="width:0;height:0;" id="' + iframeId + '" name="' + iframeId + '" src="' + blankSrc + '"></iframe>'
    var iframe = $(html);
    return iframe;
}

function makeIE9Able(actionObj, config) {
    //初始化form和input
    var inputId = UI.createUUID();
    var formId = UI.createUUID();
    var iframeId = UI.createUUID();
    var form = createForm(formId, iframeId, config.url);
    actionObj.component.append(form);
    var input = createInput(inputId);
    form.append(input);
    //设置可选文件类型
    if (config.accept) {
        input.attr('accept', config.accept);
    }
    //初始化样式
    if (actionObj.component.css('position') === 'static') {
        actionObj.component.css({
            position: 'relative'
        });
    }
    form.css({
        position: 'absolute',
        left: 0,
        top: 0,
        width: actionObj.component.outerWidth(),
        height: actionObj.component.outerHeight(),
        overflow: 'hidden'
    });
    input.css({
        position: 'absolute',
        right: 0,
        top: 0,
        opacity: 0,
        filter: 'alpha(opacity=0)',
        fontSize: '100px',
        cursor: 'pointer',
        width: '1000px',
        height: '1000px'
    });
    //监听事件
    input.on('change', BaseComponent.filterComponentAction(actionObj.component, function(e) {
        //IE9及以下无法获取文件
        var v = input.val();
        if (v.length > 0) {
            actionObj.file = { name: v };
            if (typeof config.onSelected === 'function') {
                config.onSelected.call(actionObj.component, actionObj.file);
            }
            if (config.autoupload) {
                actionObj.upload();
            }
        }
    }));
    actionObj.clear = function() {
        actionObj.file = null;
        form[0].reset();
    };
    actionObj.upload = function(u, p) {
        var defer = $.Deferred();
        if (actionObj.file) {
            var url;
            if (u && p) {
                url = u + '?' + $.param(p);
            } else if (u) {
                url = u;
            } else {
                url = config.url;
            }
            form.attr('action', url);
            var iframe = createIframe(iframeId);
            $(document.body).append(iframe);
            iframe.on('load', function(evt) {
                // ie9下接收表单数据数据需要使用 text/html 格式，如：
                // var c = `{
                //             "code":200,
                //             "data":{
                //                 "url":"http://jizhang.nosdn.127.net/merrill-3.png"
                //             }
                //         }`;
                // res.set('Content-Type', 'text/html').status(200).send(c);
                // res.end();
                var responseData;
                try {
                    var responseHtml = this.contentWindow.document.body.innerHTML;
                    responseData = eval('(' + responseHtml + ')');
                } catch (error) {
                    responseData = eval('(' + $(responseHtml).html() + ')');
                } finally {
                    if (responseData) {
                        config.onUploaded.call(actionObj.component, actionObj.file, responseData);
                        defer.resolve(responseData);
                    } else {
                        config.onFailed.call(actionObj.component, evt);
                        defer.reject(evt);
                    }
                }
            });
            form[0].submit();
        }
        else{
            defer.reject({type:'noFileSelected'});
        }
        return defer.promise();
    };
    actionObj.destroy = function() {
        input.remove();
        form.remove();
        // 销毁component
        if (actionObj.createType === 'construct') {
            actionObj.component.remove();
        }
        actionObj = null;
    };
}
module.exports = makeIE9Able;
