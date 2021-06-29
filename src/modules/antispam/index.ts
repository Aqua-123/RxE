import React from "react";
import { P, Preferences } from "~src/preferences";

/**
 * Inject code in an object method
 */
function wrapMethod<T, K extends keyof T>(
  obj: T,
  method: K,
  fn: T[K],
  before = false
) {
  const origFn = obj[method];
  if (typeof origFn !== "function" || typeof fn !== "function") return;
  obj[method] = <T[K]>(<unknown>function(this: T, ...args: any[]) {
    const r = before && fn.apply(this, args);
    if (!before || r !== false) origFn.apply(this, args);
    if (!before) fn.apply(this, args);
  });
}

let printTimer: number;
function printMessage(msg: string) {
  RoomClient.print_append(React.createElement("div", null, msg));
  clearTimeout(printTimer);
  printTimer = +setTimeout(() => RoomClient.print_append(), 5000);
}

function antiSpam() {
  const spam_rating: {
    [key: number]: {
      score: number;
      d: number;
      p: string;
    };
  } = {};

  function onRoomJoin() {
    document.querySelector(".wfaf")?.classList.remove("channel-unit-active"); // WART.
    wrapMethod(App.room.client, "received", onMessage, true);
  }

  function onMessage(e: Parameters<typeof App.room.client.received>[0]) {
    if (RoomClient.state.id == null || RoomClient.state.mode == "private")
      return;

    // since we're here, update user list more accurately
    if (e.user) {
      if (e.user_disconnected) {
        printMessage(`User ${e.user.display_name} left the chat.`);
      } else {
        if (
          !RoomChannelMembersClient.state.members.some(m => m.id === e.user.id)
        ) {
          printMessage(`User ${e.user.display_name} joined the chat.`);
        }
        RoomChannelMembersClient.add_member(e.user);
      }
    }

    if (typeof e.messages === "undefined") return;
    const { id, display_name } = e.user;
    if (App.user.id == id) return;
    const message = e.messages.join("");
    const now = Date.now();
    const uppercase = message.split("").filter(x => x.toLowerCase() !== x);
    if (!spam_rating[id]) {
      spam_rating[id] = {
        score: 1,
        d: 0,
        p: ""
      };
    }
    const rating = spam_rating[id];

    rating.score += Math.pow(1e3 / (now - rating.d || now), 0.2);
    rating.score /= Math.max(
      1 / Math.E,
      Math.E - Math.log(10 + message.length + uppercase.length) / 4
    );
    rating.d = now;
    rating.p = message;
    console.log(
      `anti-spam ${display_name} score=${rating.score} msg=${message}`
    );
    if (rating.score >= 1 && !App.room.muted.includes(id)) {
      if (Preferences.get(P.antiSpam)) {
        App.room.mute(id);
        printMessage(`AutoMute: Muted user ${display_name}.`);
      }
    }
    if (rating.score < 0.75 && App.room.muted.includes(id)) {
      App.room.unmute(id);
      printMessage(`AutoMute: Unmuted user ${display_name}.`);
    }
  }

  wrapMethod(App.room, "join", onRoomJoin);
  if (App.room.client) onRoomJoin();
}

export function initAntiSpam() {
  const i = setInterval(() => {
    if ("App" in window && App.room) {
      clearInterval(i);
      antiSpam();
    }
  }, 100);
}
