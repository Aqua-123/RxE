/* eslint-disable camelcase */
import { P, Preferences } from "~src/preferences";
import { printTransientMessage, wrapMethod } from "~src/utils";

type SpamRating = {
  [key: number]: {
    score: number;
    score2: number;
    d: number;
    p: string;
  };
};
function colorRating(rating: SpamRating[number]) {
  if (rating.score >= 1 || rating.score2 >= 3) return "color:red";
  if (rating.score > 0.8 || rating.score2 >= 1) return "color:orange";
  return "";
}

export function initAntiSpam() {
  const spamRating: SpamRating = {};

  // anti suicide-bombing. TODO: test me
  const rcsJoin = RoomChannelSelect.prototype.join;
  RoomChannelSelect.prototype.join = function join(e) {
    if (e.members) {
      e.members = e.members.filter((v: any) => !!v);
    }
    rcsJoin.call(this, e);
  };
  const rcmSetState = RoomChannelMembers.prototype.setState;
  RoomChannelMembers.prototype.setState = function setState(e) {
    if (e && "members" in e) {
      e.members = e.members
        .filter((v) => !!v)
        .sort((a, b) => a.display_name.localeCompare(b.display_name));
    }
    rcmSetState.call(this, e as any);
  };

  function onMessage(e: Parameters<typeof App.room.client.received>[0]) {
    if (RoomClient.state.id == null || RoomClient.state.mode === "private")
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
            (m) => m.id === e.user.id
          )
        ) {
          printTransientMessage(`User ${e.user.display_name} joined the chat.`);
        }
        RoomChannelMembersClient.add_member(e.user);
      }
    }

    if (typeof e.messages === "undefined") return;
    const { id, display_name } = e.user;
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

    rating.d = now;
    rating.p = message;
    // eslint-disable-next-line no-console
    console.log(
      `%cspam s1=${rating.score.toFixed(2)} s2=${rating.score2.toFixed(
        2
      )} ${display_name}: ${message}`,
      colorRating(rating)
    );
    if (rating.score2 >= 3 && !App.room.muted.includes(id)) {
      if (Preferences.get(P.antiSpam)) {
        App.room.mute(id);
        printTransientMessage(`AutoMute: Muted user ${display_name}.`);
      }
    }
    if (rating.score < 1 && App.room.muted.includes(id)) {
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
