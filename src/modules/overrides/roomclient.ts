import React from "react";
import { fasterAppend } from "~src/modules/chat/messages";
import window from "~src/browserWindow";
import { stripBiDi } from "~src/utils";
/**
 Apply overrides to the Room client and related objects.
 */

function mountChannel(this: Room) {
  this.setState({
    right_panel: true,
    left_panel: true,
    print: ""
  });
}

function joinPrivateRoom(this: Room, e: any) {
  App.room.join(this.props.data.id);
  fasterAppend.call(this, e.messages);
  this.setState({
    messages_count: e.messages_count,
    id: this.props.data.id
  });
  this.scroll();
}

function mountPrivate(this: Room) {
  mountChannel.call(this);
  $.ajax({
    type: "GET",
    url: `/default_private_messages?id=${this.props.data.id}`,
    dataType: "json",
    success: joinPrivateRoom.bind(this)
  });
}

function mountMatchMenu(this: Room, action: string) {
  this.setState({
    print: React.createElement(MatchMenu, { data: { queue: action } })
  });
}

export function roomclientOverrides() {
  const stateObj = {
    match: "text",
    match_video: "video",
    match_voice: "voice",
    channel: "",
    private: ""
  };

  Room.prototype.componentDidMount = function componentDidMount() {
    this.clear_print();
    const { mode } = this.state;
    const action = stateObj[mode];
    if (action) mountMatchMenu.call(this, action);
    else if (mode === "channel") mountChannel.call(this);
    else if (mode === "private") mountPrivate.call(this);
  };

  Room.prototype.trim_messages = function trimMessages() {
    const max = this.state.mode === "channel" ? 100 : 5000;
    const { messages } = this.state;
    if (messages.length > max) messages.shift();
    this.setState({ messages });
  };
  Room.prototype.start_typing = function startTyping(inputUser) {
    if (inputUser.id === App.user.id) return;
    // get name from RoomChannelMembers persistent state
    let name: string | undefined;
    name = RoomChannelMembersClient.state.members.find(
      (user) => user?.id === inputUser.id
    )?.display_name;
    if (!name) name = inputUser.display_name;
    this.setState({ typing: name });
    window.typing_timer = setTimeout(() => {
      this.stop_typing();
    }, 1e4);
  };
  function rpUpdated(this: Room, resp: ChannelJsonResponse) {
    const { channel } = resp;
    this.setState({ current_channel: channel });
    if (channel.channel_type === "voice") this.voice_connect(resp);
    RoomClient?.clear_messages();
    $.ajax({
      type: "GET",
      url: `channel_json?id=${channel.id}`,
      dataType: "json",
      success(channelresp) {
        const { messages } = channelresp;
        RoomChannelMembersClient.setState({ members: channelresp.members });
        if (RoomClient) fasterAppend.call(RoomClient, messages);
        RoomClient?.scroll();
      }
    });
    App.room.join(`channel${channel.id}`);
    RoomClient!.state.last_message = null;
    RoomClient?.scroll();
  }

  RoomChannelSelect.prototype.join = function rpJoin(
    this: Room,
    channelResponse
  ) {
    if (App.webrtc.client) this.voice_disconnect();
    this.expand(!1);
    this.setState({ messages: [] });
    // eslint-disable-next-line no-shadow
    this.updated = rpUpdated.bind(this);
    this.updated(channelResponse);
    this.updated = function doNothing() {};
  };
  Room.prototype.start_typing = function st(e) {
    if (e.id === App.user.id) return;
    this.setState({
      typing: stripBiDi(e.display_name)
    });
    window.typing_timer = setTimeout(() => {
      this.stop_typing();
    }, 1e4);
  };
}
