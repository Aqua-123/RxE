import { TypeGuard } from "ts-type-guards";
export declare type ParseResult<T> = Readonly<{
    kind: "valid";
    value: T;
} | {
    kind: "invalid";
    input: string;
}>;
export declare type Parser<T> = (input: string) => ParseResult<T>;
export declare function enumParser<T>(typeGuard: TypeGuard<T>): (input: string) => ParseResult<T>;
export declare function booleanParser(input: string): ParseResult<boolean>;
export declare function urlParser(input: string): ParseResult<string>;
