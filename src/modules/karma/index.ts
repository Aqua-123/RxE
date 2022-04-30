import React from "react";
import { crel, loadCSS } from "~src/utils";
import trackKarma from "./style.scss";

const KARMA_TRACKING_INTERVAL = 60 * 1000;
// for debug perposes
// const KARMA_TRACKING_INTERVAL = 10 * 1000;
let currentKarma: number | null = null;

function updateKarma(karma: number) {
  if (karma === currentKarma) return;
  if (currentKarma !== null) {
    const delta = karma - currentKarma;
    const elt = crel("div", {
      className: `karma-delta ${delta > 0 ? "positive" : "negative"}`,
      textContent: delta > 0 ? `+${delta}` : delta
    });
    document.body.append(elt);
    // if I were using CSS animations rather than transitions
    // I wouldn't need this awkwardness.
    setTimeout(() => elt.classList.add("zoom"), 250);
    setTimeout(() => elt.remove(), 5000);
  }
  currentKarma = karma;
  const text = karma ? `Karma: ${karma}` : "";
  const karmaTracker = document.querySelector(".karma-tracker");
  if (karmaTracker) {
    karmaTracker.textContent = text;
  }
}

function fetchMyKarma() {
  const { id } = App.user;
  if (!id) {
    setTimeout(fetchMyKarma, 500);
    return;
  }
  $.ajax({
    type: "GET",
    url: `/profile_json?id=${id}`,
    dataType: "json",
    success: (e) => {
      updateKarma(e.user.karma);
    }
  });
}

function karmaOverrides() {
  const rcmSetState = RoomChannelMembers.prototype.setState;
  RoomChannelMembers.prototype.setState = function setState(e) {
    if (e && "members" in e) {
      // foreach new member, find a previous member if present, compare karma.
      e.members.forEach((member) => {
        if (!member) return;
        const oldMember = this.state.members.find(
          (memberOld) => memberOld && memberOld.id === member.id
        );
        member.delta = oldMember ? member.karma - oldMember.karma : 0;
      });
    }
    rcmSetState.call(this, e as any);
  };

  const uuBody = UserUnit.prototype.body;
  UserUnit.prototype.body = function body() {
    const jsx = uuBody.call(this);
    const user = this.props.data;
    if (user.delta < 0) {
      jsx.props.className += " down";
    }
    if (user.delta > 0) {
      jsx.props.className += " up";
    }
    return jsx;
  };
}

function updateUserRoomCount() {
  const { id } = App.user;
  if (!id) {
    setTimeout(updateUserRoomCount, 500);
    return;
  }
  if (RoomChannelMembersClient instanceof React.Component) {
    $.ajax({
      type: "GET",
      url: "channels_default",
      dataType: "json",
      success: (e) => {
        let selfUpdated = false;
        // 1. update the user count in the channel list (without reordering)
        const newTextChannels = RoomChannelSelectClient.state.text_channels.map(
          (c) => {
            const newChan = (e.text_channels as ChannelJsonResponse[]).find(
              (nc) => nc.channel.id === c.channel.id
            );
            if (newChan) {
              return {
                ...c,
                members: newChan.members
              };
            }
            return c;
          }
        );
        RoomChannelSelectClient.setState({ text_channels: newTextChannels });
        // 2. update the user list in the current channel, if any
        if (
          App.room?.id?.startsWith?.("channel") &&
          RoomChannelMembersClient instanceof React.Component
        ) {
          const channelId = +App.room.id.slice(7);
          const currentChannel = newTextChannels.find(
            (c) => c.channel.id === channelId
          );
          if (currentChannel) {
            const newMembers = [...RoomChannelMembersClient.state.members];
            currentChannel.members.forEach((member) => {
              if (!member) return;
              const idx = newMembers.findIndex((m) => m && m.id === member.id);
              if (idx > -1) {
                newMembers[idx] = member;
              } else {
                newMembers.push(member);
              }
            });
            RoomChannelMembersClient.setState({
              members: newMembers,
              overide_members: newMembers
            });
            // check if our karma is in there already
            const self = currentChannel.members.find(
              (member) => member?.id === id
            );
            if (self) {
              updateKarma(self.karma);
              selfUpdated = true;
            }
          }
        }
        // 3. fetch and update our own karma if needed
        if (!selfUpdated) {
          fetchMyKarma();
        }
      }
    });
  }
  setTimeout(updateUserRoomCount, KARMA_TRACKING_INTERVAL);
}

export function initKarmaTracker() {
  karmaOverrides();
  updateUserRoomCount();
  loadCSS(trackKarma);
}
