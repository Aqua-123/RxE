export declare const Mode: {
    readonly production: "production";
    readonly development: "development";
};
export declare type Mode = keyof typeof Mode;
export declare function isMode(x: unknown): x is Mode;
