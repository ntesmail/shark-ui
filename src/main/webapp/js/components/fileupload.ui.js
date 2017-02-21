/**
 * @author sweetyx
 * @description 文件上传插件
 */
var UI = require('../common/core');
var Templates = require('../common/templates');
var BaseComponent = require('../common/base');
var makeIE9Able = require('./fileupload-ie9.ui');
(function($) {
    function uploadByNative(file, url, params) {
        var defer = $.Deferred();
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    var percent = parseInt(e.loaded / file.size * 100);
                    percent > 100 ? percent = 100 : percent;
                    percent < 0 ? percent = 0 : percent;
                    defer.notify(percent);
                }
            }
        }
        xhr.addEventListener('load', function(evt) {
            try {
                var res = eval('(' + evt.target.response + ')');
                defer.resolve(res);
            } catch (error) {
                defer.reject(evt);
            }
        });
        var data = new FormData();
        data.append('file', file);
        if (params) {
            for (var p in params) {
                if (params.hasOwnProperty(p)) {
                    data.append(p, params[p]);
                }
            }
        }
        xhr.open('POST', url);
        xhr.send(data);
        return defer;
    }
    //初始化文件上传的dom
    function initDom(actionObj, config) {
        if (this === $.fn) {
            actionObj.createType = 'construct';
            actionObj.component = $(config.dom || Templates.fileupload);
        } else {
            actionObj.createType = 'normal';
            actionObj.component = this;
        }
        actionObj.component.addClass('shark-fileupload');
        return actionObj;
    }
    //绑定事件
    function initEvents(actionObj, config) {
        var inputId = UI.createUUID();
        actionObj.component.on('click.fileupload', BaseComponent.filterComponentAction(actionObj, function() {
            //每次都创建一个input是为了解决ie和chrome下input选择文件之后行为不一致的问题
            //chrome的input选择文件之后，如果再次选择文件的过程中取消选择文件，那么下次选择【同一个文件】的时候就会重新触发input的change事件
            //ie的input选择文件之后，无论过程如何操作，下次选择【同一个文件】的时候都不会重新触发input的change事件
            //不管是否选择同一个文件，每次都触发
            $('#' + inputId).remove();
            var input = $('<input id="' + inputId + '" style="display:none;" type="file" />');
            $(document.body).append(input);
            if (config.accept) {
                input.attr('accept', config.accept);
            }
            input.on('change', function(e) {
                var files = e.target.files;
                if (files && files.length > 0) {
                    actionObj.file = files[0];
                    if (typeof config.onSelected === 'function') {
                        config.onSelected.call(actionObj, actionObj.file);
                    }
                    if (config.autoupload) {
                        actionObj.upload();
                    }
                }
            });
            input.trigger('click');
        }));
        if (config.dragable) {
            actionObj.component.on('dragover.fileupload', function(e) {
                UI.preventAndStopEvent(e); //一定要将dragover的默认事件取消掉，不然无法触发drop事件。如需拖拽页面里的元素，需要给其添加属性draggable="true"
            });
            actionObj.component.on('drop.fileupload', BaseComponent.filterComponentAction(actionObj, function(e) {
                UI.preventAndStopEvent(e);
                e = e.originalEvent; //低版本jquery的事件没有dataTransfer属性，取浏览器原生事件originalEvent
                var files = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
                if (files && files.length > 0) {
                    actionObj.file = files[0];
                    if (typeof config.onSelected === 'function') {
                        config.onSelected.call(actionObj, actionObj.file);
                    }
                    if (config.autoupload) {
                        actionObj.upload();
                    }
                }
            }));
        }
    }
    var isNative = function() {
        if (/msie\s+(.*?);/i.test(navigator.userAgent) && document.documentMode <= 9) {
            return false;
        } else {
            return true;
        }
    };
    $.fn.extend({
        sharkFileupload: function(options) {
            /*********默认参数配置*************/
            var config = {
                url: '/xhr/file/upload.do',
                autoupload: false,
                accept: '',
                dragable: false,
                dom: '',
                onSelected: function(file) {},
                onUploading: function(file, percent) {},
                onUploaded: function(file, res) {},
                onFailed: function(file, evt) {}
            };
            UI.extend(config, options);
            /*********初始化组件*************/
            var actionObj = {};
            initDom.call(this, actionObj, config);
            actionObj.file = null; //当前选中的文件
            BaseComponent.addComponentBaseFn(actionObj, config);
            if (isNative()) {
                initEvents(actionObj, config);
                actionObj.clear = function() {
                    actionObj.file = null;
                };
                actionObj.upload = function(u, p) {
                    var defer = $.Deferred();
                    if (actionObj.file) {
                        uploadByNative(actionObj.file, u ? u : config.url, p)
                            .progress(function(percent) {
                                if (typeof config.onUploading === 'function') {
                                    config.onUploading.call(actionObj, actionObj.file, percent);
                                }
                            })
                            .done(function(res) {
                                if (typeof config.onUploaded === 'function') {
                                    config.onUploaded.call(actionObj, actionObj.file, res);
                                }
                                defer.resolve(res);
                            })
                            .fail(function(evt) {
                                if (typeof config.onFailed === 'function') {
                                    config.onFailed.call(actionObj, evt);
                                }
                                defer.reject(evt);
                            });
                    } else {
                        defer.reject({ type: 'noFileSelected' });
                    }
                    return defer.promise();
                };
                actionObj.destroy = function() {
                    // 销毁component
                    if (actionObj.createType === 'construct') {
                        actionObj.component.remove();
                    } else {
                        actionObj.component.off('click.fileupload dragover.fileupload drop.fileupload');
                    }
                    actionObj = null;
                };
            } else {
                makeIE9Able(actionObj, config);
            }
            return actionObj;
        }
    });
})(jQuery || $);
