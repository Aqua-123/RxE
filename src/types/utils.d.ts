// Generic type utilities

type ObjectKeys<T> = T extends object
  ? (keyof T)[]
  : T extends number
  ? []
  : T extends Array<any> | string
  ? string[]
  : never;

interface ObjectConstructor {
  keys<T>(o: T): ObjectKeys<T>;
}

type AnyFunction = (...a: any[]) => any;
type FunctionKeys<T> = { [K in keyof T]: T[K] extends AnyFunction ? K : never }[keyof T];
type ParametersQ<T> = T extends AnyFunction ? Parameters<T> : any[];
type ReplaceThis<T extends AnyFunction, ThisType> = (this: ThisType, ...a: Parameters<T>) => ReturnType<T>;
type ReplaceThisQ<T, ThisType> = T extends AnyFunction ? ReplaceThis<T, ThisType> : T;
/*type ReplaceReturn<T extends AnyFunction, ReturnTypeNew> = (this: ThisParameterType<T>, ...a: Parameters<T>) => ReturnTypeNew;
type ReplaceReturnQ<T, ReturnTypeNew> = T extends AnyFunction ? ReplaceReturn<T, ReturnTypeNew> : T;*/
type ReplaceMethodReturn<T, K extends FunctionKeys<T>, Return> = (this: T, ...a: ParametersQ<T[K]>) => Return;
type PrependParam<T extends AnyFunction, P> = (self: P, ...a: Parameters<T>) => ReturnType<T>;
type MethodWrapper<T, K extends FunctionKeys<T>> = ReplaceMethodReturn<T, K, boolean | void>