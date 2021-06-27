import { Mode, isMode } from "./mode";
import { booleanParser, enumParser, urlParser, } from "./parsing";
const ENV_VAR_PREFIX = "USERSCRIPTER_";
export const HOSTED_AT_EXAMPLE = "https://example.com/userscripts";
export function envVarName(nameWithoutPrefix) {
    return ENV_VAR_PREFIX + nameWithoutPrefix;
}
export const ENVIRONMENT_VARIABLES = {
    MODE: {
        nameWithoutPrefix: "MODE",
        parser: enumParser(isMode),
        overrides: "mode",
        mustBe: Object.values(Mode),
    },
    NIGHTLY: {
        nameWithoutPrefix: "NIGHTLY",
        parser: booleanParser,
        overrides: "nightly",
        mustBe: ["true", "false"],
    },
    HOSTED_AT: {
        nameWithoutPrefix: "HOSTED_AT",
        parser: urlParser,
        overrides: "hostedAt",
        mustBe: `a valid URL (e.g. "${HOSTED_AT_EXAMPLE}")`,
    },
    VERBOSE: {
        nameWithoutPrefix: "VERBOSE",
        parser: booleanParser,
        overrides: "verbose",
        mustBe: ["true", "false"],
    },
};
{
    const typecheckedEnvVars = ENVIRONMENT_VARIABLES;
    void typecheckedEnvVars;
}
export function distFileName(id, type) {
    return [id, type, "js"].join(".");
}
export function metadataUrl(hostedAt, id, type) {
    return hostedAt.replace(/\/?$/, "/") + distFileName(id, type);
}
export function envVars(env) {
    return Object.values(ENVIRONMENT_VARIABLES).map(e => {
        const name = envVarName(e.nameWithoutPrefix);
        return [name, env[name]];
    });
}
export function overrideBuildConfig(buildConfig, env) {
    return Object.values(ENVIRONMENT_VARIABLES).reduce((acc, envVar) => {
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
function fromEnv(envVarSpec, v) {
    return (v === undefined
        ? { kind: "undefined" }
        : (envVarSpec.parser(v)));
}
