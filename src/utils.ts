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
  for (const value of set1.values()) {
    if (!set2.has(value)) added.add(value);
  }
  for (const value of set2.values()) {
    if (!set1.has(value)) removed.add(value);
  }
  return { added, removed };
}
