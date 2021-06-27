"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserscripterWebpackPlugin = void 0;
const compose_1 = require("@typed/compose");
const Metadata = __importStar(require("userscript-metadata"));
const webpack_sources_1 = require("webpack-sources");
const configuration_1 = require("./configuration");
const Msg = __importStar(require("./messages"));
const MANIFEST_FILE = "manifest.json";
const MANIFEST_INDENTATION = 2;
class UserscripterWebpackPlugin {
    constructor(x) {
        this.x = x;
    }
    apply(compiler) {
        const { buildConfigErrors, envVarErrors, envVars, metadataStringified, metadataValidationResult, manifest, overriddenBuildConfig, verbose, } = this.x;
        const metadataAssetName = configuration_1.distFileName(overriddenBuildConfig.id, "meta");
        const userscriptAssetName = configuration_1.distFileName(overriddenBuildConfig.id, "user");
        compiler.hooks.afterCompile.tap(UserscripterWebpackPlugin.name, compilation => {
            compilation.assets[metadataAssetName] = new webpack_sources_1.RawSource(metadataStringified);
            const compiledUserscript = compilation.assets[userscriptAssetName];
            if (compiledUserscript !== undefined) {
                compilation.assets[userscriptAssetName] = new webpack_sources_1.RawSource(metadataStringified + "\n" + compiledUserscript.source());
            }
            else {
                compilation.errors.push(Msg.compilationAssetNotFound(userscriptAssetName));
            }
            if (manifest !== undefined) {
                compilation.assets[MANIFEST_FILE] = new webpack_sources_1.RawSource(JSON.stringify(manifest, null, MANIFEST_INDENTATION));
            }
        });
        compiler.hooks.afterEmit.tap(UserscripterWebpackPlugin.name, compilation => {
            const logger = compilation.getLogger(UserscripterWebpackPlugin.name);
            function logWithHeading(heading, subject) {
                logger.log(" ");
                logger.log(heading);
                logger.log(subject);
            }
            compilation.errors.push(...envVarErrors.map(compose_1.compose(Error, Msg.envVarError)));
            compilation.errors.push(...buildConfigErrors.map(compose_1.compose(Error, Msg.buildConfigError)));
            if (Metadata.isLeft(metadataValidationResult)) {
                compilation.errors.push(...metadataValidationResult.Left.map(compose_1.compose(Error, Msg.metadataError)));
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
                    const fullEnvVarName = configuration_1.envVarName(configuration_1.ENVIRONMENT_VARIABLES.VERBOSE.nameWithoutPrefix);
                    logger.info(`Hint: Use ${fullEnvVarName}=true to display more information.`);
                }
            }
            if (!compilation.getStats().hasErrors()) {
                const metadataAsset = compilation.assets[metadataAssetName];
                if (metadataAsset instanceof webpack_sources_1.RawSource) {
                    logger.info(metadataAsset.source());
                }
                else {
                    compilation.warnings.push(Msg.compilationAssetNotFound(metadataAssetName));
                }
            }
        });
    }
}
exports.UserscripterWebpackPlugin = UserscripterWebpackPlugin;
