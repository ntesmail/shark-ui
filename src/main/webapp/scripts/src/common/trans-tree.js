function transTree(sourceList, id, pid, children) {
    var returnList = [];
    var idMap = {};
    var len = sourceList.length;
    id = id || 'id';
    pid = pid || 'pid';
    children = children || 'children';
    for (var i = 0; i < len; i++) {
        var item = sourceList[i];
        idMap[item[id]] = item;
    }
    for (var i = 0; i < len; i++) {
        var item = sourceList[i];
        var pidMap = idMap[item[pid]];
        if (pidMap) {
            if (!pidMap[children]) {
                pidMap[children] = []
            }
            pidMap[children].push(item);
        } else {
            returnList.push(item);
        }
    }
    return returnList;
}

var TransTree = {
    transTree: transTree
};
export {
    TransTree
};
