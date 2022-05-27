/* eslint-disable react/no-find-dom-node */
import React, { MouseEvent } from "react";
import ReactDOM from "react-dom";
import { Preferences } from "~src/preferences";
import { PX } from "~src/x/preferences";
import window from "~src/browserWindow";
import { Spinner } from "~src/components/Spinner";
import { fasterAppend } from "../messages";

function hackOverrides() {
  if (!FEATURES.HACKS) return;

  let user = App.user || {};
  const proxyHandler = {
    get(_: EmeraldUser, prop: keyof EmeraldUser) {
      if (Preferences.get(PX?.superTemp!)) {
        if (prop === "temp") return false;
        if (prop === "karma") return 31337;
        if (prop === "_karma") return user.karma;
      }
      if (Preferences.get(PX?.enableModUI!)) {
        if (prop === "master") return true;
        if (prop === "mod") return true;
      }
      if (prop === "proxy") return true;
      return user[prop];
    }
  };

  let userProxy = new Proxy<EmeraldUser>(user, proxyHandler);
  Object.defineProperty(App, "user", {
    set: (resp) => {
      user = resp;
      userProxy = new Proxy(user, proxyHandler);
    },
    get: () => userProxy
  });

  ModPanel.prototype.componentDidMount = function componentDidMount() {
    this.setState({ tab: "default" });
  };

  // eslint-disable-next-line camelcase
  const { profile_buttons } = UserProfile.prototype;
  UserProfile.prototype.profile_buttons = function profileButtons() {
    this.state.data.friend = this.state.data.actualFriend;
    const value = profile_buttons.apply(this);
    this.state.data.friend = true;
    return value;
  };

  UpgradeAccount.prototype.signup = () => {};
}

export function domOverrides() {
  // things you should never do go here.

  // try to survive the app's poor usage of React
  const rChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(
    node: T
  ): T {
    if (node.parentElement === this) {
      return (rChild as any).call(this, node);
    }
    return node;
  };

  // potentially add more DOM methods liable to crap out in the web app
}

export function applyOverrides() {
  // avoid filling up the console with sad errors
  if (!window.MenuReactMicroStatic) {
    window.MenuReactMicroStatic = {
      close: () => MenuReactMicro?.close()
    } as MenuMicro;
  }
  if (!window.DashboardClient) {
    window.DashboardClient = {
      setState: () => {}
    };
  }

  $(window)
    .off("resize")
    .on("resize", () => {
      const resp = document.getElementById("messages");
      if (resp) resp.scrollTop = resp.scrollHeight;
    });

  /**
   * To be clear, this is not how you use React.
   * Mounting and unmounting root components should be a rare operation,
   * not something that happens on every click.
   */
  function unmountComponent(c: React.Component) {
    if (!(c as any).updater.isMounted(c)) return;
    const node = ReactDOM.findDOMNode(c);
    if (!node) return;
    ReactDOM.unmountComponentAtNode(node.parentNode as Element);
  }
  // standard function to close things
  function closeStuff(this: React.Component, component: string[]) {
    $(component[0]).removeClass("animated fadeIn");
    $(component[0]).removeClass("animated fadeOut");
    $(component[1]).addClass("animated zoomOut");
    setTimeout(unmountComponent.bind(null, this), 70);
  }

  function menuClose(this: React.Component) {
    closeStuff.call(this, [".ui-bg", ".ui-menu"]);
  }

  Menu.prototype.close = menuClose;
  UserProfile.prototype.close = function upClose() {
    closeStuff.call(this, [".ui-bg", ".user-profile-menu"]);
    setTimeout(() => {
      UserProfileReact = null;
    });
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

  // fixing friends list crashing due to deleted accounts
  FriendsMenu.prototype.componentDidMount = function cdMount() {
    $.ajax({
      type: "GET",
      url: "/friends_json",
      dataType: "json",
      success: function mountFriends(this: FriendsMenu, resp: FriendsJson) {
        const { friends } = resp;
        resp.friends = friends.filter((x) => x !== null);
        const skippedMissing = this.state.skippedMissing || 0;
        const skippedFriends = friends.filter((x) => x === null);
        this.setState({
          friends: resp.friends,
          count: resp.count,
          skippedMissing: skippedMissing + skippedFriends.length
        });
      }.bind(this)
    });
  };
  FriendsMenu.prototype.load_friends = function moreFriends() {
    const skippedMissing = this.state.skippedMissing || 0;
    const correctedCount = this.state.friends.length + skippedMissing;
    $.ajax({
      type: "GET",
      url: `/load_friends_json?offset=${correctedCount}`,
      dataType: "json",
      success: function loadFriends(
        this: FriendsMenu,
        friendsList: EmeraldUser[]
      ) {
        if (friendsList.length === 0) return;
        const skippedFriends = friendsList.filter((x) => x === null);
        const list = friendsList.filter((x) => !skippedFriends.includes(x));
        const state = {
          skippedMissing: skippedMissing + skippedFriends.length,
          search: [],
          friends: [...this.state.friends, ...list],
          count: this.state.count
        };
        this.setState(state);
      }.bind(this)
    });
  };

  function menuMicroClose(this: React.Component) {
    closeStuff.call(this, ["#menu-micro-bg", "#menu-micro"]);
  }
  MenuMicro.prototype.close = menuMicroClose;
  MenuMicroStatic.prototype.close = menuMicroClose;

  UserView.prototype.close = function close() {
    document.removeEventListener("mousedown", this.exit_click, false);
    unmountComponent(this);
  };
  UserView.prototype.view_profile = function viewProfile() {
    const { id } = this.state.user;
    if (UserProfileReact) {
      UserProfileReact.switch(id);
    } else {
      ReactDOM.render(
        React.createElement(UserProfile, {
          key: id,
          id
        }),
        document.getElementById("ui-hatch")
      );
    }
    unmountComponent(this);
  };

  function popupClose(this: React.Component, resp: MouseEvent) {
    unmountComponent(this);
    // todo: this doesn't work oof
    resp.nativeEvent.stopImmediatePropagation();
  }

  Popup.prototype.close = popupClose;
  Picture.prototype.close = popupClose;
  UserView.prototype.exit_click = function exitClick(resp) {
    if (!(resp.target instanceof HTMLElement)) return;
    if (!resp.target.matches(".user-profile-micro, .user-profile-micro *"))
      this.close();
  };

  UserProfile.prototype.componentDidMount = function profileMount() {
    $.ajax({
      type: "GET",
      url: `/profile_json?id=${this.props.id}`,
      dataType: "json",
      success: (resp: ProfileData) => this.setState({ data: resp }),
      error: () => this.close()
    });
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
  // non-hack: "Sign up to continue" only shows once at start
  App.temp.check = () => {};
  // increase the lower limit of karma
  App.karma.data[0].range[1] = -Infinity;

  // Allow more messages in group chat. (make configurable?)
  // const rTrim = Room.prototype.trim_messages;
  Room.prototype.trim_messages = function trimMessages() {
    const max = this.state.mode === "channel" ? 100 : 5000;
    const { messages } = this.state;
    if (messages.length > max) messages.shift();
    this.setState({ messages });
  };
  const isPostedOnSelf = (content: string) => {
    const regex = /posted on your profile.*/g;
    return regex.test(content);
  };
  const likedComment = (content: string) => {
    const regex = /liked your comment.*/g;
    return regex.test(content);
  };

  NotificationUnit.prototype.action = function action(event: _MouseEvent) {
    const { target } = event;
    if (!(target instanceof Node)) return;
    const acTarget = target instanceof Element ? target : target.parentElement;
    if (!acTarget) return;
    if (acTarget.matches(".notification-button, .notification-button *"))
      return;
    const notification = this.props.data;

    let sender = notification.data.sender ?? notification.data.user;
    const { content } = notification.data;
    // No unit means no post to open the profile for.
    // Just show a UserView.
    if (isPostedOnSelf(content) || likedComment(content)) {
      sender = notification.data.user;
    }
    if (
      !("unit" in notification.data) ||
      notification.tier === "friend_request"
    ) {
      if (!sender)
        console.error("Could not get notification user for UserView.");
      else UserViewGenerator.generate({ event, user: sender });
      return;
    }

    // Tell app UI code which post to highlight.
    if ("unit" in notification.data) App.params = notification.data.unit;

    let id =
      notification.data.unit?.post.author_id ??
      notification.data.unit?.comment.author_id ??
      notification.data.sender.id;

    if (isPostedOnSelf(content) || likedComment(content)) {
      id = notification.data.user.id;
    }
    // Reload or open UserProfile.
    if (UserProfileReact) UserProfileReact.load(id);
    const userProfile = React.createElement(UserProfile, { id });
    ReactDOM.render(userProfile, document.getElementById("ui-hatch"));
  };

  /*
  Microposts.prototype.render = function render () {
        const micropostIds: number[] = this.state.data?.microposts ?? [];
        
	// const highlightedId = (App.params?.post as (WallPost | undefined))?.id;
                
        let className = 'user-microposts';
        
	// you can detect the presence of a highlighted ID
	// however, it's always inserted at the start
	// and that doesn't tell you whether it exists
                
        const microposts = React.createElement('div', {
          className
        }, micropostIds.map(function (id) {
          return React.createElement(Micropost, {
            key: id,
            data: { id }
            // higlight: ...
            // you could pass highlight as a prop 
            // (and then clear the id to match only once)
            // but you'll have to paste the whole the render function
            // or figure out a way to change the className after
            // receiving a render()'d element.
          })
        }));
        
        const input = React.createElement('div', {
          className: 'user-micropost-input-background'
        }, React.createElement('input', {
          className: 'user-micropost-input',
          onKeyDown: this.micropost_input.bind(this),
          placeholder: 'Post something...'
        }));
        
        return React.createElement('span', {
          key: this.props.data.wall_id
        }, input, microposts)
  }
*/

  Flair.prototype.render = function render() {
    const {
      data: { flair, string: name },
      onClick
    } = this.props;
    return React.createElement(
      "span",
      {
        className: "user-flair",
        style: flair ?? { color: "" },
        onClick
      },
      name
    );
  };

  UserProfile.prototype.render = function render() {
    const content = this.state.data
      ? [this.top(), this.bottom()]
      : [React.createElement(Spinner)];
    return React.createElement(
      "div",
      { className: "ui-menu-container" },
      React.createElement("div", {
        onMouseDown: this.close.bind(this),
        className: "animated fadeIn ui-bg"
      }),
      React.createElement(
        "div",
        { className: "animated zoomIn user-profile-menu" },
        ...content
      )
    );
  };
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
  if (FEATURES.HACKS) hackOverrides();
}
