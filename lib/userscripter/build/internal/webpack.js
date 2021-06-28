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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebpackConfig = exports.DEFAULT_METADATA_SCHEMA = exports.DEFAULT_BUILD_CONFIG = void 0;
const path = __importStar(require("path"));
const restrict_imports_loader_1 = require("restrict-imports-loader");
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const tsconfig_paths_webpack_plugin_1 = __importDefault(require("tsconfig-paths-webpack-plugin"));
const Metadata = __importStar(require("userscript-metadata"));
const configuration_1 = require("./configuration");
const mode_1 = require("./mode");
const sass_1 = require("./sass");
const utilities_1 = require("./utilities");
const validation_1 = require("./validation");
const webpack_plugin_1 = require("./webpack-plugin");
const USERSCRIPTER_BUILD = "userscripter/build";
const EXTENSIONS = {
    TS: ["ts", "tsx"],
    JS: ["mjs", "js", "jsx"],
    SASS: ["scss"],
    SVG: ["svg"]
};
const DEFAULT_BUILD_CONFIG = x => ({
    allowJs: false,
    appendDateToVersion: {
        development: true,
        nightly: true,
        production: false
    },
    id: x.id,
    hostedAt: null,
    mainFile: "main.ts",
    mode: mode_1.Mode.development,
    nightly: false,
    now: x.now,
    outDir: "dist",
    rootDir: x.rootDir,
    sassVariableGetter: "getGlobal",
    sassVariables: {},
    sourceDir: "src",
    verbose: false
});
exports.DEFAULT_BUILD_CONFIG = DEFAULT_BUILD_CONFIG;
exports.DEFAULT_METADATA_SCHEMA = {
    items: {
        ...Metadata.DEFAULT_ITEMS,
        version: Metadata.DEFAULT_ITEMS.version.butRequired(),
        run_at: Metadata.DEFAULT_ITEMS.run_at.butRequired()
    },
    warnings: Metadata.DEFAULT_WARNINGS,
    underscoresAsHyphens: true
};
function createWebpackConfig(x) {
    const overridden = configuration_1.overrideBuildConfig(x.buildConfig, x.env);
    const { allowJs, appendDateToVersion, id, mainFile, mode, nightly, now, outDir, rootDir, sassVariableGetter, sassVariables, sourceDir, verbose } = overridden.buildConfig;
    const getGlobal = sass_1.getGlobalFrom(sassVariables);
    function finalName(name) {
        return name + (nightly ? " Nightly" : "");
    }
    function finalVersion(version) {
        switch (true) {
            case nightly && appendDateToVersion.nightly:
            case mode === mode_1.Mode.development && appendDateToVersion.development:
            case mode === mode_1.Mode.production && appendDateToVersion.production:
                return version + "." + dateAsSemver(now);
            default:
                return version;
        }
    }
    const finalMetadata = (() => {
        const unfinishedMetadata = x.metadata(overridden.buildConfig);
        return {
            ...unfinishedMetadata,
            name: finalName(unfinishedMetadata.name),
            version: finalVersion(unfinishedMetadata.version)
        };
    })();
    const finalManifest = x.manifest === undefined
        ? undefined
        : (() => {
            const unfinishedManifest = x.manifest(overridden.buildConfig);
            return {
                ...unfinishedManifest,
                name: finalName(unfinishedManifest.name),
                version: finalVersion(unfinishedManifest.version)
            };
        })();
    const finalMetadataStringified = Metadata.stringify(finalMetadata);
    return {
        mode: mode,
        entry: {
            userscript: resolveIn(sourceDir)(mainFile)
        },
        output: {
            path: resolveIn(rootDir)(outDir),
            filename: configuration_1.distFileName(id, "user")
        },
        devtool: mode === mode_1.Mode.production
            ? "hidden-source-map"
            : "inline-cheap-source-map",
        stats: {
            depth: false,
            hash: false,
            modules: false,
            entrypoints: false,
            colors: true,
            logging: verbose ? "verbose" : "info"
        },
        module: {
            rules: [
                {
                    test: filenameExtensionRegex(EXTENSIONS.SVG),
                    loaders: [
                        {
                            loader: require.resolve("raw-loader")
                        }
                    ]
                },
                {
                    test: /\.module\.scss$/,
                    loaders: [
                        {
                            loader: require.resolve("style-loader")
                        },
                        {
                            loader: require.resolve("css-loader"),
                            options: {
                                modules: {
                                    exportLocalsConvention: "camelCaseOnly"
                                }
                            }
                        },
                        {
                            loader: require.resolve("sass-loader"),
                            options: {
                                sassOptions: {
                                    functions: {
                                        [sass_1.withDartSassEncodedParameters(sassVariableGetter, getGlobal)]: getGlobal
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    test: filenameExtensionRegex(EXTENSIONS.SASS),
                    exclude: /\.module\.scss$/,
                    loaders: [
                        {
                            loader: require.resolve("to-string-loader")
                        },
                        {
                            loader: require.resolve("css-loader"),
                            options: {
                                sourceMap: false,
                                esModule: false,
                                modules: {
                                    localIdentName: "[local]"
                                }
                            }
                        },
                        {
                            loader: require.resolve("sass-loader"),
                            options: {
                                sassOptions: {
                                    functions: {
                                        [sass_1.withDartSassEncodedParameters(sassVariableGetter, getGlobal)]: getGlobal
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    test: filenameExtensionRegex(EXTENSIONS.TS),
                    include: resolveIn(rootDir)(sourceDir),
                    loaders: [
                        {
                            loader: require.resolve("ts-loader")
                        },
                        {
                            loader: require.resolve("restrict-imports-loader"),
                            options: {
                                severity: "error",
                                detailedErrorMessages: true,
                                rules: [
                                    {
                                        restricted: restrict_imports_loader_1.everythingInPackage(USERSCRIPTER_BUILD),
                                        severity: "fatal",
                                        info: `"${USERSCRIPTER_BUILD}" and its submodules cannot be imported in the source directory ('${sourceDir}'). Please remove these imports:`
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            plugins: [new tsconfig_paths_webpack_plugin_1.default()],
            extensions: utilities_1.concat(Object.values(EXTENSIONS)).map(e => "." + e)
        },
        plugins: [
            new webpack_plugin_1.UserscripterWebpackPlugin({
                buildConfigErrors: validation_1.buildConfigErrors(overridden.buildConfig),
                envVarErrors: overridden.errors,
                envVars: configuration_1.envVars(x.env),
                metadataStringified: finalMetadataStringified,
                metadataValidationResult: Metadata.validateWith(x.metadataSchema)(finalMetadata),
                manifest: finalManifest,
                overriddenBuildConfig: overridden.buildConfig,
                verbose: verbose
            })
        ],
        optimization: {
            minimize: mode === mode_1.Mode.production,
            minimizer: [
                new terser_webpack_plugin_1.default({
                    parallel: true
                })
            ]
        }
    };
}
exports.createWebpackConfig = createWebpackConfig;
const resolveIn = (root) => (subdir) => path.resolve(root, subdir);
function filenameExtensionRegex(extensions) {
    return new RegExp("\\.(" + extensions.join("|") + ")$");
}
function dateAsSemver(d) {
    return [
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
        d.getHours(),
        d.getMinutes()
    ].join(".");
}
