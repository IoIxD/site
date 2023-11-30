"use strict";
if (!Array.prototype.includes) {
    //or use Object.defineProperty
    Array.prototype.includes = function (search, fromIndex) {
        let arr = this;
        let res = false;
        for (let a in arr) {
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