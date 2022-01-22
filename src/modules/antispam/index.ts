/* eslint-disable camelcase */
import { P, Preferences } from "~src/preferences";
import { printTransientMessage, wrapMethod } from "~src/utils";

const GREETERS = [21550262, 19422865];

type SpamRating = {
  [key: number]: {
    score: number;
    score2: number;
    d: number;
    p: string;
  };
};
/*
function colorRating(rating: SpamRating[number]) {
  if (rating.score >= 1 || rating.score2 >= 3) return "color:red";
  if (rating.score > 0.8 || rating.score2 >= 1) return "color:orange";
  return "";
}
*/

// from https://www.mathworks.com/matlabcentral/fileexchange/38295-compute-the-entropy-of-an-entered-text-string
function computeEntropy(msg: string, sep: RegExp | string = "") {
  const sorted = msg.split(sep).sort();
  const len = sorted.length;
  const unique = sorted.filter((c, i, a) => c !== a[i - 1]);
  const f = unique.map((c) =>
    sorted.reduce((a, cc) => (cc === c ? a + 1 : a), 0)
  );
  const p = f.map((v) => v / len);
  return p.reduce((H, v) => H + -v * Math.log2(v), 0);
}

function isRepeating(msg: string) {
  const i = (msg + msg).indexOf(msg, 1);
  return i > -1 && i !== msg.length ? msg.length / i : 0;
}

export function initAntiSpam() {
  const spamRating: SpamRating = {};
  const autoMuted: Record<string, true> = {};

  // anti suicide-bombing.
  const rcsJoin = RoomChannelSelect.prototype.join;
  RoomChannelSelect.prototype.join = function join(e) {
    if (e.members) {
      e.members = e.members.filter((v: any) => !!v);
    }
    rcsJoin.call(this, e);
  };
  // same idea, for RoomPrivate
  const rpSetState = RoomPrivate.prototype.setState;
  RoomPrivate.prototype.setState = function setState(state) {
    if (state && "online" in state) {
      state.online = state.online.filter((v: any) => !!v);
    }
    if (state && "offline" in state) {
      state.offline = state.offline.filter((v: any) => !!v);
    }
    return rpSetState.call(this, state as any);
  };

  function onMessage(e: Parameters<typeof App.room.client.received>[0]) {
    if (RoomClient?.state.id == null || RoomClient?.state.mode === "private")
      return;

    // neutralize silly RTL nonsense
    e.user.display_name = `\u2066${e.user.display_name}\u2069`;

    // since we're here, update user list more accurately
    if ("state" in RoomChannelMembersClient && e.user) {
      if (e.user_disconnected) {
        printTransientMessage(`User ${e.user.display_name} left the chat.`);
      } else {
        if (
          !RoomChannelMembersClient.state.members.some(
            (oldMember) => oldMember && oldMember.id === e.user.id
          )
        ) {
          printTransientMessage(`User ${e.user.display_name} joined the chat.`);
        }
        RoomChannelMembersClient.add_member(e.user);
      }
    }

    if (typeof e.messages === "undefined") return;
    const { id, display_name, created_at } = e.user;
    if (App.user.id === id) return;
    const message = e.messages.join("");
    const now = Date.now();
    const uppercase = message.split("").filter((x) => x.toLowerCase() !== x);
    if (!spamRating[id]) {
      spamRating[id] = {
        score: 1,
        score2: 0,
        d: 0,
        p: ""
      };
    }
    const rating = spamRating[id];
    // original anti-spam logic - effective, but prone to false positives
    rating.score += (1e3 / (now - rating.d || now)) ** 0.2;
    rating.score /= Math.max(
      1 / Math.E,
      Math.E - Math.log(10 + message.length + uppercase.length) / 4
    );
    // dumber anti-spam logic - 3 fast messages, you're out.
    const delta = now - rating.d || 1500;
    if (delta <= 1000) {
      rating.score2 += 1;
    } else if (delta > 2000) {
      rating.score2 = Math.max(0, rating.score2 - Math.log10(delta));
    }
    // mean anti-new account additional penalty
    const accountAge = Date.now() - +new Date(created_at);
    if (accountAge < 10 * 60 * 1000) {
      const longMessage = message.length > 200;
      const lowEntropy = computeEntropy(message, /\s+/) < 2;
      const repeating = isRepeating(message) > 3;
      if ((lowEntropy || repeating) && longMessage) {
        rating.score2 += 1;
      }
      const caps = message.toUpperCase() === message;
      rating.score2 *= caps ? 3 : 2;
    }

    // whitelist greeters
    if (GREETERS.includes(id)) {
      rating.score2 = 0;
    }

    rating.d = now;
    rating.p = message;
    /*
    console.log(
      `%cspam s1=${rating.score.toFixed(2)} s2=${rating.score2.toFixed(
        2
      )} e=${computeEntropy(message).toFixed(2)} ${display_name}: ${message}`,
      colorRating(rating)
    );
    */
    if (rating.score2 >= 3 && !App.room.muted.includes(id)) {
      if (Preferences.get(P.antiSpam)) {
        autoMuted[id] = true;
        App.room.mute(id, display_name, "spam");
        printTransientMessage(`AutoMute: Muted user ${display_name}.`);
      }
    }
    if (rating.score2 < 1 && App.room.muted.includes(id) && autoMuted[id]) {
      delete autoMuted[id];
      App.room.unmute(id);
      printTransientMessage(`AutoMute: Unmuted user ${display_name}.`);
    }
  }

  function onRoomJoin() {
    document.querySelector(".wfaf")?.classList.remove("channel-unit-active"); // WART.
    document
      .querySelector(".private-rooms")
      ?.classList.remove("channel-unit-active"); // WART.
    wrapMethod(App.room.client, "received", onMessage, true);
  }

  wrapMethod(App.room, "join", onRoomJoin);
  if (App.room.client) onRoomJoin();
}
