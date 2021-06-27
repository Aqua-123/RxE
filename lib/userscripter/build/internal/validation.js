"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConfigErrors = void 0;
const configuration_1 = require("./configuration");
const parsing_1 = require("./parsing");
function requirement(x) {
    return { ...x, valid: x.predicate(x.value) };
}
function isValidId(x) {
    return /^[a-z][a-z0-9-]*$/.test(x);
}
function buildConfigErrors(buildConfig) {
    const REQUIREMENTS = [
        requirement({
            description: `a valid URL (e.g. "${configuration_1.HOSTED_AT_EXAMPLE}") or null`,
            key: "hostedAt",
            value: buildConfig.hostedAt,
            predicate: x => x === null || parsing_1.urlParser(x).kind === "valid",
        }),
        requirement({
            description: `a string containing only lowercase letters (a–z), digits and hyphens (e.g. "example-userscript"), starting with a letter`,
            key: "id",
            value: buildConfig.id,
            predicate: isValidId,
        }),
    ];
    return REQUIREMENTS.filter(x => !x.valid).map(x => ({ name: x.key, expected: x.description, found: x.value }));
}
exports.buildConfigErrors = buildConfigErrors;
