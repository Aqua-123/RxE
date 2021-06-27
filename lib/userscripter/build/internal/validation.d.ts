import { BuildConfig } from "./configuration";
export declare type BuildConfigError<K extends keyof BuildConfig> = Readonly<{
    name: K;
    expected: string;
    found: BuildConfig[K];
}>;
export declare type BuildConfigValidators = Readonly<{
    [k in keyof BuildConfig]: PredicateWithDescription<BuildConfig[k]>;
}>;
declare type PredicateWithDescription<T> = Readonly<{
    predicate: (x: T) => boolean;
    description: string;
}>;
export declare function buildConfigErrors(buildConfig: BuildConfig): ReadonlyArray<BuildConfigError<any>>;
export {};
