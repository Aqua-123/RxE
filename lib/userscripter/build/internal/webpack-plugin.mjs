import { compose } from "@typed/compose";
import * as Metadata from "userscript-metadata";
import { RawSource } from "webpack-sources";
import { ENVIRONMENT_VARIABLES, distFileName, envVarName, } from "./configuration";
import * as Msg from "./messages";
const MANIFEST_FILE = "manifest.json";
const MANIFEST_INDENTATION = 2;
export class UserscripterWebpackPlugin {
    constructor(x) {
        this.x = x;
    }
    apply(compiler) {
        const { buildConfigErrors, envVarErrors, envVars, metadataStringified, metadataValidationResult, manifest, overriddenBuildConfig, verbose, } = this.x;
        const metadataAssetName = distFileName(overriddenBuildConfig.id, "meta");
        const userscriptAssetName = distFileName(overriddenBuildConfig.id, "user");
        compiler.hooks.afterCompile.tap(UserscripterWebpackPlugin.name, compilation => {
            compilation.assets[metadataAssetName] = new RawSource(metadataStringified);
            const compiledUserscript = compilation.assets[userscriptAssetName];
            if (compiledUserscript !== undefined) {
                compilation.assets[userscriptAssetName] = new RawSource(metadataStringified + "\n" + compiledUserscript.source());
            }
            else {
                compilation.errors.push(Msg.compilationAssetNotFound(userscriptAssetName));
            }
            if (manifest !== undefined) {
                compilation.assets[MANIFEST_FILE] = new RawSource(JSON.stringify(manifest, null, MANIFEST_INDENTATION));
            }
        });
        compiler.hooks.afterEmit.tap(UserscripterWebpackPlugin.name, compilation => {
            const logger = compilation.getLogger(UserscripterWebpackPlugin.name);
            function logWithHeading(heading, subject) {
                logger.log(" ");
                logger.log(heading);
                logger.log(subject);
            }
            compilation.errors.push(...envVarErrors.map(compose(Error, Msg.envVarError)));
            compilation.errors.push(...buildConfigErrors.map(compose(Error, Msg.buildConfigError)));
            if (Metadata.isLeft(metadataValidationResult)) {
                compilation.errors.push(...metadataValidationResult.Left.map(compose(Error, Msg.metadataError)));
            }
            else {
                compilation.warnings.push(...metadataValidationResult.Right.warnings.map(Msg.metadataWarning));
            }
            if (verbose) {
                const envVarLines = envVars.map(([name, value]) => "  " + name + ": " + (value === undefined ? "(not specified)" : value));
                logWithHeading("Environment variables:", envVarLines.join("\n"));
                logWithHeading("Effective build config (after considering environment variables):", overriddenBuildConfig);
                logger.log(" ");
            }
            else {
                const hasUserscripterErrors = ([envVarErrors, buildConfigErrors].some(_ => _.length > 0)
                    || Metadata.isLeft(metadataValidationResult));
                if (hasUserscripterErrors) {
                    const fullEnvVarName = envVarName(ENVIRONMENT_VARIABLES.VERBOSE.nameWithoutPrefix);
                    logger.info(`Hint: Use ${fullEnvVarName}=true to display more information.`);
                }
            }
            if (!compilation.getStats().hasErrors()) {
                const metadataAsset = compilation.assets[metadataAssetName];
                if (metadataAsset instanceof RawSource) {
                    logger.info(metadataAsset.source());
                }
                else {
                    compilation.warnings.push(Msg.compilationAssetNotFound(metadataAssetName));
                }
            }
        });
    }
}
