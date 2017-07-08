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
    var y = Math.floor(count / 12);
    var m = count % 12;
    dtArr[0] = dtArr[0] + y;
    dtArr[1] = dtArr[1] + m;
    if (count > 0) {
        if (dtArr[1] > 12) {
            dtArr[1] = dtArr[1] - 12;
            dtArr[0] = dtArr[0] + 1;
        }
    }
    else {
        if (dtArr[1] < 1) {
            dtArr[1] = dtArr[1] + 12;
            dtArr[0] = dtArr[0] - 1;
        }
    }
    date.setFullYear(dtArr[0]);
    date.setMonth(dtArr[1] - 1);
    return date;
};
Date.prototype.addYear = function (count) {
    var date = this;
    var dtArr = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
    dtArr[0] = dtArr[0] + count;
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
