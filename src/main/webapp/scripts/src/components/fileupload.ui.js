/**
 * @author sweetyx
 * @description 文件上传插件
 */
var $ = require('jquery');
var SharkUI = require('../common/core');
var Templates = require('../common/templates');
var BaseComponent = require('../common/base');
var makeIE9Able = require('./fileupload-ie9.ui');
// selecter模板
var templateFileupload = Templates.fileupload;
var templateFileuploadFun = Templates.templateAoT(templateFileupload);

function uploadByNative(file, url, params) {
    var defer = $.Deferred();
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                var percent = parseInt(e.loaded / file.size * 100);
                percent > 100 ? percent = 100 : percent;
                percent < 0 ? percent = 0 : percent;
                defer.notify(percent);
            }
        }
    }
    xhr.addEventListener('load', function (evt) {
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
function initDom(sharkComponent, config, targetElement) {
    if (!targetElement) {
        sharkComponent.createType = 'construct';
        var fun = config.dom ? Templates.templateAoT(config.dom) : templateFileuploadFun;
        var html = fun.apply(config);
        sharkComponent.component = $(html);
    } else {
        sharkComponent.createType = 'normal';
        sharkComponent.component = this;
    }
    sharkComponent.component.addClass('shark-fileupload');
    return sharkComponent;
}
//绑定事件
function initEvents(sharkComponent, config) {
    var uploader = sharkComponent.component;
    var inputId = SharkUI.createUUID();
    uploader.on('click.fileupload', BaseComponent.filterComponentAction(sharkComponent, function () {
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
        input.on('change', function (e) {
            var files = e.target.files;
            if (files && files.length > 0) {
                sharkComponent.file = files[0];
                if (typeof config.onSelected === 'function') {
                    config.onSelected.call(sharkComponent, sharkComponent.file);
                }
                if (config.autoupload) {
                    sharkComponent.upload();
                }
            }
        });
        input.trigger('click');
    }));
    if (config.dragable) {
        uploader.on('dragover.fileupload', function (e) {
            SharkUI.preventAndStopEvent(e); //一定要将dragover的默认事件取消掉，不然无法触发drop事件。如需拖拽页面里的元素，需要给其添加属性draggable="true"
        });
        uploader.on('drop.fileupload', BaseComponent.filterComponentAction(sharkComponent, function (e) {
            SharkUI.preventAndStopEvent(e);
            e = e.originalEvent; //低版本jquery的事件没有dataTransfer属性，取浏览器原生事件originalEvent
            var files = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
            if (files && files.length > 0) {
                sharkComponent.file = files[0];
                if (typeof config.onSelected === 'function') {
                    config.onSelected.call(sharkComponent, sharkComponent.file);
                }
                if (config.autoupload) {
                    sharkComponent.upload();
                }
            }
        }));
    }
}
var isNative = function () {
    if (/msie\s+(.*?);/i.test(navigator.userAgent) && document.documentMode <= 9) {
        return false;
    } else {
        return true;
    }
};
SharkUI.sharkFileupload = function (options, targetElement) {
    /*********默认参数配置*************/
    var config = {
        url: '/xhr/file/upload.do',
        autoupload: false,
        accept: '',
        dragable: false,
        dom: '',
        onSelected: function (file) { },
        onUploading: function (file, percent) { },
        onUploaded: function (file, res) { },
        onFailed: function (file, evt) { }
    };
    SharkUI.extend(config, options);
    /*********初始化组件*************/
    var sharkComponent = {};
    initDom(sharkComponent, config, targetElement);
    sharkComponent.file = null; //当前选中的文件
    BaseComponent.addComponentBaseFn(sharkComponent, config);
    if (isNative()) {
        initEvents(sharkComponent, config);
        sharkComponent.clear = function () {
            sharkComponent.file = null;
        };
        sharkComponent.upload = function (u, p) {
            var defer = $.Deferred();
            if (sharkComponent.file) {
                uploadByNative(sharkComponent.file, u ? u : config.url, p)
                    .progress(function (percent) {
                        if (typeof config.onUploading === 'function') {
                            config.onUploading.call(sharkComponent, sharkComponent.file, percent);
                        }
                    })
                    .done(function (res) {
                        if (typeof config.onUploaded === 'function') {
                            config.onUploaded.call(sharkComponent, sharkComponent.file, res);
                        }
                        defer.resolve(res);
                    })
                    .fail(function (evt) {
                        if (typeof config.onFailed === 'function') {
                            config.onFailed.call(sharkComponent, sharkComponent.file, evt);
                        }
                        defer.reject(evt);
                    });
            } else {
                defer.reject({ type: 'noFileSelected' });
            }
            return defer.promise();
        };
        sharkComponent.destroy = function () {
            // 销毁component
            if (sharkComponent.createType === 'construct') {
                sharkComponent.component.remove();
            } else {
                sharkComponent.component.off('click.fileupload dragover.fileupload drop.fileupload');
            }
            sharkComponent = null;
        };
    } else {
        makeIE9Able(sharkComponent, config);
    }
    return sharkComponent;
}
