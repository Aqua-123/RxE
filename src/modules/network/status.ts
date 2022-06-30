import { timeout } from "~src/utils";

const TIMEOUT = 5e3;

export const networkStatusAlert = new EventTarget();

let waitingResponses: AnyFunction[] = [];

function reportConnectionStatus(connected: boolean) {
  const type = connected ? "connected" : "disconnected";
  const event = new CustomEvent(type);
  networkStatusAlert.dispatchEvent(event);
}

function waitForResponse() {
  return new Promise((resolve) => waitingResponses.push(resolve));
}

export function expectResponse() {
  timeout(waitForResponse(), TIMEOUT).catch(() => {
    reportConnectionStatus(false);
  });
}

export function responseReceived() {
  waitingResponses.forEach((resolve) => resolve());
  waitingResponses = [];
  reportConnectionStatus(true);
}
