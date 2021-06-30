// open WFAF: RoomClient.switch({id:null, mode:'private'})
import { crel } from "~src/utils";
import T from "~src/text";
import React from "react";

export function renderWFAFAndPrivateRooms() {
  const channels = document.querySelectorAll(".channel-unit");
  if (!channels.length) return;
  const lastChannel = channels[channels.length - 1];
  if (lastChannel.textContent === T.privateRooms) return;
  const hiddenChannels = crel("div", {
    className: "room-user-label",
    textContent: T.hiddenChannels
  });
  const wfafButton = crel("div", {
    className: "wfaf channel-unit",
    textContent: T.WFAF,
    onclick: () => joinWFAF()
  });
  const privateButton = crel("div", {
    className: "private-rooms channel-unit",
    textContent: T.privateRooms,
    onclick: () => joinPrivateRoom()
  });
  const parent = lastChannel.parentElement!;
  parent.insertBefore(privateButton, lastChannel.nextSibling);
  parent.insertBefore(wfafButton, privateButton);
  parent.insertBefore(hiddenChannels, wfafButton);
}

function joinSpecialRoom(name: string | null, selector: string) {
  RoomClient.setState({ messages: [], current_channel: name });
  RoomChannelMembersClient.setState({ members: [] });
  App.room.join(name);
  document
    .querySelectorAll(".channel-unit")
    .forEach((channel) => channel.classList.remove("channel-unit-active"));
  document.querySelector(selector)?.classList.add("channel-unit-active");
  RoomClient.print(React.createElement("div", null, T.privateRoomsWarning));
}

function joinWFAF() {
  // don't try to join wfaf if you're alredy in. it doesn't work well.
  if (document.querySelector(".wfaf.channel-unit-active")) return;
  // base WFAF: RoomClient.switch({ id: null, mode: "private"})
  joinSpecialRoom("", ".wfaf");
}

function joinPrivateRoom() {
  const name = prompt(T.privateRoomsPrompt);
  if (name == null) return;
  joinSpecialRoom(name, ".private-rooms");
}
