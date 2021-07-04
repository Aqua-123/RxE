// open WFAF: RoomClient.switch({id:null, mode:'private'})
import React from "react";
import { crel, printMessage } from "~src/utils";
import T from "~src/text";

let specialRoom: string;

function joinSpecialRoom(name: string, selector: string) {
  if (!("setState" in RoomChannelMembersClient)) return;
  RoomClient.setState({ messages: [], current_channel: name });
  RoomChannelMembersClient.setState({ members: [] });
  App.room.join(name);
  document
    .querySelectorAll(".channel-unit")
    .forEach((channel) => channel.classList.remove("channel-unit-active"));
  document.querySelector(selector)?.classList.add("channel-unit-active");
  RoomClient.print(React.createElement("div", null, T.privateRoomsWarning));
  specialRoom = name;
}

function joinWFAF() {
  // don't try to join wfaf if you're alredy in. it doesn't work well.
  if (document.querySelector(".wfaf.channel-unit-active")) return;
  // base WFAF: RoomClient.switch({ id: null, mode: "private"})
  joinSpecialRoom("", ".wfaf");
}

function joinPrivateRoom() {
  // eslint-disable-next-line no-alert
  const name = prompt(T.privateRoomsPrompt);
  if (name == null) return;
  joinSpecialRoom(name, ".private-rooms");
}

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

  // setup hooks
  const subReject = ActionCable.Subscriptions.prototype.reject;
  ActionCable.Subscriptions.prototype.reject = function reject(id) {
    if (id === App.room.client.identifier && App.room.id === specialRoom) {
      printMessage(`ERROR: You could not join room ${specialRoom || "WFAF"}`);
    }
    subReject.call(this, id);
  };
}
