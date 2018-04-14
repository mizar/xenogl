"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
function getBytesPerElementByGlType(type) {
    if (type === constants_1.FLOAT) {
        return 4;
    }
    if (type === constants_1.BYTE || type === constants_1.UNSIGNED_BYTE) {
        return 1;
    }
    if (type === constants_1.SHORT || type === constants_1.UNSIGNED_SHORT || type === constants_1.HALF_FLOAT) {
        return 2;
    }
    return null;
}
exports.getBytesPerElementByGlType = getBytesPerElementByGlType;
