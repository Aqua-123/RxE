import React from "react";

/**
 * Slightly less verbose way to create a DOM element.
 */
export const crel = <T extends string>(elt: T, obj = {}) => {
  return Object.assign(document.createElement(elt), obj);
};

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
  obj[method] = <T[K]>(<unknown>function (this: T, ...args: any[]) {
    const r = before && fn.apply(this, args);
    if (!before || r !== false) origFn.apply(this, args);
    if (!before) fn.apply(this, args);
  });
}

let printTimer: number;
export function printTransientMessage(msg: string) {
  clearTimeout(printTimer);
  printMessage(msg);
  document.body.classList.add("tmp-message");
  printTimer = +setTimeout(() => {
    RoomClient.print_append();
    document.body.classList.remove("tmp-message");
  }, 5000);
}

export function printMessage(msg: string) {
  clearTimeout(printTimer);
  RoomClient.print_append(React.createElement("div", null, msg));
}

export const sleep = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const until = async (check: () => boolean) => {
  while (!check()) await sleep();
};
