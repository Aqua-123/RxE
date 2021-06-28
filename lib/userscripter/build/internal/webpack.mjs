import * as path from "path";
import { everythingInPackage } from "restrict-imports-loader";
import TerserPlugin from "terser-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import * as Metadata from "userscript-metadata";
import { distFileName, envVars, overrideBuildConfig } from "./configuration";
import { Mode } from "./mode";
import { getGlobalFrom, withDartSassEncodedParameters } from "./sass";
import { concat } from "./utilities";
import { buildConfigErrors } from "./validation";
import { UserscripterWebpackPlugin } from "./webpack-plugin";
const USERSCRIPTER_BUILD = "userscripter/build";
const EXTENSIONS = {
    TS: ["ts", "tsx"],
    JS: ["mjs", "js", "jsx"],
    SASS: ["scss"],
    SVG: ["svg"]
};
export const DEFAULT_BUILD_CONFIG = x => ({
    allowJs: false,
    appendDateToVersion: {
        development: true,
        nightly: true,
        production: false
    },
    id: x.id,
    hostedAt: null,
    mainFile: "main.ts",
    mode: Mode.development,
    nightly: false,
    now: x.now,
    outDir: "dist",
    rootDir: x.rootDir,
    sassVariableGetter: "getGlobal",
    sassVariables: {},
    sourceDir: "src",
    verbose: false
});
export const DEFAULT_METADATA_SCHEMA = {
    items: {
        ...Metadata.DEFAULT_ITEMS,
        version: Metadata.DEFAULT_ITEMS.version.butRequired(),
        run_at: Metadata.DEFAULT_ITEMS.run_at.butRequired()
    },
    warnings: Metadata.DEFAULT_WARNINGS,
    underscoresAsHyphens: true
};
export function createWebpackConfig(x) {
    const overridden = overrideBuildConfig(x.buildConfig, x.env);
    const { allowJs, appendDateToVersion, id, mainFile, mode, nightly, now, outDir, rootDir, sassVariableGetter, sassVariables, sourceDir, verbose } = overridden.buildConfig;
    const getGlobal = getGlobalFrom(sassVariables);
    function finalName(name) {
        return name + (nightly ? " Nightly" : "");
    }
    function finalVersion(version) {
        switch (true) {
            case nightly && appendDateToVersion.nightly:
            case mode === Mode.development && appendDateToVersion.development:
            case mode === Mode.production && appendDateToVersion.production:
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
            filename: distFileName(id, "user")
        },
        devtool: mode === Mode.production
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
                                        [withDartSassEncodedParameters(sassVariableGetter, getGlobal)]: getGlobal
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
                                        [withDartSassEncodedParameters(sassVariableGetter, getGlobal)]: getGlobal
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
                                        restricted: everythingInPackage(USERSCRIPTER_BUILD),
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
            plugins: [new TsconfigPathsPlugin()],
            extensions: concat(Object.values(EXTENSIONS)).map(e => "." + e)
        },
        plugins: [
            new UserscripterWebpackPlugin({
                buildConfigErrors: buildConfigErrors(overridden.buildConfig),
                envVarErrors: overridden.errors,
                envVars: envVars(x.env),
                metadataStringified: finalMetadataStringified,
                metadataValidationResult: Metadata.validateWith(x.metadataSchema)(finalMetadata),
                manifest: finalManifest,
                overriddenBuildConfig: overridden.buildConfig,
                verbose: verbose
            })
        ],
        optimization: {
            minimize: mode === Mode.production,
            minimizer: [
                new TerserPlugin({
                    parallel: true
                })
            ]
        }
    };
}
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
