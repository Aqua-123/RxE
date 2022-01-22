/* eslint-disable react/no-find-dom-node */
/* eslint-disable */
import React, { MouseEvent } from "react";
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

  UpgradeAccount.prototype.signup = () => { };
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
      setState: () => { }
    };
  }

  $(window).off('resize').on('resize', () => {
    var e = document.getElementById('messages');
    if (e) e.scrollTop = e.scrollHeight
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
  App.temp.check = () => { };

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
    if (acTarget.matches(".notification-button, .notification-button *")) return;
    const notification = this.props.data;
    const user = notification.tier === "friend_request"
      ? notification.data.sender
      : notification.data.sender ?? notification.data.unit?.author;
    if (user) return UserViewGenerator.generate({ event, user });
    const id = notification.tier === "friend_request"
      ? notification.data.sender?.id
      : notification.sender_id ?? notification.data.sender?.id
    console.warn("Could not get user from notification");
    if (UserProfileReact) return UserProfileReact.load(id);
    const userProfile = React.createElement(UserProfile, { id });
    ReactDOM.render(userProfile, document.getElementById("ui-hatch"));
  }

  /*
  wrapMethod(NotificationUnit.prototype, 'friend_request_accept', function friend_request_accept(e: _MouseEvent) {
    e?.stopImmediatePropagation();
  }, true);

  wrapMethod(NotificationUnit.prototype, 'friend_request_reject', function friend_request_reject(e: _MouseEvent) {
    e?.stopImmediatePropagation();
  }, true);
  */

  Flair.prototype.render = function render() {
    const { data: { flair, string: name }, onClick } = this.props;
    return React.createElement('span', {
      className: 'user-flair',
      style: flair ?? { color: '' },
      onClick: onClick
    }, name);
  }

  if (FEATURES.HACKS) hackOverrides();
}