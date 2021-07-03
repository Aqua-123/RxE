import React from "react";
import ReactDOM from "react-dom";
import { P, Preferences } from "~src/preferences";

export function applyOverrides() {
  // avoid filling up the console with sad errors
  if (!MenuReactMicroStatic) {
    (window as any).MenuReactMicroStatic = {
      close: () => MenuReactMicro?.close()
    };
  }
  if (!DashboardClient) {
    (window as any).DashboardClient = {
      setState: () => {}
    };
  }

  /**
   * To be clear, this is not how you use React.
   * Mounting and unmounting root components should be rare operation,
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

  Menu.prototype.close = function () {
    $(".ui-bg").removeClass("animated fadeIn"),
      $(".ui-bg").addClass("animated fadeOut"),
      $(".ui-menu").addClass("animated zoomOut"),
      setTimeout(unmountComponent.bind(null, this), 250);
  };

  MenuMicro.prototype.close = MenuMicroStatic.prototype.close = function () {
    $("#menu-micro-bg").removeClass("animated fadeIn"),
      $("#menu-micro-bg").addClass("animated fadeOut"),
      $("#menu-micro").addClass("animated zoomOut"),
      setTimeout(unmountComponent.bind(null, this), 250);
  };

  UserView.prototype.close = function () {
    document.removeEventListener("mousedown", this.exit_click, false);
    unmountComponent(this);
  };
  Popup.prototype.close = Picture.prototype.close = function () {
    unmountComponent(this);
  };

  // non-hack: "Sign up to continue" only shows once at start
  App.temp.check = () => {};

  // For some reason, pictures we send don't render for ourselves initially.
  // Setting e.messages to [""] fixes that, although I don't know why yet.
  const rAppend = Room.prototype.append;
  Room.prototype.append = function (e) {
    if (e.messages.length === 0) e.messages.push("");
    rAppend.call(this, e);
  };

  // Allow more messages in group chat. (make configurable?)
  const rTrim = Room.prototype.trim_messages;
  Room.prototype.trim_messages = function () {
    const max = this.state.mode === "channel" ? 100 : 5000;
    const messages = this.state.messages;
    if (messages.length > max) messages.shift();
    this.setState({ messages });
  };

  if (FEATURES.HACKS) hackOverrides();
}

function hackOverrides() {
  if (!FEATURES.HACKS) return;
  let user = App.user || {};
  Object.defineProperty(App, "user", {
    set: (e) => (user = e),
    get: () => ({
      ...user,

      ...(Preferences.get(P.superTemp!)
        ? {
            temp: false,
            karma: 31337
          }
        : {}),
      ...(Preferences.get(P.enableModUI!)
        ? {
            master: true,
            mod: true
          }
        : {})
    })
  });

  ModPanel.prototype.componentDidMount = function () {
    this.setState({ tab: "default" });
  };

  const profile_buttons = UserProfile.prototype.profile_buttons;
  UserProfile.prototype.profile_buttons = function () {
    this.state.data.friend = this.state.data.actualFriend;
    const value = profile_buttons.apply(this);
    this.state.data.friend = true;
    return value;
  };

  UpgradeAccount.prototype.signup = () => {};
}
