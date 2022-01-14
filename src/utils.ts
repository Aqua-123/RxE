import React from "react";

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
export function wrapMethod<T, K extends keyof T>(
  obj: T,
  method: K,
  fn: T[K],
  before = false
) {
  const origFn = obj[method];
  if (typeof origFn !== "function" || typeof fn !== "function") return;
  obj[method] = <T[K]>(<unknown>function wrapper(this: T, ...args: any[]) {
    const r = before && fn.apply(this, args);
    if (!before || r !== false) origFn.apply(this, args);
    if (!before) fn.apply(this, args);
  });
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

export const until = async (check: () => boolean) => {
  // eslint-disable-next-line no-await-in-loop
  while (!check()) await sleep();
};

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

const b64Set =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
// abuse of https://en.wikipedia.org/wiki/Tags_(Unicode_block)
const tagSet = Array.from({ length: 65 }, (_, i) =>
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

export function b64toU8(b64char: string) {
  const index = b64Set.indexOf(b64char);
  if (index === -1) return null;
  return index;
}

export function b64toU8Array(b64: string) {
  const array = Array.from(b64).map(b64toU8);
  if (array.includes(null)) return null;
  return new Uint8Array(array as number[]);
}

export function bitsplit(u8: number, splits: number, relevantBits = 8) {
  const splitSize = ~~(relevantBits / splits);
  const baseMask = 2 ** splitSize - 1;
  if (relevantBits % splits !== 0)
    // eslint-disable-next-line no-console
    console.warn(
      `bitsplit: splits (${splits}) does not divide evenly into relevantBits (${relevantBits}).`
    );
  return Array.from({ length: splits }, (_, splitNo) => {
    const shift = splitNo * splitSize;
    const mask = baseMask << shift;
    return (u8 & mask) >> shift;
  }).reverse();
}
