/**
 * @author sweetyx
 * 提供一些公共的核心方法
 */

var $ = require('jquery');
var createUUID = (function () {
    var index = 0;
    return function () {
        return 'uuid-x'.replace(/x/, index++);
    };
})();
var extend = function (o1, o2) {
    if ($.isPlainObject(o1) && $.isPlainObject(o2)) {
        var temp = $.extend(true, {}, o2);
        return $.extend(o1, temp);
    } else {
        return o1;
    }
}
var isEmpty = function (val) {
    if (typeof val === 'undefined' || val === null || val === '') {
        return true;
    } else {
        return false;
    }
};
var throttle = function (func, wait, maxtime) {
    var timer = null;
    var args;
    var context;
    var lastTime = Date.now();
    return function () {
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
                timer = setTimeout(function () {
                    func.apply(context, args);
                }, wait);
            }
        }
    }
};
var debounce = function (func, wait, immediate) {
    var timeout;
    var args;
    var context;
    var timestamp;
    var count = 0;
    var later = function () {
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
    return function () {
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
var SharkUI = {
    extend: extend,
    createUUID: createUUID,
    isEmpty: isEmpty,
    throttle: throttle,
    debounce: debounce,
    $: $
};
module.exports = SharkUI
