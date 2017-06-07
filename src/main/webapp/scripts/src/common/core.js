/**
 * @author sweetyx
 * 提供一些公共的核心方法
 */

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
                registerCloseArray[i].cb.call(evt);
            }
        }
    }
}
/**
 * [注册组件在body上click时的关闭事件]
 * @param {[type]} key   [组件的id]
 * @param {[type]} elems [点击哪些元素时，不关闭组件]
 */
var addCloseListener = function(key, elems, cb) {
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
var removeCloseListener = function(key) {
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
var preventAndStopEvent = function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
};
var calcOffset = function(target, elem, direction, fixOption) {
    //根据绑定的目标元素和展示方向计算位置
    var fixWidth = fixOption ? (fixOption.width || 0) : 0;
    var fixHeight = fixOption ? (fixOption.height || 0) : 0;
    var offset = target.offset();
    var width = target.outerWidth();
    var height = target.outerHeight();
    var left, top;
    if (direction === 'bottom') {
        top = offset.top + height + fixHeight;
        left = offset.left;
    } else if (direction === 'top') {
        top = offset.top - elem.outerHeight() - fixHeight;
        left = offset.left;
        if (top < 0) {
            //若target上侧的偏移量<浮层高度，说明上侧空间不够，改为显示在底侧
            var res = this.calcOffset(target, elem, 'bottom');
            res.originDirection = direction;
            return res;
        }
    } else if (direction === 'right') {
        top = offset.top;
        left = offset.left + width + fixWidth;
    } else if (direction === 'left') {
        top = offset.top;
        left = offset.left - elem.outerWidth() - fixWidth;
        if (left < 0) {
            //若target左侧的偏移量<浮层宽度，说明左侧空间不够，改为显示在右侧
            var res = this.calcOffset(target, elem, 'right');
            res.originDirection = direction;
            return res;
        }
    }
    return {
        originDirection: direction,
        actualDirection: direction,
        left: left,
        top: top
    };
};
var createUUID = (function() {
    var uuidRegEx = /[xy]/g;
    var uuidReplacer = function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 3 | 8);
        return v.toString(16);
    };
    return function() {
        return 'uuid-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(uuidRegEx, uuidReplacer).toUpperCase();
    };
})();
var extend = function(o1, o2) {
    if ($.isPlainObject(o1) && $.isPlainObject(o2)) {
        var temp = $.extend(true, {}, o2);
        return $.extend(o1, temp);
    } else {
        return o1;
    }
}
var isEmpty = function(val) {
    if (typeof val === 'undefined' || val === null || val === '') {
        return true;
    } else {
        return false;
    }
};
var testNum = function(val) {
    return /^[0-9]{0,}$/.test(val);
};
var throttle = function(func, wait, maxtime) {
    var timer = null;
    var args;
    var context;
    var lastTime = Date.now();
    return function() {
        context = this;
        args = arguments;
        if (!wait) {
            func.apply(context, args);
        } else {
            var curTime = Date.now();
            clearTimeout(timer);
            if (curTime - lastTime >= maxtime) {
                lastTime = curTime;
                func.apply(context, args);
            } else {
                timer = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            }
        }
    }
};
var debounce = function(func, wait, immediate) {
    var timeout;
    var args;
    var context;
    var timestamp;
    var count = 0;
    var later = function() {
        // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
        var last = Date.now() - timestamp;
        if (last < wait && last >= 0) {
            ++count;
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (count > 0 || !immediate) {
                count = 0;
                func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };
    return function() {
        context = this;
        args = arguments;
        if (!wait) {
            func.apply(context, args);
        } else {
            timestamp = Date.now();
            // 第一次调用该方法时，且immediate为true，则调用func函数
            var callNow = immediate && !timeout;
            // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
                context = args = null;
            }
        }
    };
};

var UI = {
    addCloseListener: addCloseListener,
    removeCloseListener: removeCloseListener,
    preventAndStopEvent: preventAndStopEvent,
    calcOffset: calcOffset,
    extend: extend,
    createUUID: createUUID,
    isEmpty: isEmpty,
    testNum: testNum,
    throttle: throttle,
    debounce: debounce
};
module.exports = UI
