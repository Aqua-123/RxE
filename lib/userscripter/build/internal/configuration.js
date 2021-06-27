"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideBuildConfig = exports.envVars = exports.metadataUrl = exports.distFileName = exports.ENVIRONMENT_VARIABLES = exports.envVarName = exports.HOSTED_AT_EXAMPLE = void 0;
const mode_1 = require("./mode");
const parsing_1 = require("./parsing");
const ENV_VAR_PREFIX = "USERSCRIPTER_";
exports.HOSTED_AT_EXAMPLE = "https://example.com/userscripts";
function envVarName(nameWithoutPrefix) {
    return ENV_VAR_PREFIX + nameWithoutPrefix;
}
exports.envVarName = envVarName;
exports.ENVIRONMENT_VARIABLES = {
    MODE: {
        nameWithoutPrefix: "MODE",
        parser: parsing_1.enumParser(mode_1.isMode),
        overrides: "mode",
        mustBe: Object.values(mode_1.Mode),
    },
    NIGHTLY: {
        nameWithoutPrefix: "NIGHTLY",
        parser: parsing_1.booleanParser,
        overrides: "nightly",
        mustBe: ["true", "false"],
    },
    HOSTED_AT: {
        nameWithoutPrefix: "HOSTED_AT",
        parser: parsing_1.urlParser,
        overrides: "hostedAt",
        mustBe: `a valid URL (e.g. "${exports.HOSTED_AT_EXAMPLE}")`,
    },
    VERBOSE: {
        nameWithoutPrefix: "VERBOSE",
        parser: parsing_1.booleanParser,
        overrides: "verbose",
        mustBe: ["true", "false"],
    },
};
{
    const typecheckedEnvVars = exports.ENVIRONMENT_VARIABLES;
    void typecheckedEnvVars;
}
function distFileName(id, type) {
    return [id, type, "js"].join(".");
}
exports.distFileName = distFileName;
function metadataUrl(hostedAt, id, type) {
    return hostedAt.replace(/\/?$/, "/") + distFileName(id, type);
}
exports.metadataUrl = metadataUrl;
function envVars(env) {
    return Object.values(exports.ENVIRONMENT_VARIABLES).map(e => {
        const name = envVarName(e.nameWithoutPrefix);
        return [name, env[name]];
    });
}
exports.envVars = envVars;
function overrideBuildConfig(buildConfig, env) {
    return Object.values(exports.ENVIRONMENT_VARIABLES).reduce((acc, envVar) => {
        const envVarNameWithPrefix = envVarName(envVar.nameWithoutPrefix);
        const parsed = fromEnv(envVar, env[envVarNameWithPrefix]);
        switch (parsed.kind) {
            case "undefined":
                return acc;
            case "valid":
                return {
                    ...acc,
                    buildConfig: {
                        ...acc.buildConfig,
                        [envVar.overrides]: parsed.value,
                    },
                };
            case "invalid":
                return {
                    ...acc,
                    errors: acc.errors.concat({
                        fullName: envVarNameWithPrefix,
                        expected: envVar.mustBe,
                        found: parsed.input,
                    }),
                };
        }
    }, { buildConfig, errors: [] });
}
exports.overrideBuildConfig = overrideBuildConfig;
function fromEnv(envVarSpec, v) {
    return (v === undefined
        ? { kind: "undefined" }
        : (envVarSpec.parser(v)));
}
