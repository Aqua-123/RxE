import React from "react";
import { fasterAppend } from "../chat/messages";
import window from "~src/browserWindow";

/**
 Apply overrides to the Room client and related objects.
 */
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
    if (action) {
      this.setState({
        print: React.createElement(MatchMenu, { data: { queue: action } })
      });
    } else if (mode === "channel") {
      this.setState({
        right_panel: true,
        left_panel: true,
        print: ""
      });
    } else if (mode === "private") {
      this.setState({
        right_panel: true,
        left_panel: true
      });
      $.ajax({
        type: "GET",
        url: `/default_private_messages?id=${this.props.data.id}`,
        dataType: "json",
        success: function join(this: Room, e: any) {
          App.room.join(this.props.data.id);
          fasterAppend.call(this, e.messages);
          this.setState({
            messages_count: e.messages_count,
            id: this.props.data.id
          });
          this.scroll();
        }.bind(this)
      });
    }
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
}
