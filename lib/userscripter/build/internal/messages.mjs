import { compose } from "@typed/compose";
import { unlines } from "lines-unlines";
import { isString } from "ts-type-guards";
import { tag } from "userscript-metadata";
const webpackifyMessage = (context) => (s) => context + "\n" + s;
const webpackifyMessage_environment = webpackifyMessage("environment");
const webpackifyMessage_metadata = webpackifyMessage("metadata");
const webpackifyMessage_buildConfig = webpackifyMessage("build configuration");
const webpackifyMessage_userscripter = webpackifyMessage("Userscripter");
export const envVarError = (e) => (webpackifyMessage_environment(invalidValue(`environment variable ${e.fullName}`, isString(e.expected) ? e.expected : oneOf(e.expected), quote(e.found))));
export const buildConfigError = (e) => (webpackifyMessage_buildConfig(invalidValue(`parameter ${e.name}`, e.expected, e.found === null ? "null" : JSON.stringify(e.found))));
const invalidValue = (what, expected, found) => unlines([
    `Invalid value for ${what}.`,
    `    • Expected:  ${expected}`,
    `    • Found:     ${found}`,
]);
export const oneOf = (xs) => {
    const quoted = xs.map(quote);
    const allButLast = (quoted.length > 1
        ? quoted.slice(0, quoted.length - 1).join(", ") + " or "
        : "");
    return allButLast + quoted[quoted.length - 1];
};
export const metadataWarning = compose(webpackifyMessage_metadata, (warning) => unlines([
    warning.summary,
    "",
    warning.description,
]));
export const metadataError = compose(webpackifyMessage_metadata, (error) => {
    switch (error.kind) {
        case "INVALID_KEY": return `Invalid key: "${error.entry.key}". ${error.reason}`;
        case "INVALID_VALUE": return `Invalid ${tag(error.entry.key)} value: ${JSON.stringify(error.entry.value)}. ${error.reason}`;
        case "MULTIPLE_UNIQUE": return `Multiple ${tag(error.item.key)} values. Only one value is allowed.`;
        case "REQUIRED_MISSING": return `A ${tag(error.item.key)} entry is required, but none was found.`;
        case "UNRECOGNIZED_KEY": return `Unrecognized key: "${error.entry.key}".`;
    }
});
export const quote = (s) => `"${s}"`;
export const compilationAssetNotFound = (assetName) => (webpackifyMessage_userscripter(`Compilation asset ${quote(assetName)} expected but not found.`));
