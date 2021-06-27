import * as Metadata from "userscript-metadata";
import * as webpack from "webpack";
import { BuildConfig, WebpackConfigParameters } from "./configuration";
export declare const DEFAULT_BUILD_CONFIG: (x: {
    rootDir: string;
    id: string;
    now: Date;
}) => BuildConfig;
export declare const DEFAULT_METADATA_SCHEMA: Metadata.ValidateOptions;
export declare function createWebpackConfig(x: WebpackConfigParameters): webpack.Configuration;
