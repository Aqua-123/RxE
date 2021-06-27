"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDartSassEncodedParameters = exports.getGlobalFrom = void 0;
const node_sass_utils_1 = __importDefault(require("node-sass-utils"));
const sass_1 = __importDefault(require("sass"));
const ts_type_guards_1 = require("ts-type-guards");
const SassUtils = node_sass_utils_1.default(sass_1.default);
function getGlobalFrom(objectToBeExposedToSass) {
    const sassVars = toSassDimension_recursively(objectToBeExposedToSass);
    return keyString => {
        if (keyString instanceof sass_1.default.types.String) {
            const wholeName = keyString.getValue();
            return SassUtils.castToSass(dig(sassVars, wholeName.split("."), wholeName));
        }
        else {
            throw new TypeError(`Expected a string as argument, but saw: ${keyString}`);
        }
    };
}
exports.getGlobalFrom = getGlobalFrom;
function withDartSassEncodedParameters(functionName, f) {
    const encodedArguments = new Array(f.length).fill(undefined).map((_, ix) => `$x${ix}`).join(", ");
    return `${functionName}(${encodedArguments})`;
}
exports.withDartSassEncodedParameters = withDartSassEncodedParameters;
function toSassDimension(s) {
    const CSS_UNITS = ["rem", "em", "vh", "vw", "vmin", "vmax", "ex", "%", "px", "cm", "mm", "in", "pt", "pc", "ch"];
    const parts = s.match(/^([.0-9]+)([a-zA-Z]+)$/);
    if (parts === null) {
        return s;
    }
    const number = parts[1];
    const unit = parts[2];
    if (CSS_UNITS.includes(unit)) {
        return new SassUtils.SassDimension(parseInt(number, 10), unit);
    }
    return s;
}
function toSassDimension_recursively(x) {
    if (ts_type_guards_1.isString(x)) {
        return toSassDimension(x);
    }
    else if (typeof x === "object") {
        const result = {};
        Object.keys(x).forEach(key => {
            result[key] = toSassDimension_recursively(x[key]);
        });
        return result;
    }
    else {
        return x;
    }
}
function dig(obj, keys, wholeName) {
    if (keys.length === 0) {
        return obj;
    }
    else {
        const deeper = obj[keys[0]];
        if (deeper === undefined) {
            throw new Error(`Unknown global: '${wholeName}' (failed on '${keys[0]}')`);
        }
        return dig(deeper, keys.slice(1), wholeName);
    }
}
