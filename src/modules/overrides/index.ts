/* eslint-disable react/no-find-dom-node */
import React from "react";
import ReactDOM from "react-dom";
import { P, Preferences } from "~src/preferences";
import window from "~src/browserWindow";

function hackOverrides() {
  if (!FEATURES.HACKS) return;

  let user = App.user || {};
  const proxyHandler = {
    get(_: EmeraldUser, prop: keyof EmeraldUser) {
      if (Preferences.get(P.superTemp!)) {
        if (prop === "temp") return false;
        if (prop === "karma") return 31337;
        if (prop === "_karma") return user.karma;
      }
      if (Preferences.get(P.enableModUI!)) {
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

  Menu.prototype.close = function close() {
    $(".ui-bg").removeClass("animated fadeIn");
    $(".ui-bg").addClass("animated fadeOut");
    $(".ui-menu").addClass("animated zoomOut");
    setTimeout(unmountComponent.bind(null, this), 250);
  };

  function menuClose(this: React.Component) {
    $("#menu-micro-bg").removeClass("animated fadeIn");
    $("#menu-micro-bg").addClass("animated fadeOut");
    $("#menu-micro").addClass("animated zoomOut");
    setTimeout(unmountComponent.bind(null, this), 250);
  }
  MenuMicro.prototype.close = menuClose;
  MenuMicroStatic.prototype.close = menuClose;

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

  function popupClose(this: React.Component) {
    unmountComponent(this);
  }

  Popup.prototype.close = popupClose;
  Picture.prototype.close = popupClose;

  // non-hack: "Sign up to continue" only shows once at start
  App.temp.check = () => {};

  // For some reason, pictures we send don't render for ourselves initially.
  // Setting e.messages to [""] fixes that, although I don't know why yet.
  const rAppend = Room.prototype.append;
  Room.prototype.append = function append(e) {
    if (e.messages.length === 0) e.messages.push("");
    rAppend.call(this, e);
  };

  // Allow more messages in group chat. (make configurable?)
  // const rTrim = Room.prototype.trim_messages;
  Room.prototype.trim_messages = function trimMessages() {
    const max = this.state.mode === "channel" ? 100 : 5000;
    const { messages } = this.state;
    if (messages.length > max) messages.shift();
    this.setState({ messages });
  };

  // bring image upload button back (even though the server is preventing sending them now.)
  // const rInput = Room.prototype.room_input;
  Room.prototype.room_input = function roomInput() {
    return React.createElement(
      "div",
      {
        className: "room-component-input"
      },
      React.createElement("textarea", {
        className: "room-component-input-textarea",
        onMouseDown: this.scroll,
        onKeyDown: this.input.bind(this),
        id: "room-input",
        placeholder: "Say Something..."
      }),
      React.createElement(
        "span",
        {
          onMouseDown: this.upload_picture.bind(this),
          className: "room-component-input-icon material-icons"
        },
        "photo_camera"
      )
    );
  };

  // Fix "load more" link in profile pictures
  PictureAlbum.prototype.load_pictures = function loadPictures() {
    const load = 7;
    $.ajax({
      type: "GET",
      url: `/pictures_load_more?id=${this.state.album.id}&loaded=${this.state.pictures.length}&load_count=${load}`,
      dataType: "json",
      success: function success(
        this: PictureAlbum,
        e: { pictures: EmeraldPicture[] }
      ) {
        const pictures = this.state.pictures.concat(e.pictures);
        this.setState({
          pictures
        });
      }.bind(this)
    });
  };

  if (FEATURES.HACKS) hackOverrides();
}
