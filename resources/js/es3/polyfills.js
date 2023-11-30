"use strict";
if (!Array.prototype.includes) {
    //or use Object.defineProperty
    Array.prototype.includes = function (search, fromIndex) {
        var arr = this;
        var res = false;
        for (var a in arr) {
            if (arr[a] === search) {
                res = true;
                break;
            }
        }
        return res;
    };
}
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';
        if (start === undefined) {
            start = 0;
        }
        return this.indexOf(search, start) !== -1;
    };
}
//# sourceMappingURL=polyfills.js.map