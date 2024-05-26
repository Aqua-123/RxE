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

function CreateRoom(props: any) {
  const { type } = props || ({} as { type: string });
  const { action } = props || {};
  const { text } = props || ({} as { text: string });
  return (
    <div
      className={`channel-unit ${type}`}
      onClick={() => action()}
      onKeyPress={() => action()}
      role="button"
      tabIndex={0}
    >
      {text}
    </div>
  );
}

function wfafOverrides() {
  RoomChannelSelect.prototype.body = function rssBody() {
    // eslint-disable-next-line camelcase,react/no-this-in-sfc
    const { text_channels } = this.state;
    //  sort channels by members count
    const fixedChannels = text_channels.sort(
      (a, b) => b.members.length - a.members.length
    );
    return (
      <div className="room-component-module">
        <div className="room-user-label">text channels</div>
        {/* eslint-disable-next-line react/no-this-in-sfc */}
        {fixedChannels.map((t) => this.channel_button(t))}
        <div className="room-user-label">{T.hiddenChannels}</div>
        <CreateRoom type="wfaf" action={joinWFAF} text={T.WFAF} />
        <CreateRoom
          type="private-rooms"
          action={joinPrivateRoom}
          text={T.privateRooms}
        />
      </div>
    );
  };
}

function setupHooks() {
  const subReject = ActionCable.Subscriptions.prototype.reject;
  ActionCable.Subscriptions.prototype.reject = function reject(id) {
    if (id === App.room.client.identifier && App.room.id === specialRoom) {
      printMessage(`ERROR: You could not join room ${specialRoom || "WFAF"}`);
    }
    subReject.call(this, id);
  };
}

export function renderWFAFAndPrivateRooms() {
  wfafOverrides();
  setupHooks();
}
