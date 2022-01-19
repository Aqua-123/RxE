/* eslint-disable prettier/prettier */
/* eslint-disable max-classes-per-file */
import React from "react";

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

export const b64Set =
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

export function representColour(colour: RGB): string {
  return `#${colour.map((comp) => comp.toString(16).padStart(2, '0')).join('')}`;
}

export function imageFromData(image: RGB[] | Map<number, RGB>, width: number, height: number, backgroundColour?: RGB): string {
  const imageData = Array.from(image.entries())
  return canvasToImage((canvas, context) => {
    canvas.width = width;
    canvas.height = height;
    if (backgroundColour)
      context.fillStyle = representColour(backgroundColour);
    context.fillRect(0, 0, width, height);
    imageData.forEach(([offset, colour]) => {
      context.fillStyle = representColour(colour);
      context.fillRect(offset % width, ~~(offset / height), 1, 1);
    });
  });
}

export function toNearestStep(value: number, step: number, minimum: number, maximum: number) {
  return clamp(Math.round(value / step), minimum, maximum);
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

export function validColour(colour: RGB): boolean {
  return !colour.some((component) => component < 0 || component > 255);
}

export function colourEqualTo([r, g, b]: RGB) {
  return ([R, G, B]: RGB) => r === R && g === G && b === B
};

export function colourDifference(colour1: RGB, colour2: RGB): number {
  return colour1.map((x, i) => ((x - colour2[i]) / 255) ** 2).reduce((a, b) => a + b, 0) / 3;
}

export function colourClosestMatch(palette: RGB[], colour: RGB): [number, number] {
  const differences = palette.map((x, i) => [i, colourDifference(x, colour)]);
  differences.sort((a, b) => a[1] - b[1]);
  return differences[0] as [number, number];
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

export function groups<T>(array: T[], groupSize: number): T[][] {
  if (array.length === 0) return [];
  const groupsAll: T[][] = [[]];
  array.forEach((item) => {
    let last = groupsAll[groupsAll.length - 1];
    if (last.length === groupSize) {
      last = [];
      groupsAll.push(last);
    }
    last.push(item);
  });
  return groupsAll;
}

export function stringGroups(str: string, groupSize: number): string[] {
  return groups(str.split(''), groupSize).map(group => group.join(''));
}

export function median(array: number[]) {
  const numbers = Array.from(array);
  numbers.sort((a, b) => a - b);
  // eslint-disable-next-line prefer-destructuring
  const length = numbers.length;
  if (length % 2 === 0) return .5 * (numbers[~~(length / 2)] + numbers[~~(length / 2) - 1]);
  return numbers[~~(length / 2)];
}

export function mostFrequent(array: string[]): string[] {
  const occurences: Record<string, number> = {};
  Array.prototype.forEach.call(array, (item) => {
    const occured = (occurences[item] ?? 0) + 1;
    occurences[item] = occured;
  });
  const entries = Array.from(Object.entries(occurences));
  entries.sort(([_, o1], [__, o2]) => o2 - o1);
  return Array.from(entries).map(([item]) => item);
}

export function allOf<T>(array: (T | null | undefined)[]): T[] | null {
  if (array.includes(null) || array.includes(undefined)) return null;
  return array as T[];
}

export function wholeMatch(array: RegExpMatchArray) {
  return array[0];
}

export function divertEventListeners(target: EventTarget, type: string): EventTarget {
  const newTarget = new EventTarget();
  target.addEventListener(type, (event) => {
    const newEvent = new Event(event.type);
    Object.assign(newEvent, event);
    newTarget.dispatchEvent(newEvent);
    event.stopPropagation();
  }, true);
  return newTarget;
}

export function timeSince(date: Date) {
  return +new Date() - +date;
}

export const DAY = 24 * 3600e3;