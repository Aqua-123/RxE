import * as Metadata from "userscript-metadata";
import Manifest from "webextension-manifest";
import * as webpack from "webpack";
import { BuildConfig, EnvVarError } from "./configuration";
import { BuildConfigError } from "./validation";
export declare class UserscripterWebpackPlugin {
    private readonly x;
    constructor(x: {
        buildConfigErrors: ReadonlyArray<BuildConfigError<any>>;
        envVarErrors: readonly EnvVarError[];
        envVars: ReadonlyArray<readonly [string, string | undefined]>;
        manifest?: Manifest;
        metadataStringified: string;
        metadataValidationResult: Metadata.ValidationResult<Metadata.Metadata>;
        overriddenBuildConfig: BuildConfig;
        verbose: boolean;
    });
    apply(compiler: webpack.Compiler): void;
}
