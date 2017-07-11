Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
Date.prototype.addMin = function (count) {
    var datetime = this.getTime();
    datetime = datetime + (count) * 60000;
    return new Date(datetime);
};
Date.prototype.addHour = function (count) {
    var datetime = this.getTime();
    datetime = datetime + (count) * 60000 * 60;
    return new Date(datetime);
};
Date.prototype.addDay = function (count) {
    var datetime = this.getTime();
    datetime = datetime + (count) * 60000 * 60 * 24;
    return new Date(datetime);
};
Date.prototype.addMonth = function (count) {
    var date = this;
    var dtArr = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
    var y = Math.floor(Math.abs(count) / 12);
    var m = count % 12;
    dtArr[1] = dtArr[1] + m;
    if (count > 0) {
        dtArr[0] = dtArr[0] + y;
        if (dtArr[1] > 12) {
            dtArr[1] = dtArr[1] - 12;
            dtArr[0] = dtArr[0] + 1;
        }
    }
    else {
        dtArr[0] = dtArr[0] - y;
        if (dtArr[1] < 1) {
            dtArr[1] = dtArr[1] + 12;
            dtArr[0] = dtArr[0] - 1;
        }
    }
    var dayCount = Date.getMonthDayCount(dtArr[0], dtArr[1] - 1);
    if (dtArr[2] > dayCount) {
        //如果 2017-10-31，减一个月，为2017-09-31，然而由于9月没有31号，所以最终时间为2017-09-30
        dtArr[2] = dayCount;
        date.setDate(dtArr[2]);
    }
    date.setMonth(dtArr[1] - 1);
    date.setFullYear(dtArr[0]);
    return date;
};
Date.prototype.addYear = function (count) {
    var date = this;
    var dtArr = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
    dtArr[0] = dtArr[0] + count;
    var dayCount = Date.getMonthDayCount(dtArr[0], dtArr[1] - 1);
    if (dtArr[2] > dayCount) {
        //如果 2017-10-31，减一个月，为2017-09-31，然而由于9月没有31号，所以最终时间为2017-09-30
        dtArr[2] = dayCount;
        date.setDate(dtArr[2]);
    }
    date.setMonth(dtArr[1] - 1);
    date.setFullYear(dtArr[0]);
    return date;
};
Date.today = function () {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};
Date.year = function () {
    var date = new Date();
    date.setMonth(0);
    date.setDate(1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};
Date.todaytime = function () {
    var date = new Date();
    date.setMilliseconds(0);
    return date;
};

Date.isLeapYear = function (year) {
    if (year % 100 === 0) {
        //整百年
        if (year % 400 === 0) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        //非整百年
        if (year % 4 === 0) {
            return true;
        }
        else {
            return false;
        }
    }
}

Date.getMonthDayCount = function (year, month) {
    month = month + 1;
    switch (month) {
        case 1:
            return 31;
        case 2:
            if (Date.isLeapYear(year)) {
                return 29;
            }
            else {
                return 28;
            }
        case 3:
            return 31;
        case 4:
            return 30;
        case 5:
            return 31;
        case 6:
            return 30;
        case 7:
            return 31;
        case 8:
            return 31;
        case 9:
            return 30;
        case 10:
            return 31;
        case 11:
            return 30;
        case 12:
            return 31;
        default:
            return 30;
    }
}