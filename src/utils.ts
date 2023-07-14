/* eslint-disable max-classes-per-file */

// TODO: Split up
import md5 from "md5";
import React, { KeyboardEvent, MouseEvent } from "react";

const { max, min } = Math;

/**
 * Slightly less verbose way to create a DOM element.
 */
export const crel = <T extends string>(elt: T, obj = {}) =>
  Object.assign(document.createElement(elt), obj);

const cssBucket: string[] = [];
/**
 * Group some styles into a common <style> node.
 */
export function loadCSS(css: string) {
  cssBucket.push(css);
  Promise.resolve().then(() => {
    if (!cssBucket.length) return;
    const str = cssBucket.join("\n");
    cssBucket.length = 0;
    document.head.append(
      crel("style", {
        type: "text/css",
        textContent: str
      })
    );
  });
}

/**
 * Inject code in an object method
 */
export function wrapMethod<T, K extends FunctionKeys<T>>(
  obj: T,
  method: K,
  fn: MethodWrapper<T, K>,
  before = false
) {
  const origFn = obj[method] as unknown as AnyFunction;
  obj[method] = <T[K]>(
    (<unknown>function wrapper(this: T, ...args: ParametersQ<T[K]>) {
      const r = before && fn.apply(this, args);
      let retval = null;
      if (!before || r !== false) retval = origFn.apply(this, args);
      if (!before) fn.apply(this, args);
      return retval;
    })
  );
}

export function groupBy<T>(array: T[], groupSize: number): T[][] {
  const groups: T[][] = [];
  for (let index = 0; index < array.length; index += groupSize) {
    const group = array.slice(index, index + groupSize);
    groups.push(group);
  }
  return groups;
}

export function stringGroups(str: string, groupSize: number): string[] {
  return groupBy(str.split(""), groupSize).map((group) => group.join(""));
}

export function clamp(num: number, atLeast: number, atMost: number) {
  return min(atMost, max(atLeast, num));
}

let printTimer: number;
export function printMessage(msg: string) {
  clearTimeout(printTimer);
  Promise.resolve().then(() =>
    RoomClient?.print_append(React.createElement("div", null, msg))
  );
}

export function printTransientMessage(msg: string) {
  printMessage(msg);
  document.body.classList.add("tmp-message");
  printTimer = +setTimeout(() => {
    RoomClient?.print_append();
    document.body.classList.remove("tmp-message");
  }, 5000);
}

export const sleep = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  message = "Timed out"
) {
  return Promise.race([
    promise,
    sleep(ms).then(() => Promise.reject(new Error(message)))
  ]);
}

export const until = async (check: () => boolean) => {
  // eslint-disable-next-line no-await-in-loop
  while (!check()) await sleep();
};

export namespace sorters {
  export const string: Sorter<string> = (a, b) => a.localeCompare(b);
  export const numeric: Sorter<number> = (a, b) => a - b;
}

export function swap<T, R>(func: TwoToOne<T, R>): TwoToOne<T, R> {
  return (a, b) => func(b, a);
}

export function sum(array: number[]) {
  return array.reduce((a, b) => a + b, 0);
}

export const multiply = (a: number, b: number) => a * b;

export function product(array: number[]) {
  return array.reduce(multiply, 1);
}

export const some = <T>(item: T | null | undefined): T => {
  if (item === null) throw new Error("got null");
  if (item === undefined) throw new Error("got undefined");
  if (typeof item === "number" && Number.isNaN(item))
    throw new Error("got NaN");
  return item;
};

export const always =
  <T>(item: T) =>
  () =>
    item;

export const equals = <T>(a: T, b: T) => a === b;

export const equalsTo =
  <T>(a: T) =>
  (b: T) =>
    a === b;

export function extractBoth<S, T, V>(
  extract: (s: S) => T,
  pair: (t1: T, t2: T) => V
): (s1: S, s2: S) => V {
  return (s1, s2) => pair(extract(s1), extract(s2));
}

export function sortingOn<T, V, K extends KeysOfType<T, V>, R>(
  propName: K,
  func: TwoToOne<V, R>
): TwoToOne<T, R> {
  return (a, b) =>
    func(a[propName] as unknown as V, b[propName] as unknown as V);
}

export function sortWith<T>(
  array: T[],
  sorter: Sorter<T>,
  order: SortOrder,
  inSitu = false
) {
  const items = inSitu ? array : Array.from(array);
  const sorterOrdered = order === "asc" ? sorter : swap(sorter);
  items.sort(sorterOrdered);
  return items;
}

export function sortBy<T, V, K extends KeysOfType<T, V>>(
  array: T[],
  key: K,
  sorter: Sorter<V>,
  order: SortOrder,
  inSitu = false
) {
  return sortWith(array, sortingOn(key, sorter), order, inSitu);
}

export function memoize<R>(compute: (arg0: string) => R) {
  const cache: Record<string, R> = {};
  return (val: string) => {
    if (!Object.prototype.hasOwnProperty.call(cache, val))
      cache[val] = compute(val);
    return cache[val];
  };
}

export function memoizeAsync<R>(compute: (arg0: string) => Promise<R>) {
  const cache: Record<string, R> = {};
  return async (arg0: string | number) => {
    const val = typeof arg0 === "number" ? arg0.toString() : arg0;
    if (!Object.prototype.hasOwnProperty.call(cache, val))
      cache[val] = await compute(val);
    return cache[val];
  };
}

export function setDiff<T>(set1: Set<T>, set2: Set<T>) {
  const added = new Set<T>();
  const removed = new Set<T>();
  // help eslint is yelling at me when i use iterators and for-of loops :')
  Array.from(set1.values()).forEach((value) => {
    if (!set2.has(value)) added.add(value);
  });
  Array.from(set2.values()).forEach((value) => {
    if (!set1.has(value)) removed.add(value);
  });
  return { added, removed };
}

export const b64Set =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
// abuse of https://en.wikipedia.org/wiki/Tags_(Unicode_block)
export const tagSet = Array.from({ length: 65 }, (_, i) =>
  String.fromCodePoint(i + 0xe0020)
).join("");

export function encodeInvisible(urlPath: string) {
  const str = btoa(urlPath);
  let out = "";
  for (let pos = 0; pos < str.length; pos += 1) {
    const i = b64Set.indexOf(str[pos]);
    if (i === -1) return null;
    out += tagSet[i * 2] + tagSet[i * 2 + 1];
  }
  return out;
}

export function decodeInvisible(str: string) {
  let b64 = "";
  for (let pos = 1; pos < str.length; pos += 2) {
    const i = tagSet.indexOf(str[pos]);
    if (i === -1) throw new Error("bad image path");
    b64 += b64Set[(i - 1) / 2];
  }
  return atob(b64);
}

export function expect<T extends EventTarget>(
  target: T,
  eventType: string,
  afterHook?: (t: T) => void
) {
  return new Promise((r) => {
    target.addEventListener(eventType, r);
    if (afterHook) afterHook(target);
  });
}

export function median(array: number[]) {
  const numbers = Array.from(array);
  numbers.sort((a, b) => a - b);
  // eslint-disable-next-line prefer-destructuring
  const length = numbers.length;
  if (length % 2 === 0)
    return 0.5 * (numbers[~~(length / 2)] + numbers[~~(length / 2) - 1]);
  return numbers[~~(length / 2)];
}

export function getFrequencies(array: string[]): [string, number][] {
  const occurences: Record<string, number> = {};
  Array.prototype.forEach.call(array, (item) => {
    const occured = (occurences[item] ?? 0) + 1;
    occurences[item] = occured;
  });
  const entries = Array.from(Object.entries(occurences));
  sortBy(entries, "1", sorters.numeric, "desc", true);
  return Array.from(entries);
}

export function allOf<T>(array: (T | null | undefined)[]): T[] | null {
  if (array.includes(null) || array.includes(undefined)) return null;
  return array as T[];
}

export function existing<T>(
  array: (T | null | undefined)[] | null | undefined
): T[] {
  if (array === null || array === undefined) return [];
  return array.filter((item) => item !== undefined && item !== null) as T[];
}

export function wholeMatch(array: RegExpMatchArray) {
  return array[0];
}

/**
 * Returns a new EventTarget receiving all events of the given type
previously routed to the given EventTarget, bypassing previous event handlers.
 */
export function divertEventListeners(
  target: EventTarget,
  type: string
): EventTarget {
  const newTarget = new EventTarget();
  target.addEventListener(
    type,
    (event) => {
      const newEvent = new Event(event.type);
      Object.assign(newEvent, event);
      newTarget.dispatchEvent(newEvent);
      event.stopPropagation();
    },
    true
  );
  return newTarget;
}

export function timeSince(date: Date | number) {
  return +new Date() - +new Date(date);
}

export const MINUTE = 60e3;
export const DAY = 24 * 3600e3;

export function allStringMatches(
  string: string,
  substring: string,
  caseSensitive = false
): number[] {
  let str = caseSensitive ? string : string.toLowerCase();
  const subs = caseSensitive ? substring : substring.toLowerCase();
  const matches: number[] = [];
  let index = 0;
  while (str.length > 0) {
    index = str.indexOf(subs);
    if (index === -1) return matches;
    matches.push(index + string.length - str.length);
    str = str.slice(index + Math.max(subs.length, 1));
  }
  return matches;
}

export function wrapAlternating<S, T>(
  strings: string[],
  wrapper1: StringWrapper<S>,
  wrapper2: StringWrapper<T>
): (T | S)[] {
  let wrapFirst = false;
  return strings.flatMap((string) => {
    wrapFirst = !wrapFirst;
    const wrapped = wrapFirst ? wrapper1(string) : wrapper2(string);
    if (wrapped === null) return [];
    return wrapped instanceof Array ? wrapped : [wrapped];
  });
}

type PartitionMatches = [number, number][] | number[];

function extractPartitions(
  string: string,
  matches: [number, number][]
): string[];
// eslint-disable-next-line no-redeclare
function extractPartitions(
  string: string,
  matches: number[],
  length: number
): string[];

// eslint-disable-next-line no-redeclare
function extractPartitions(
  string: string,
  matches: PartitionMatches,
  length?: number
): string[] {
  if (matches.length === 0) return [string];
  const indices: (number | undefined)[] = matches.flatMap((item) => {
    if (typeof item === "number") {
      if (length === undefined)
        throw new Error(
          "Length must not be undefined if matches is of type number[]"
        );
      return [item, item + length];
    }
    const [index, len] = item;
    return [index, index + len];
  });
  indices.push(undefined);
  const partitions = indices.map((index, count, { [count - 1]: last }) =>
    string.slice(last ?? 0, index)
  );
  return partitions;
}

export function wrapPartitions<S, T>(
  string: string,
  regexp: RegExp,
  wrapper: StringWrapper<S>,
  restwrapper: StringWrapper<T>
): (S | T)[] {
  const matches = Array.from(string.matchAll(regexp)).map((match) => {
    if (match.index === undefined)
      throw new Error("So TypeScript really was right about match.index");
    return [match.index, match[0].length] as [number, number];
  });
  const partitions = extractPartitions(string, matches);
  return wrapAlternating(partitions, restwrapper, wrapper);
}

export function wrapMatches<S>(
  string: string,
  regexp: RegExp,
  wrapper: StringWrapper<S>
) {
  return wrapPartitions(string, regexp, wrapper, (text) => text);
}

export function wrapStringPartitions<S, T>(
  string: string,
  substring: string,
  wrapper: StringWrapper<T>,
  restwrapper: StringWrapper<S>,
  caseSensitive = false
): Array<S | T> {
  const matches = allStringMatches(string, substring, caseSensitive);
  const subsLength = Math.max(substring.length, 1);
  const partitions = extractPartitions(string, matches, subsLength);
  return wrapAlternating(partitions, restwrapper, wrapper);
}

export function wrapStringMatches<T>(
  string: string,
  substring: string,
  wrapper: (match: string) => T,
  caseSensitive = false
) {
  return wrapStringPartitions(
    string,
    substring,
    wrapper,
    (text) => text,
    caseSensitive
  );
}

export function formatSignedAmount(amount: number) {
  const abbrev =
    Math.abs(amount) >= 1000
      ? `${(amount / 1000).toPrecision(3)}K`
      : `${amount}`;
  return amount >= 0 ? `+${abbrev}` : `${abbrev}`;
}

export function accountAgeScaled(user: EmeraldUser) {
  const ageLog = Math.log(+new Date() - +new Date(user.created_at) + 1);
  return Math.min(ageLog / Math.log(5e11), 1);
}

export function mapValues<K extends string | number | symbol, V, V2>(
  dict: Record<K, V>,
  func: (k: K, v: V) => V2
): Record<K, V2> {
  const keys = Object.getOwnPropertyNames(dict) as K[];
  const entries = keys.map((key) => [key, func(key, dict[key])] as [K, V2]);
  return Object.fromEntries(entries) as Record<K, V2>;
}

export function pickValues<T extends Record<string | number | symbol, any>, V>(
  dict: T,
  type: Constructor<V>
): Record<KeysOfType<T, V> & keyof T, V> {
  const keys = Object.getOwnPropertyNames(dict) as (keyof T)[];
  const keysOfType = keys.filter(
    (key) => (dict[key] as any) instanceof type
  ) as any as KeysOfType<T, V>[];
  const entries = keysOfType.map((k) => [k, dict[k]] as [KeysOfType<T, V>, V]);
  return Object.fromEntries(entries) as Record<KeysOfType<T, V>, V>;
}

export function choosePairs<T>(array: T[]): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 0; i < array.length; i += 1)
    for (let j = i + 1; j < array.length; j += 1)
      pairs.push([array[i], array[j]]);
  return pairs;
}

export function pairwise<S, T, R>(func: (s: S, t: T) => R) {
  return ([s, t]: [S, T]) => func(s, t);
}

export const percent = (fraction: number) =>
  `${(Number.isNaN(fraction) ? 0 : fraction * 100).toPrecision(3)}%`;

export const without = <T>(item: T, array: T[]) =>
  array.filter((arrayItem) => arrayItem !== item);

export const stripBiDi = (s: string) => {
  const bidireg = /[\u061C\u200E-\u200F\u202A-\u202E\u2066-\u2069]/g;
  if (!s) return s;
  return s.replace(bidireg, "");
};
// from https://www.mathworks.com/matlabcentral/fileexchange/38295-compute-the-entropy-of-an-entered-text-string
export function textEntropy(msg: string, sep: RegExp | string = "") {
  const sorted = msg.split(sep).sort();
  const len = sorted.length;
  const unique = sorted.filter((c, i, a) => c !== a[i - 1]);
  const f = unique.map((c) =>
    sorted.reduce((a, cc) => (cc === c ? a + 1 : a), 0)
  );
  const p = f.map((v) => v / len);
  return p.reduce((H, v) => H + -v * Math.log2(v), 0);
}

export function isRepeating(msg: string) {
  const i = (msg + msg).indexOf(msg, 1);
  return i > -1 && i !== msg.length ? msg.length / i : 0;
}

type HandlerPropOpts = {
  allowSpace?: boolean;
  otherKeysStopPropagation?: boolean;
  otherKeysPreventDefault?: boolean;
};

const handlerOptsDefault: HandlerPropOpts = {
  allowSpace: false,
  otherKeysPreventDefault: false,
  otherKeysStopPropagation: false
};

export function onClickOrKeyUp<T>(
  handler: (ev: MouseEvent<T> | KeyboardEvent<T>) => void,
  {
    allowSpace,
    otherKeysStopPropagation,
    otherKeysPreventDefault
  }: HandlerPropOpts = handlerOptsDefault
) {
  return {
    onClick: handler,
    onKeyUp: (ev: KeyboardEvent<T>) => {
      if (ev.key === "Enter" || (allowSpace && ev.key === "")) handler(ev);
      else {
        if (otherKeysStopPropagation) ev.stopPropagation();
        if (otherKeysPreventDefault) ev.preventDefault();
      }
    }
  };
}

/**
 * Concatenates a list of regular expressions. 
Uses flag from last RegExp or interprets last string as flags.
 * @param res Array of regular expressions or strings
 */
export function regexpcc(...res: (RegExp | string)[]) {
  if (res.length === 0) throw new Error("Must supply at least one RegExp");
  const last = res[res.length - 1];
  const lastFlagsOnly = typeof last === "string";
  const sources = res.slice(0, lastFlagsOnly ? -1 : 0);
  const flags = typeof last === "string" ? last : last.flags;
  const getSource = (re: RegExp | string) =>
    typeof re === "string" ? re : re.source;
  return new RegExp(sources.map(getSource).join(""), flags);
}

export class PassableError extends Error {}

/**
 * Returns the result of the first function that does not throw a PassableError.
Throws if any other Error is thrown, or if the last function throws.
 */
export async function firstSuccessAsync<T>(
  funcs: (() => Promise<T>)[]
): Promise<T> {
  for (let i = 0; i < funcs.length; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await funcs[i]();
    } catch (e) {
      if (!(e instanceof PassableError) || i === funcs.length - 1) throw e;
      else console.log(`Item ${i} threw: `, e.message);
    }
  }
  throw new Error("funcs cannot be empty");
}

export function cached<T>(compute: () => T): () => T {
  let computed = false;
  let value: T | null = null;
  return () => {
    value = computed ? value : compute();
    computed = true;
    return value!;
  };
}

export function notNum<T>(mixed: T | number): T | undefined {
  if (typeof mixed === "number") {
    return undefined;
  }
  return mixed;
}

export function getUserId(mixed: EmeraldUser | number | null): number {
  // this should ensure two non-existent users aren't equal
  if (mixed === null) return NaN;
  return typeof mixed === "number" ? mixed : mixed.id;
}

export async function readFile(file: File): Promise<string> {
  const reader = new FileReader();
  await expect(reader, "load", (fileReader) => fileReader.readAsDataURL(file));
  if (!reader.result) throw new Error("Got no result reading file");
  return reader.result.toString();
}

export async function loadImage(url: string): Promise<Image> {
  const image = new Image();
  await expect(image, "load", (img) => {
    img.src = url;
  });
  return image;
}

export async function getImageType(url: string): Promise<string | undefined> {
  const request = await fetch(url);
  const buffer = await request.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 4));
  const header = Array.from(bytes)
    .map((val) => val.toString(16))
    .join("");

  if (header.startsWith("424d")) return "image/bmp";

  switch (header) {
    case "89504e47":
      return "image/png";
    case "47494638":
      return "image/gif";
    case "ffd8ffe0":
    case "ffd8ffe1":
    case "ffd8ffe2":
      return "image/jpeg";
    case "25504446":
      return "application/pdf";
    default:
      return undefined;
  }
}

export function isFunction<T>(f: Function | T): f is Function {
  return typeof f === "function";
}

export function oneOrMore<T>(obj: T | T[]): T[] {
  if (Array.isArray(obj)) return obj;
  return [obj];
}

export function versionComparison(version1: string, version2: string): number {
  const version1Array = version1.split(".");
  const version2Array = version2.split(".");

  for (let i = 0; i < 4; i += 1) {
    const num1 = Number(version1Array[i]);
    const num2 = Number(version2Array[i]);
    if (num1 > num2) {
      return 1;
    }
    if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

export function hashBlob(blob: Blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.onload = () => {
      const data = fileReader.result as string;
      const hash = md5(data);
      resolve(hash);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

export async function getImageBlobFromUrl(url: string) {
  const response = await fetch(url);
  return response.blob();
}

export function getTimeAgo(timestamp: string) {
  const currentTime = new Date();
  const pastTime = new Date(timestamp);
  const timeDifference = currentTime.getTime() - pastTime.getTime();
  const seconds = Math.floor(timeDifference / 1000);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(timeDifference / 1000 / 60);

  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }

  const hours = Math.floor(timeDifference / 1000 / 60 / 60);

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days = Math.floor(timeDifference / 1000 / 60 / 60 / 24);
  return `${days} days ago`;
}
