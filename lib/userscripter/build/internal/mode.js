"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMode = exports.Mode = void 0;
const ts_type_guards_1 = require("ts-type-guards");
exports.Mode = {
    production: "production",
    development: "development",
};
function isMode(x) {
    return ts_type_guards_1.isString(x) && Object.values(exports.Mode).includes(x);
}
exports.isMode = isMode;
