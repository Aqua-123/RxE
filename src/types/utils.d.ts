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
type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
type FunctionKeys<T> = KeysOfType<T, AnyFunction>;
type ParametersQ<T> = T extends AnyFunction ? Parameters<T> : any[];
type ReplaceThis<T extends AnyFunction, ThisType> = (
  this: ThisType,
  ...a: Parameters<T>
) => ReturnType<T>;
type ReplaceThisQ<T, ThisType> = T extends AnyFunction
  ? ReplaceThis<T, ThisType>
  : T;
/*type ReplaceReturn<T extends AnyFunction, ReturnTypeNew> = (this: ThisParameterType<T>, ...a: Parameters<T>) => ReturnTypeNew;
type ReplaceReturnQ<T, ReturnTypeNew> = T extends AnyFunction ? ReplaceReturn<T, ReturnTypeNew> : T;*/
type ReplaceMethodReturn<T, K extends FunctionKeys<T>, Return> = (
  this: T,
  ...a: ParametersQ<T[K]>
) => Return;
type PrependParam<T extends AnyFunction, P> = (
  self: P,
  ...a: Parameters<T>
) => ReturnType<T>;
type MethodWrapper<T, K extends FunctionKeys<T>> = ReplaceMethodReturn<
  T,
  K,
  boolean | void
>;

type TwoToOne<T, R> = (a: T, b: T) => R;
type Sorter<T> = TwoToOne<T, number>;
type SortOrder = "asc" | "desc";

type Arg0<T extends AnyFunction> = T extends (arg0: infer U) => any ? U : never;

type StringWrapper<T> = (match: string) => null | T | T[];

// lame

type Constructor<T> = Function & { prototype: T };
interface Prototype<T> {
  constructor: Constructor<T>;
}
