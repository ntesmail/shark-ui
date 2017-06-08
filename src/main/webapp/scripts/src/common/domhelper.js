/**
 * @author sweetyx
 * 提供一些dom的计算与定位
 */
var calcOffset = function (target, elem, direction, fixOption) {
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

var DomHelper = {
    calcOffset: calcOffset
};
export { DomHelper };