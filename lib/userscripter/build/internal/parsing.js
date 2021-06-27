"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlParser = exports.booleanParser = exports.enumParser = void 0;
function enumParser(typeGuard) {
    return (input) => (typeGuard(input)
        ? { kind: "valid", value: input }
        : { kind: "invalid", input: input });
}
exports.enumParser = enumParser;
function booleanParser(input) {
    return (input === "true"
        ? { kind: "valid", value: true }
        : (input === "false"
            ? { kind: "valid", value: false }
            : { kind: "invalid", input: input }));
}
exports.booleanParser = booleanParser;
function urlParser(input) {
    try {
        return { kind: "valid", value: new URL(input).toString() };
    }
    catch (_) {
        return { kind: "invalid", input: input };
    }
}
exports.urlParser = urlParser;
