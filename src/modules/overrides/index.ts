/* eslint-disable react/no-find-dom-node */
/* eslint-disable */
import React, { MouseEvent, ReactInstance } from "react";
import ReactDOM from "react-dom";
import { Preferences } from "~src/preferences";
import { PX } from "~src/x/preferences";
import window from "~src/browserWindow";
import { Spinner } from "~src/components/Spinner";

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
    set: (e) => {
      user = e;
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
      var e = document.getElementById("messages");
      if (e) e.scrollTop = e.scrollHeight;
    });

  /**
   * To be clear, this is not how you use React.
   * Mounting and unmounting root components should be a rare operation,
   * not something that happens on every click.
   */
  function unmountComponent(c: React.Component) {
    if ((c as any).updater.isMounted(c)) {
      const node = ReactDOM.findDOMNode(c);
      if (node) {
        ReactDOM.unmountComponentAtNode(node.parentNode as Element);
      }
    }
  }

  function menuClose(this: React.Component) {
    $(".ui-bg").removeClass("animated fadeIn");
    $(".ui-bg").addClass("animated fadeOut");
    $(".ui-menu").addClass("animated zoomOut");
    setTimeout(unmountComponent.bind(null, this), 250);
  }

  Menu.prototype.close = menuClose;
  UserProfile.prototype.close = function upClose() {
    $(".ui-bg").removeClass("animated fadeIn");
    $(".ui-bg").addClass("animated fadeOut");
    $(".user-profile-menu").addClass("animated zoomOut");
    setTimeout(unmountComponent.bind(null, this), 250);
    setTimeout(() => {
      UserProfileReact = null;
    });
  };

  RoomChannelSelect.prototype.join = function (this: Room, e) {
    console.log("joined strangers", e),
      e.members.length >= 10000000 ||
        (App.webrtc.client && this.voice_disconnect(),
        this.expand(!1),
        RoomClient?.setState({
          messages: []
        }),
        (Room.prototype.updated = function (this: Room) {
          this.setState({
            current_channel: e.channel
          }),
            $.ajax({
              type: "GET",
              url: "channel_json?id=" + e.channel.id,
              dataType: "json",
              success: function (e: ChannelJsonResponse) {
                console.log("loading chat", e),
                  RoomChannelMembersClient.setState({
                    members: e.members
                  });
                for (var t = 0; t < e.messages.length; t++)
                  RoomClient?.append(e.messages[t]);
                RoomClient?.scroll();
              }.bind(this)
            }),
            App.room.join("channel" + e.channel.id),
            setTimeout(function () {
              RoomClient?.scroll();
            }, 0),
            "voice" == e.channel.channel_type && this.voice_connect(e);
        }.bind(this)),
        RoomClient?.updated(),
        (Room.prototype.updated = function () {}));
  };

  //fixing friends list crashing due to deleted accounts
  FriendsMenu.prototype.componentDidMount = function () {
    $.ajax({
      type: "GET",
      url: "/friends_json",
      dataType: "json",
      success: function (this: FriendsMenu, e: any) {
        console.log(e);
        var obj = e.friends;
        e.friends = obj.filter((x: []) => x !== null);
        this.setState(e);
      }.bind(this)
    });
  };
  FriendsMenu.prototype.load_friends = function (this: FriendsMenu) {
    $.ajax({
      type: "GET",
      url: "/load_friends_json?offset=" + this.state.friends.length,
      dataType: "json",
      success: function (this: any, e: []) {
        var list = e.filter((x) => x !== null);
        var state = {
          search: [],
          friends: this.state.friends.concat(list),
          count: this.state.count
        };
        this.setState(state);
      }.bind(this)
    });
  };

  function menuMicroClose(this: React.Component) {
    $("#menu-micro-bg").removeClass("animated fadeIn");
    $("#menu-micro-bg").addClass("animated fadeOut");
    $("#menu-micro").addClass("animated zoomOut");
    setTimeout(unmountComponent.bind(null, this), 250);
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

  function popupClose(this: React.Component, e: MouseEvent) {
    unmountComponent(this);
    // todo: this doesn't work oof
    e.nativeEvent.stopImmediatePropagation();
  }

  Popup.prototype.close = popupClose;
  Picture.prototype.close = popupClose;

  UserProfile.prototype.componentDidMount = function profileMount() {
    $.ajax({
      type: "GET",
      url: `/profile_json?id=${this.props.id}`,
      dataType: "json",
      success: (e) => {
        this.setState({
          data: e
        });
      },
      error: () => {
        this.close();
      }
    });
  };

  // non-hack: "Sign up to continue" only shows once at start
  App.temp.check = () => {};

  // Allow more messages in group chat. (make configurable?)
  // const rTrim = Room.prototype.trim_messages;
  Room.prototype.trim_messages = function trimMessages() {
    const max = this.state.mode === "channel" ? 100 : 5000;
    const { messages } = this.state;
    if (messages.length > max) messages.shift();
    this.setState({ messages });
  };

  NotificationUnit.prototype.action = function action(event: _MouseEvent) {
    const node = ReactDOM.findDOMNode(this) as Element;
    const { target } = event;
    if (!(target instanceof Node)) return;
    let acTarget = target instanceof Element ? target : target.parentElement;
    if (!acTarget) return;
    if (acTarget.matches(".notification-button, .notification-button *"))
      return;
    const notification = this.props.data;

    const sender = notification.data.sender ?? notification.data.user;

    // No unit means no post to open the profile for.
    // Just show a UserView.
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

    const id =
      notification.data.unit?.post.author_id ??
      notification.data.unit?.comment.author_id ??
      notification.data.sender.id;

    // Reload or open UserProfile.
    if (UserProfileReact) return UserProfileReact.load(id);
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
        onClick: onClick
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
      {
        className: "ui-menu-container"
      },
      React.createElement("div", {
        onMouseDown: this.close.bind(this),
        className: "animated fadeIn ui-bg"
      }),
      React.createElement(
        "div",
        {
          className: "animated zoomIn user-profile-menu"
        },
        ...content
      )
    );
  };

  if (FEATURES.HACKS) hackOverrides();
}
