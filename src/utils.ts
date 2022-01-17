import React from "react";

const { ceil, log2, max, min } = Math;

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

export function timeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    sleep(ms).then(() => Promise.reject(new Error("Timed out")))
  ]);
}

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

export function bitSplit(
  bits: number,
  splits: number,
  relevantBits = max(0, ceil(log2(bits)))
) {
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
    return (bits & mask) >> shift;
  }).reverse();
}

export function bitJoin(numbers: number[], relevantBits: number) {
  return numbers
    .reverse()
    .map((num, index) => num << (index * relevantBits))
    .reduce((a, b) => a + b, 0);
}

export function u8toB64(u8: number) {
  if (u8 < 0 || u8 > 63) throw new RangeError("u8 has to be from 0 to 63");
  return b64Set[u8];
}

export function numToB64(num: number) {
  const bits = max(0, ceil(log2(num)));
  return bitSplit(num, ceil(bits / 6), ceil(bits / 6) * 6)
    .map(u8toB64)
    .join("");
}

export function b64toU8(b64char: string | undefined | null) {
  if (!b64char) return null;
  const index = b64Set.indexOf(b64char);
  if (index === -1) return null;
  return index;
}

export function b64toU8Array(b64: string) {
  const array = Array.from(b64).map(b64toU8);
  if (array.includes(null)) return null;
  return new Uint8Array(array as number[]);
}

export function canvasToImage(
  callback: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void,
  type?: string
): string {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  // this coercion is actually per spec
  callback(canvas, context!);
  return canvas.toDataURL(type);
}

export function b64HexColor(s: string | null | undefined) {
  if (!s) return null;
  if (s.length === 0) throw new Error("");
  const u8 = b64toU8(s);
  if (u8 === null) return null;
  const code = bitSplit(u8, 3, 6)
    .map((u2) => (u2 * 5).toString(16))
    .join("");
  return `#${code}`;
}

export function rgbToB64(colour: [number, number, number]) {
  const [r, g, b] = colour.map((component) =>
    clamp(Math.round((component * 3) / 255), 0, 3)
  );
  return u8toB64((r << 4) + (g << 2) + b);
}

export function getImageData(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  const { width, height } = image;
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, width, height);
}

export class Tape {
  protected __pointer: number = 0;

  get pointer() {
    return this.__pointer;
  }

  protected set pointer(value) {
    this.__pointer = value;
  }

  public readonly data;

  // eslint-disable-next-line no-useless-constructor
  constructor(data: string) {
    this.data = data;
  }

  advance(steps: number = 1): string | undefined {
    this.pointer += steps;
    return this.data[this.pointer];
  }

  read(chars: number = 1): string | undefined {
    const string = this.peek(chars);
    this.advance(chars);
    return string;
  }

  peek(chars: number = 1): string | undefined {
    const left = min(0, chars);
    const right = max(0, chars);
    return (
      this.data.slice(this.pointer + left, this.pointer + right) || undefined
    );
  }

  warnExpected(message: string, expectedCount = 1) {
    const { data, pointer } = this;
    const context = data.slice(
      pointer - 5 - expectedCount,
      pointer - expectedCount
    );
    const missing = data
      .slice(pointer - expectedCount, pointer)
      .padEnd(expectedCount, "_");
    console.warn(`${message}: ${context}${missing}`);
  }

  outOfBounds() {
    return this.pointer >= this.data.length;
  }
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

/**
 * Returns any of the most frequent elements of the array.
 */
export function mostFrequent<T>(array: T[]): T[] {
  const occurences = new Map<T, number>();
  array.forEach((item) => {
    const occured = (occurences.get(item) ?? 0) + 1;
    occurences.set(item, occured);
  });
  const entries = Array.from(occurences.entries());
  entries.sort(([_, o1], [__, o2]) => o2 - o1);
  return entries.map(([item]) => item);
}
