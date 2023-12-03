/* eslint-disable camelcase */
import { P, Preferences } from "~src/preferences";
import {
  existing,
  getUserId,
  printTransientMessage,
  stripBiDi,
  wrapMethod
} from "~src/utils";
import { getUserInfo, strategy } from "./strategies";
import { addToFirebase } from "~src/modules/firebase/firebaseStorage";

export const GREETERS = [
  19364487, // Tessa
  19422865, // Twilight Sparkle 📚🔍🌟
  11427049, // Thea ✰
  16008266, // Lumi
  21550262, // Blue
  21541886, // Eva
  14267520 // Mecha Babe
];
/*
function colorRating(rating: SpamRating[number]) {
  if (rating.score >= 1 || rating.score2 >= 3) return "color:red";
  if (rating.score > 0.8 || rating.score2 >= 1) return "color:orange";
  return "";
}
*/

const ratings: Record<number, SpamRating> = {};
const autoMuted: Record<string, true> = {};

// todo: relocate
function updateRoomMembers({ user, user_disconnected: userLeft }: MessageData) {
  if (!("state" in RoomChannelMembersClient) || typeof user === "number")
    return;
  if (userLeft) {
    printTransientMessage(`User ${user.display_name} left the chat.`);
    return;
  }
  const id = getUserId(user);
  const { members } = RoomChannelMembersClient.state;
  if (!members.map(getUserId).includes(id))
    printTransientMessage(`User ${user.display_name} joined the chat.`);
  RoomChannelMembersClient.add_member(user);
}

function shadowBan(id: number, display_name: string) {
  $.ajax({
    url: `/shadow_ban?id=${id}`,
    type: "GET",
    success: () => {
      printTransientMessage(`Shadowbanned user ${display_name} (${id}).`);
    },
    error: () => {
      printTransientMessage(
        `Failed to shadowban user ${display_name} (${id}).`
      );
    }
  });
}

function updateMutes(rating: SpamRating, user: EmeraldUser | number) {
  const { id, displayName } = getUserInfo(user);
  const { room } = App;
  // log all ratings to console
  // log experimental ratings to console
  console.log(`[AntiSpam] ${displayName} (${id})`, rating.scoreExperimental);

  const score = rating.scoreStrikes;
  const experimentalScore = rating.scoreExperimental;
  // const legacyScore = rating.scoreLegacy;

  const isGreeter = GREETERS.includes(id);
  const isMuted = room.muted.includes(id);

  const doMute =
    !isGreeter && score >= 3 && !isMuted && Preferences.get(P.antiSpam);
  const doUnmute = score < 1 && isMuted && autoMuted[id];

  if (experimentalScore >= 10) {
    printTransientMessage(
      `AutoMute: User ${displayName} would have been muted for experimental reasons.`
    );
    console.log("User would be muted here");
    const selfUser = App.user;
    const dataToSend = {
      mod_id: selfUser.id,
      mod_display_name: selfUser.display_name,
      target_user_id: id,
      target_user_display_name: displayName,
      reason: "AutoSpam",
      lastText: rating.lastMessage
    };
    addToFirebase("experimental-moderation", dataToSend);
    // shadowBan(id, displayName);
    // return;
  }

  if (doMute) {
    if (id === App.user.id) {
      printTransientMessage(`AutoMute: You would have gotten muted`);
      console.log("User would be muted here");
      return;
    }
    autoMuted[id] = true;
    room.mute(id, displayName, "spam");
    printTransientMessage(`AutoMute: Muted user ${displayName}.`);
  }
  if (doUnmute) {
    delete autoMuted[id];
    room.unmute(id);
    printTransientMessage(`AutoMute: Unmuted user ${displayName}.`);
  }
}

function updateSpamRating(messageData: MessageData) {
  const { messages, user } = messageData;
  if (typeof messages === "undefined") return;
  const id = getUserId(user);
  const now = Date.now();

  ratings[id] = ratings[id] ?? {
    scoreLegacy: 1,
    scoreStrikes: 0,
    scoreExperimental: 1,
    lastMessageTime: 0,
    lastMessage: ""
  };

  const rating = ratings[id];

  strategy.legacy(rating, messageData);
  strategy.strikeBased(rating, messageData);
  strategy.experimental(rating, messageData);

  rating.lastMessageTime = now;
  rating.lastMessage = messages.join("");

  updateMutes(rating, user);
}

export function clearRating(user: number | EmeraldUser) {
  const id = getUserId(user);
  delete ratings[id];
}

function onMessage(messageData: MessageData) {
  if (RoomClient?.state.id == null || RoomClient?.state.mode === "private")
    return;

  const { user } = messageData;

  if (typeof user !== "number")
    // neutralize silly RTL nonsense
    user.display_name = stripBiDi(user.display_name);

  updateRoomMembers(messageData);
  updateSpamRating(messageData);
}

export function initAntiSpam() {
  // anti suicide-bombing.
  const rcsJoin = RoomChannelSelect.prototype.join;
  RoomChannelSelect.prototype.join = function join(e) {
    if (e.members) {
      e.members = existing(e.members);
    }
    rcsJoin.call(this, e);
  };
  // same idea, for RoomPrivate
  const rpSetState = RoomPrivate.prototype.setState;
  RoomPrivate.prototype.setState = function setState(state) {
    if (state && "online" in state) {
      state.online = existing(state.online);
    }
    if (state && "offline" in state) {
      state.offline = existing(state.offline);
    }
    return rpSetState.call(this, state as any);
  };

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
