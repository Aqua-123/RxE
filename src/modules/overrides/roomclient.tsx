/* eslint-disable camelcase */
import React from "react";
import ReactDOM from "react-dom";
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

  const pvtUserId = this.props.data.sender;

  // Fetch messages and user profile in parallel
  Promise.all([
    $.ajax({
      type: "GET",
      url: `/default_private_messages?id=${this.props.data.id}`,
      dataType: "json"
    }),
    $.ajax({
      type: "GET",
      url: `/profile_json?id=${pvtUserId}`,
      dataType: "json"
    })
  ])
    .then(([messagesResp, userResp]) => {
      this.setState({ privateUser: userResp.user });
      joinPrivateRoom.call(this, messagesResp);
    })
    .catch(() => {
      this.setState({ privateUser: null });
    });
}
RoomUserUnit.prototype.message = function message() {
  $.ajax({
    type: "GET",
    url: `/message_user?id=${this.props.data.id}`,
    dataType: "json",
    success: (response) => {
      if (!response) return;

      // Close all open menus
      MenuReactMicro?.close();
      MenuReact?.close();
      UserProfileReact?.close();

      RoomClient?.setState({
        privateRoomState: response
      });

      // Generate new private room
      RoomGenerator.generate({
        id: response.room_id,
        mode: "private",
        sender: response.friend_id
      });
    }
  });
};

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
    private_video: "video",
    channel: "",
    private: ""
  };

  RoomGenerator.generate = function generate(params): void {
    if (RoomClient) {
      RoomClient.switch({
        id: params.id,
        // @ts-ignore
        mode: params.mode,
        pvtUserId: params.sender
      });
    } else {
      ReactDOM.render(
        React.createElement(Room, {
          data: {
            id: params.id,
            // @ts-ignore
            mode: params.mode,
            partner: params.partner,
            sender: params.sender
          }
        }),
        document.getElementById("container")
      );
    }
  };
  UserView.prototype.message = function message(type: "message" | "video") {
    $.ajax({
      type: "GET",
      url: `/message_user?id=${this.state.user.id}`,
      dataType: "json",
      success: (response: { confirmed?: boolean; room_id?: string }) => {
        this.close();
        MenuReactMicro?.close();
        MenuReact?.close();
        UserProfileReact?.close();

        if (response?.confirmed) {
          RoomGenerator.generate({
            id: Number(response.room_id),
            mode: type === "message" ? "private" : "private_video",
            partner: this.state.user,
            sender: this.state.user.id
          });
        } else {
          const component = (
            <MenuMicro>
              {type === "message" ? "MESSAGE" : "VIDEO CALL"}
              <br />
              <br />
              <div className="m1">
                <span>
                  you need to be friends to{" "}
                  {type === "message" ? "send a message to" : "call"} this
                  person
                </span>
                {response ? (
                  <div>
                    <div className="ui-button-micro">
                      <span className="ui-button-mega-icon material-icons">
                        check
                      </span>{" "}
                      Friend Request Sent
                    </div>
                    <div
                      onMouseDown={this.cancel_friend_request.bind(this)}
                      className="ui-button-micro"
                      role="button"
                      tabIndex={0}
                    >
                      <span className="ui-button-mega-icon material-icons">
                        close
                      </span>
                      Cancel
                    </div>
                  </div>
                ) : (
                  <div
                    onMouseDown={this.send_friend_request.bind(this)}
                    style={{ marginTop: "20px" }}
                    role="button"
                    tabIndex={0}
                    className="ui-button-micro"
                  >
                    {" "}
                    <span className="ui-button-mega-icon material-icons">
                      add
                    </span>{" "}
                    Send Friend Request
                  </div>
                )}
              </div>
              <div className="ui-menu-buttons">
                <div
                  onMouseDown={() => {
                    MenuReactMicro?.close();
                  }}
                  role="button"
                  tabIndex={0}
                  className="ui-button-text"
                >
                  Close
                </div>
              </div>
            </MenuMicro>
          );

          ReactDOM.render(component, document.getElementById("ui-hatch-2"));
        }
      }
    });
  };

  MessageNotificationUnit.prototype.open_room = function openRoom() {
    // Close all open menus
    MenuReactMicro?.close();
    MenuReact?.close();
    UserProfileReact?.close();
    // Generate new room
    RoomGenerator.generate({
      id: this.props.data.data.room_id,
      mode: this.props.data.data.mode,
      partner: this.props.data.data.user,
      sender: this.props.data.sender_id
    });
  };

  Room.prototype.componentDidMount = function componentDidMount() {
    this.clear_print();
    const { mode } = this.state;
    const action = stateObj[mode];
    if (action) mountMatchMenu.call(this, action);
    else if (mode === "channel") mountChannel.call(this);
    else if (mode === "private") mountPrivate.call(this);
  };

  // Fuck ads
  Room.prototype.ads = function ads() {};
  Room.prototype.amazon_ads = function amazonAds() {};

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
