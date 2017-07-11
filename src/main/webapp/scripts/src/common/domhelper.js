/**
 * @author sweetyx
 * 提供一些dom的操作
 */
function calcOffset(target, elem, direction, fixOption) {
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

function parseToHTML(str) {
    var tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = str;
    return tmpDiv.children;
}

function getClassList(nativeElement) {
    var arr = nativeElement.className.split(' ');
    for (var i = 0; i < arr.length; i++) {
        if (SharkUI.isEmpty(arr[i])) {
            arr.splice(i, 1);
            i--;
        }
    }
    return arr;
}

function addClass(nativeElement, className) {
    var classList = getClassList(nativeElement);
    classList.push(className);
    nativeElement.className = classList.join(' ');
}

function removeClass(nativeElement, className) {
    var classList = getClassList(nativeElement);
    var index = classList.indexOf(className);
    if (index > -1) {
        classList.splice(index, 1);
    }
    nativeElement.className = classList.join(' ');
}

function hasClass(nativeElement, className) {
    var classList = getClassList(nativeElement);
    var index = classList.indexOf(className);
    if (index > -1) {
        return true;
    }
    else {
        return false;
    }
}

function remove(nativeElement) {
    nativeElement.parentNode.removeChild(nativeElement);
}

var DomHelper = {
    calcOffset: calcOffset,
    parseToHTML: parseToHTML,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    remove: remove
};
export { DomHelper };