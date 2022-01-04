// userscript-specific APIs

declare function GM_getValue<T extends any>(key: string, defaultValue: T): T;
declare function GM_deleteValue(key: string): void;
declare function GM_setValue(name: string, value: any): void;
declare function GM_listValues(): string[];
declare const unsafeWindow: undefined | Window;
