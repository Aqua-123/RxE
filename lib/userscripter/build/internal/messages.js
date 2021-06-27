"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compilationAssetNotFound = exports.quote = exports.metadataError = exports.metadataWarning = exports.oneOf = exports.buildConfigError = exports.envVarError = void 0;
const compose_1 = require("@typed/compose");
const lines_unlines_1 = require("lines-unlines");
const ts_type_guards_1 = require("ts-type-guards");
const userscript_metadata_1 = require("userscript-metadata");
const webpackifyMessage = (context) => (s) => context + "\n" + s;
const webpackifyMessage_environment = webpackifyMessage("environment");
const webpackifyMessage_metadata = webpackifyMessage("metadata");
const webpackifyMessage_buildConfig = webpackifyMessage("build configuration");
const webpackifyMessage_userscripter = webpackifyMessage("Userscripter");
const envVarError = (e) => (webpackifyMessage_environment(invalidValue(`environment variable ${e.fullName}`, ts_type_guards_1.isString(e.expected) ? e.expected : exports.oneOf(e.expected), exports.quote(e.found))));
exports.envVarError = envVarError;
const buildConfigError = (e) => (webpackifyMessage_buildConfig(invalidValue(`parameter ${e.name}`, e.expected, e.found === null ? "null" : JSON.stringify(e.found))));
exports.buildConfigError = buildConfigError;
const invalidValue = (what, expected, found) => lines_unlines_1.unlines([
    `Invalid value for ${what}.`,
    `    • Expected:  ${expected}`,
    `    • Found:     ${found}`,
]);
const oneOf = (xs) => {
    const quoted = xs.map(exports.quote);
    const allButLast = (quoted.length > 1
        ? quoted.slice(0, quoted.length - 1).join(", ") + " or "
        : "");
    return allButLast + quoted[quoted.length - 1];
};
exports.oneOf = oneOf;
exports.metadataWarning = compose_1.compose(webpackifyMessage_metadata, (warning) => lines_unlines_1.unlines([
    warning.summary,
    "",
    warning.description,
]));
exports.metadataError = compose_1.compose(webpackifyMessage_metadata, (error) => {
    switch (error.kind) {
        case "INVALID_KEY": return `Invalid key: "${error.entry.key}". ${error.reason}`;
        case "INVALID_VALUE": return `Invalid ${userscript_metadata_1.tag(error.entry.key)} value: ${JSON.stringify(error.entry.value)}. ${error.reason}`;
        case "MULTIPLE_UNIQUE": return `Multiple ${userscript_metadata_1.tag(error.item.key)} values. Only one value is allowed.`;
        case "REQUIRED_MISSING": return `A ${userscript_metadata_1.tag(error.item.key)} entry is required, but none was found.`;
        case "UNRECOGNIZED_KEY": return `Unrecognized key: "${error.entry.key}".`;
    }
});
const quote = (s) => `"${s}"`;
exports.quote = quote;
const compilationAssetNotFound = (assetName) => (webpackifyMessage_userscripter(`Compilation asset ${exports.quote(assetName)} expected but not found.`));
exports.compilationAssetNotFound = compilationAssetNotFound;
