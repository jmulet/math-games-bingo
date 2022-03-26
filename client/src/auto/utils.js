
window._modules = {};
window.require = function(modname) {
    modname = modname.replace("./", "");
    return (window._modules[modname] || {}).exports || {};
};


// Automatically generated on Sat Mar 26 2022 15:07:45 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["utils"] = {exports: {}};
(function(module){
var extend = function (child, parent) {
    var f = function () {};
    f.prototype = parent.prototype;
    child.prototype = new f();
    child.prototype.constructor = parent;
};

var iran = function (a, b) {
    return Math.round(Math.random() * (b - a)) + a
};

var range = function (a, b) {
    var aList = [];
    for (var i = a; i <= b; i++) {
        aList.push(i);
    }
    return aList;
};

var listClone = function (aList) {
    var clonedList = [];
    for (var i = 0, len = aList.length; i < len; i++) {
        clonedList[i] = aList[i];
    }
    return clonedList;
};

var sort = function (aList, subListLen) {
    var firstElems = aList.splice(0, subListLen);
    firstElems.sort(function (a, b) { return a - b; });
    return firstElems;
};

var shuffle = function (aList) {
    //The Fisher-Yates algorithm
    var cloned = listClone(aList);
    for (var i = cloned.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cloned[i];
        cloned[i] = cloned[j];
        cloned[j] = temp;
    }
    return cloned;
};

var pick = function(lst) {
    var j = Math.floor(Math.random()*lst.length);
    return lst[j];
};

var equalSets = function(l1, l2) {
    if(l1.length != l2.length) {
        return false;
    }
    for(var i=0; i<l1.length; i++) {
        if(l2.indexOf(l1[i])<0) {
            return false;
        }
    }
    for(var i=0; i<l2.length; i++) {
        if(l1.indexOf(l2[i])<0) {
            return false;
        }
    }
    return true;
};

function Bolla(id, number, latex, translations, ttl, remaining) {
    this.id = id;
    this.number = number;
    this.latex = latex;
    this.speech = translations;
    this.ttl = ttl || 15;
    this.remaining = remaining;
}

module.exports = {
    iran: iran,
    pick: pick,
    range: range,
    shuffle: shuffle,
    sort: sort,
    listClone: listClone,
    Bolla: Bolla,
    extend: extend,
    equalSets: equalSets
};
}(window._modules["utils"] ));
