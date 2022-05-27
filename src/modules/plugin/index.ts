import U from "~src/userscript";
import browserWindow from "~src/browserWindow";
import { wrapMethod } from "~src/utils";

function version() {
  return `${U.name} ${U.version}`;
}

// minimal observer pattern
const listeners: Record<string, Function[]> = {};

function addEventListener(name: string, fn: Function) {
  if (!listeners[name]) listeners[name] = [];
  listeners[name].push(fn);
}

function removeEventListener(name: string, fn: Function) {
  if (!listeners[name]) listeners[name] = [];
  const i = listeners[name].indexOf(fn);
  if (i > -1) listeners[name].splice(i, 1);
}

function dispatchEvent(name: string, object: Record<string, any>) {
  if (!listeners[name]) listeners[name] = [];
  let defaultPrevented = false;
  const event = {
    ...object,
    type: name,
    preventDefault() {
      defaultPrevented = true;
    }
  };
  listeners[name].forEach((fn) => fn(event));
  return defaultPrevented;
}

function fixTyping(obj: MessageData) {
  if (obj.typing) RoomClient?.start_typing(obj.user);
  else RoomClient?.stop_typing();
}
export function initPluginAPI() {
  const RxE = {
    version,
    addEventListener,
    removeEventListener,
    dispatchEvent
  };

  wrapMethod(App.room, "join", (room) => {
    dispatchEvent("room.join", { room });
    wrapMethod(App.room.client, "received", (e) => {
      dispatchEvent("room.received", e);
      if (e.user && e.user_disconnected) dispatchEvent("user.left", e);
      if (e.user && e.user_connected) dispatchEvent("user.joined", e);
      if (e.messages && e.messages.length) dispatchEvent("user.message", e);
      fixTyping(e);
    });
  });
  wrapMethod(App.room, "leave", (room) => {
    dispatchEvent("room.leave", { room });
  });

  (browserWindow as any).RxE = RxE;
}
