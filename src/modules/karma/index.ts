import React from "react";
import { crel, loadCSS } from "~src/utils";
import trackKarma from "./style.scss";

const KARMA_TRACKING_INTERVAL = 60 * 1000;

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

function fetchRoomKarma() {
  const { id } = App.user;
  if (!id) {
    setTimeout(fetchRoomKarma, 500);
    return;
  }
  if (App.room?.id?.startsWith?.("channel")) {
    const channelId = App.room.id.slice(7);
    $.ajax({
      type: "GET",
      url: `channel_json?id=${channelId}`,
      dataType: "json",
      success: (e: ChannelJsonResponse) => {
        const { members } = e;
        if (RoomChannelMembersClient instanceof React.Component) {
          // TODO: compare previous with current karma, animate something.
          RoomChannelMembersClient.setState({ members });
        }
        // if self is missing, do an extra profile fetch
        const self = members.find((member) => member.id === id);
        if (!self) {
          fetchMyKarma();
        } else {
          updateKarma(self.karma);
        }
      }
    });
  } else {
    // we're not in a public room
    fetchMyKarma();
  }
  setTimeout(fetchRoomKarma, KARMA_TRACKING_INTERVAL);
}

function karmaOverrides() {
  const rcmSetState = RoomChannelMembers.prototype.setState;
  RoomChannelMembers.prototype.setState = function setState(e) {
    if (e && "members" in e) {
      // foreach new member, find a previous member if present, compare karma.
      e.members.forEach((member) => {
        const oldMember = this.state.members.find((m) => m.id === member.id);
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

export function initKarmaTracker() {
  karmaOverrides();
  fetchRoomKarma();
  loadCSS(trackKarma);
}
