import React from "react";
import { crel, existing, formatSignedAmount, loadCSS } from "~src/utils";
import trackKarma from "./style.scss";
import browserWindow from "~src/browserWindow";

const KARMA_TRACKING_INTERVAL = 60 * 1000;

let currentKarma: number | null = null;

// preventive measure for people crashing gcs
function attemptKick(data: any) {
  if (data.status !== 500) return;
  if (App.room) App.room.leave(App.room.id);
  browserWindow.location.href = "/";
}

function showKarmaChange(change: number) {
  const elt = crel("div", {
    className: `karma-delta ${change > 0 ? "positive" : "negative"}`,
    textContent: formatSignedAmount(change)
  });
  document.body.append(elt);
  // if I were using CSS animations rather than transitions
  // I wouldn't need this awkwardness.
  setTimeout(() => elt.classList.add("zoom"), 250);
  setTimeout(() => elt.remove(), 5000);
}

function updateKarma(karma: number) {
  if (karma === currentKarma) return;
  if (currentKarma !== null) showKarmaChange(karma - currentKarma);
  currentKarma = karma;
  const karmaTracker = document.querySelector(".karma-tracker");
  if (!karmaTracker) return;
  karmaTracker.textContent = karma ? `Karma: ${karma}` : "";
}

function refreshKarma() {
  const { id } = App.user;

  if (!id) {
    setTimeout(refreshKarma, 500);
    return;
  }

  $.ajax({
    type: "GET",
    url: `/profile_json?id=${id}`,
    dataType: "json",
    success: (e: ProileJson) => updateKarma(e.user.karma),
    error: (e) => attemptKick(e)
  });
}

function computeUserDelta(
  oldUser: EmeraldUser | undefined,
  newUser: EmeraldUser
) {
  if (oldUser) newUser.delta = newUser.karma - oldUser.karma;
  else newUser.delta = 0;
}

function computeUserDeltas(
  oldUsers: (EmeraldUser | null)[],
  newUsers: (EmeraldUser | null)[]
) {
  const oldUsersAll = existing(oldUsers);
  existing(newUsers).forEach((newUser) => {
    const oldUser = oldUsersAll.find(({ id }) => id === newUser.id);
    computeUserDelta(oldUser, newUser);
  });
}

function karmaOverrides() {
  const rcmSetState = RoomChannelMembers.prototype.setState;

  // Set karma delta values based on a change from the previous state.
  RoomChannelMembers.prototype.setState = function setState(newState) {
    if (newState && "members" in newState) {
      computeUserDeltas(this.state.members, newState.members);
    }
    rcmSetState.call(this, newState as any);
  };

  // Set styling to channel members whose karma is changing.
  const uuBody = UserUnit.prototype.body;
  UserUnit.prototype.body = function body() {
    const userUnit = uuBody.call(this);
    const user = this.props.data;
    if (user.delta < 0) {
      userUnit.props.className += " down";
    }
    if (user.delta > 0) {
      userUnit.props.className += " up";
    }
    return userUnit;
  };
}

function updateChannelSelectUsers(
  channels: ChannelJsonResponse[]
): ChannelJsonResponse[] {
  return RoomChannelSelectClient.state.text_channels.map((oldChannel) => {
    const newChannel = channels.find(
      ({ channel }) => channel.id === oldChannel.channel.id
    );
    if (!newChannel) return oldChannel;
    const { members } = newChannel;
    return {
      ...oldChannel,
      members
    };
  });
}

// Ideally prevents persistent state from being lost
// when new data is fetched.
function updatePersistentState(newMembers: EmeraldUser[]) {
  // update only members with ids not in the persistent state
  const persistentMembers =
    RoomChannelMembersClient.state.members_persistent || [];
  const newPersistentMembers = newMembers.filter(
    (member) => !persistentMembers.find((m) => m?.id === member.id)
  );
  const newState = [...persistentMembers, ...newPersistentMembers];
  // Remove old members from persistent state if too large
  if (newState.length > 100) {
    newState.splice(0, newState.length - 100);
  }
  return newState;
}

/** Returns a boolean indicating whether the current user was updated. */
function updateCurrentChannelUsers(channels: ChannelJsonResponse[]): boolean {
  if (!App.room?.id?.startsWith?.("channel")) return false;
  if (!(RoomChannelMembersClient instanceof React.Component)) return false;

  const channelId = +App.room.id.slice(7);
  const currentChannel = channels.find(
    ({ channel }) => channel.id === channelId
  );

  if (!currentChannel) return false;

  const newMembers = existing(RoomChannelMembersClient.state.members);

  // Replace or add new members
  existing(currentChannel.members).forEach((oldMember) => {
    const newPosition = newMembers.findIndex(({ id }) => id === oldMember.id);
    if (newPosition > -1) newMembers[newPosition] = oldMember;
    else newMembers.push(oldMember);
  });
  const persistentState = updatePersistentState(newMembers);
  RoomChannelMembersClient.setState({
    members: newMembers,
    members_persistent: persistentState
  });
  // check if our karma is in there already
  const self = currentChannel.members.find(
    (member) => member?.id === App.user.id
  );
  if (self) {
    updateKarma(self.karma);
    return true;
  }
  return false;
}

// eslint-disable-next-line camelcase
function updateChannelInfo(data: { text_channels: ChannelJsonResponse[] }) {
  // 1. update the user count in the channel list (without reordering)
  const newTextChannels = updateChannelSelectUsers(data.text_channels);
  RoomChannelSelectClient.setState({ text_channels: newTextChannels });

  // 2. update the user list in the current channel, if any
  const selfUpdated = updateCurrentChannelUsers(newTextChannels);

  // 3. fetch and update our own karma if needed
  if (!selfUpdated) {
    refreshKarma();
  }
}

function refreshChannelInfo() {
  const { id } = App.user;
  if (!id) {
    setTimeout(refreshChannelInfo, 500);
    return;
  }

  setTimeout(refreshChannelInfo, KARMA_TRACKING_INTERVAL);

  if (!(RoomChannelMembersClient instanceof React.Component)) return;

  $.ajax({
    type: "GET",
    url: "channels_default",
    dataType: "json",
    success: updateChannelInfo,
    error: attemptKick
  });
}

export function initKarmaTracker() {
  karmaOverrides();
  refreshChannelInfo();
  loadCSS(trackKarma);
}
