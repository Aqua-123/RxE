/* eslint-disable camelcase */
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

  RoomChannelSelect.prototype.joinStartingChannel =
    function RCSJoinStartingChannel(_channels) {
      console.log("joinStartingChannel");
      if (App.user.activated) {
        const maxMembers = 100;

        // Sort channels: Anonymous at top, others by member count
        let channels = _channels.sort((a, b) => {
          if (a.channel.name === "Anonymous") return -1;
          if (b.channel.name === "Anonymous") return 1;
          return b.members.length - a.members.length;
        });

        // Try to join a suitable channel
        for (let i = 0; i < channels.length; i += 1) {
          const channel = channels[i];
          if (
            channel.channel.name !== "Anonymous" &&
            channel.members.length > 0 &&
            channel.members.length < maxMembers
          ) {
            this.join(channel);
            return;
          }
        }

        // If no suitable channel found, join a random channel
        channels = channels.sort(() => Math.random() - 0.5);
        this.join(channels[0]);
      } else {
        // Sort with Anonymous channels at top, then by member count
        const channels = _channels.sort((a, b) => {
          if (a.channel.name === "Anonymous") return -1;
          if (b.channel.name === "Anonymous") return 1;
          return b.members.length - a.members.length;
        });

        // Join the first Anonymous channel found
        const anonymousChannel = channels.find(
          (channel) => channel.channel.name === "Anonymous"
        );
        if (anonymousChannel) {
          this.join(anonymousChannel);
        }
      }
    };

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
