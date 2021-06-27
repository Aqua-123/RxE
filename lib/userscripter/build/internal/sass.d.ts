import sass from "sass";
export declare function getGlobalFrom(objectToBeExposedToSass: Record<string, unknown>): (keyString: sass.types.SassType) => sass.types.SassType;
export declare function withDartSassEncodedParameters<Name extends string, Args extends unknown[]>(functionName: Name, f: (...args: Args) => sass.types.SassType): `${Name}(${string})`;
