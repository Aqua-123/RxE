// open WFAF: RoomClient.switch({id:null, mode:'private'})
import React from "react";
import { printMessage } from "~src/utils";
import T from "~src/text";

let specialRoom: string;

function joinSpecialRoom(name: string, selector: string) {
  if (!("setState" in RoomChannelMembersClient)) return;
  RoomClient?.setState({ messages: [], current_channel: name });
  RoomChannelMembersClient.setState({ members: [] });
  App.room.join(name);
  document
    .querySelectorAll(".channel-unit")
    .forEach((channel) => channel.classList.remove("channel-unit-active"));
  document.querySelector(selector)?.classList.add("channel-unit-active");
  RoomClient?.print(<div>{T.privateRoomsWarning}</div>);
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

function wfafOverrides() {
  RoomChannelSelect.prototype.body = function rssBody() {
    // eslint-disable-next-line camelcase,react/no-this-in-sfc
    const { text_channels } = this.state;
    return (
      <div className="room-component-module">
        <div className="room-user-label">text channels</div>
        {/* eslint-disable-next-line react/no-this-in-sfc */}
        {text_channels.map((t) => this.channel_button(t))}
        <div className="room-user-label">{T.hiddenChannels}</div>
        <div
          className="wfaf channel-unit"
          onClick={() => joinWFAF()}
          onKeyPress={() => joinWFAF()}
          role="button"
          tabIndex={0}
        >
          {T.WFAF}
        </div>
        <div
          className="private-rooms channel-unit"
          onClick={() => joinPrivateRoom()}
          onKeyPress={() => joinPrivateRoom()}
          role="button"
          tabIndex={0}
        >
          {T.privateRooms}
        </div>
      </div>
    );
  };
}

export function renderWFAFAndPrivateRooms() {
  wfafOverrides();

  // setup hooks
  const subReject = ActionCable.Subscriptions.prototype.reject;
  ActionCable.Subscriptions.prototype.reject = function reject(id) {
    if (id === App.room.client.identifier && App.room.id === specialRoom) {
      printMessage(`ERROR: You could not join room ${specialRoom || "WFAF"}`);
    }
    subReject.call(this, id);
  };
}
