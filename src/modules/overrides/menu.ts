/* eslint-disable react/no-find-dom-node */
import ReactDOM from "react-dom";
import React, { MouseEvent } from "react";

/**
 * Apply overrides to the all different types of menu components.
 */
export function menuOverrides() {
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
  NotificationUnit.prototype.action = function action(event: _MouseEvent) {
    const { target } = event;
    if (!(target instanceof Node)) return;
    const acTarget = target instanceof Element ? target : target.parentElement;
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
      notification.data.unit?.post.user_id ??
      notification.data.unit?.author.id ??
      notification.data.unit?.post.author_id ??
      notification.data.unit?.comment.author_id ??
      notification.data?.sender?.id ??
      notification.sender_id;

    // Reload or open UserProfile.
    if (UserProfileReact) UserProfileReact.load(id);
    const userProfile = React.createElement(UserProfile, { id });
    ReactDOM.render(userProfile, document.getElementById("ui-hatch"));
  };

  // Fix crash on null sender
  NotificationUnit.prototype.image = function image() {
    const classList = "navigation-notification-unit-image";
    return React.createElement("img", {
      className: classList,
      src: this.props.data?.data?.sender?.display_picture
    });
  };
  NotificationUnit.prototype.content = function content() {
    const { content: contentWhole, sender } = this.props.data.data;
    const flairData = {
      string: sender?.display_name ?? "(no name)",
      flair: sender?.flair ?? { color: "" }
    };
    const flair = React.createElement(Flair, { data: flairData });
    const contentTrimmed =
      contentWhole.length > 64
        ? `${contentWhole.substring(0, 64)}...`
        : contentWhole;
    const message = React.createElement(
      "span",
      {
        className: "navigation-notification-unit-message"
      },
      contentTrimmed
    );
    return React.createElement("span", null, flair, message);
  };
}
