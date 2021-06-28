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

function printMessage(from: string, status: string) {
  RoomClient.append({
    user: {
      id: -App.user.id, // NOTE: Why minus?
      display_name: from,
      flair: App.user.flair,
      display_picture: App.user.display_picture
    } as EmeraldUser,
    messages: [status + " [Only you can see this message.]"]
  });
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
    wrapMethod(App.room.client, "received", onMessage, true);
  }

  function onMessage(e: Parameters<typeof App.room.client.received>[0]) {
    if (RoomClient.state.id == null || RoomClient.state.mode == "private")
      return;
    if (typeof e.messages === "undefined") return;
    const { id } = e.user;
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
    if (rating.score >= 1 && !App.room.muted.includes(id)) {
      App.room.mute(id);
      printMessage("AutoMute", `Muted user ${e.user.display_name}.`);
    }
    if (rating.score < 0.75 && App.room.muted.includes(id)) {
      App.room.unmute(id);
    }
  }

  wrapMethod(App.room, "join", onRoomJoin);
  if (App.room.client) onRoomJoin();
}

export function initAntiSpam() {
  if (!Preferences.get(P.antiSpam)) return;
  const i = setInterval(() => {
    if ("App" in window && App.room) {
      clearInterval(i);
      antiSpam();
    }
  }, 100);
}
