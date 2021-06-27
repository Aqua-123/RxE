/// <reference types="node" />
import * as Metadata from "userscript-metadata";
import Manifest from "webextension-manifest";
import { Mode } from "./mode";
import { ParseResult, booleanParser, urlParser } from "./parsing";
export declare const HOSTED_AT_EXAMPLE = "https://example.com/userscripts";
export declare type BuildConfig = Readonly<{
    allowJs: boolean;
    appendDateToVersion: {
        development: boolean;
        nightly: boolean;
        production: boolean;
    };
    id: string;
    hostedAt: string | null;
    mainFile: string;
    mode: Mode;
    nightly: boolean;
    now: Date;
    outDir: string;
    rootDir: string;
    sassVariableGetter: string;
    sassVariables: Record<string, unknown>;
    sourceDir: string;
    verbose: boolean;
}>;
export declare type WebpackConfigParameters = Readonly<{
    buildConfig: BuildConfig;
    manifest?: (buildConfig: BuildConfig) => Manifest;
    metadata: (buildConfig: BuildConfig) => Metadata.Metadata;
    metadataSchema: Metadata.ValidateOptions;
    env: NodeJS.ProcessEnv;
}>;
declare type EnvVarNameWithoutPrefix = keyof typeof ENVIRONMENT_VARIABLES;
export declare type EnvVarError = Readonly<{
    fullName: string;
    expected: string | readonly string[];
    found: string;
}>;
export declare function envVarName(nameWithoutPrefix: EnvVarNameWithoutPrefix): string;
export declare const ENVIRONMENT_VARIABLES: {
    readonly MODE: {
        readonly nameWithoutPrefix: "MODE";
        readonly parser: (input: string) => ParseResult<"production" | "development">;
        readonly overrides: "mode";
        readonly mustBe: ("production" | "development")[];
    };
    readonly NIGHTLY: {
        readonly nameWithoutPrefix: "NIGHTLY";
        readonly parser: typeof booleanParser;
        readonly overrides: "nightly";
        readonly mustBe: readonly ["true", "false"];
    };
    readonly HOSTED_AT: {
        readonly nameWithoutPrefix: "HOSTED_AT";
        readonly parser: typeof urlParser;
        readonly overrides: "hostedAt";
        readonly mustBe: "a valid URL (e.g. \"https://example.com/userscripts\")";
    };
    readonly VERBOSE: {
        readonly nameWithoutPrefix: "VERBOSE";
        readonly parser: typeof booleanParser;
        readonly overrides: "verbose";
        readonly mustBe: readonly ["true", "false"];
    };
};
export declare type BuildConfigAndListOf<E> = Readonly<{
    buildConfig: BuildConfig;
    errors: readonly E[];
}>;
declare type DistFileType = "user" | "meta";
export declare function distFileName(id: string, type: DistFileType): string;
export declare function metadataUrl(hostedAt: string, id: string, type: DistFileType): string;
export declare function envVars(env: NodeJS.ProcessEnv): ReadonlyArray<readonly [string, string | undefined]>;
export declare function overrideBuildConfig(buildConfig: BuildConfig, env: NodeJS.ProcessEnv): BuildConfigAndListOf<EnvVarError>;
export {};
