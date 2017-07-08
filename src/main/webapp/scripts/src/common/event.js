/**
 * @author sweetyx
 * 通用事件处理
 */

import $ from 'jquery';
var registerCloseArray = [];
var isCloseRegister = false;
function dispatchHandler(evt) {
    for (var i = 0; i < registerCloseArray.length; i++) {
        var key = registerCloseArray[i].key;
        var elems = registerCloseArray[i].elems;
        if ($('#' + key).length == 0) {
            removeCloseListener(key);
        } else {
            var isClickNoHideArea = false;
            for (var j = 0; j < elems.length; j++) {
                var item = elems[j];
                if (item[0] == evt.target || item.find(evt.target).length > 0) {
                    //console.log('点击了不需要隐藏的区域',item);
                    isClickNoHideArea = true;
                    break;
                }
            }
            if (isClickNoHideArea === false && typeof registerCloseArray[i].cb === 'function') {
                registerCloseArray[i].cb.call(this, evt);
            }
        }
    }
}
/**
 * [注册组件在body上click时的关闭事件]
 * @param {[type]} key   [组件的id]
 * @param {[type]} elems [点击哪些元素时，不关闭组件]
 */
var addCloseListener = function (key, elems, cb) {
    if (!isCloseRegister) {
        isCloseRegister = true;
        $(document).on('mousedown.sharkcore', dispatchHandler);
    }
    registerCloseArray.push({
        key: key,
        elems: elems,
        cb: cb
    });
};
var removeCloseListener = function (key) {
    for (var i = 0; i < registerCloseArray.length; i++) {
        if (key === registerCloseArray[i].key) {
            registerCloseArray.splice(i, 1);
            break;
        }
    }
    if (registerCloseArray.length === 0) {
        isCloseRegister = false;
        $(document).off('mousedown.sharkcore', dispatchHandler);
    }
};

var Event = {
    addCloseListener: addCloseListener,
    removeCloseListener: removeCloseListener
};
export { Event };