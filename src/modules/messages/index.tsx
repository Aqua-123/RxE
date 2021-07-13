import React from "react";
import { P, Preferences } from "~src/preferences";
import { loadCSS } from "~src/utils";
import css from "./style.scss";

export function initMessages() {
  loadCSS(css);
  const mRender = Message.prototype.render;
  Message.prototype.render = function render() {
    const { user } = this.props.data;
    const tree = mRender.apply(this);
    tree.props["data-id"] = user.id;
    const messageRight = tree.props.children[1];
    if (Preferences.get(P.imgProtect)) {
      const { picture } = this.props.data;
      if (picture && (user.temp || user.karma < 10)) {
        const messageText = messageRight.props.children[1];
        delete messageText.props.children;
      }
    }
    if (Preferences.get(P.showInfo)) {
      const flair = messageRight.props.children[0];
      flair.props.children.push(
        <span className="user-extra">
          <b>Karma: </b>
          {user._karma ?? user.karma}
          <b> Since </b>
          {new Date(user.created_at).toLocaleDateString()}
          {user.master && !user.proxy && (
            <b style={{ color: "#f00" }}> CALLAN </b>
          )}
          {user.mod && !user.proxy && <b style={{ color: "#f00" }}> MOD </b>}
        </span>
      );
    }
    return tree;
  };
}

/**
 * Keeping this to clean up a bug where the react tree ends up with
 * leftover <div> that don't go away.
 */
export function decorateMessages() {
  const messages = document.querySelectorAll(
    ".room-component-message-container"
  );
  const msgs = RoomClient?.state?.messages;
  if (msgs?.length) {
    for (let i = 0; i < msgs.length; i += 1) {
      const msgElt = messages[i];
      const { messages: lines } = msgs[i];
      const divs = msgElt?.querySelector(
        ".room-component-message-text"
      )?.childNodes;
      while (divs && divs.length > lines.length) {
        divs[0].remove();
      }
      if (divs) {
        if (
          lines.length === 1 &&
          /^\p{Extended_Pictographic}{1,5}$/u.test(lines[0])
        ) {
          (divs[0] as HTMLElement).setAttribute("style", "font-size: 5em");
        } else {
          (divs[0] as HTMLElement).removeAttribute("style");
        }
      }
    }
  }
}

const makeKey = (() => {
  let i = 0;
  // eslint-disable-next-line no-plusplus
  return () => `key-${++i}`;
})();

export function betterMessageRendering() {
  // message rendering is weird and slow.
  // trying to select text in the chat breaks whenever a new message appears.
  // 3 forced layout and repaints happen per messages.

  Room.prototype.room_messages = function roomMessages(
    className = "room-component-messages"
  ) {
    let loadMore = null;
    let emptyMessage: JSX.Element | "" = "";
    let r = 0;
    for (let a = 0; a < this.state.messages.length; a += 1) {
      r += this.state.messages[a].messages.length;
    }
    if (this.state.messages_count > r && this.state.messages.length > 0) {
      loadMore = (
        <div
          role="button"
          tabIndex={0}
          onMouseDown={() => this.load_messages(r)}
          className="room-component-load-button"
        >
          Load More ({r} of {this.state.messages_count})
        </div>
      );
    }
    if (this.state.mode === "private" && this.state.messages.length < 1) {
      emptyMessage = (
        <div className="room-notification">
          No messages here yet. Start a conversation!
        </div>
      );
    }
    if (
      RoomChannelSelectClient.state &&
      this.state.mode === "channel" &&
      this.state.messages.length < 1
    ) {
      emptyMessage = (
        <div className="room-notification">No messages here yet!</div>
      );
    }
    return (
      <div id="messages" className={className}>
        <MuteButton />
        {this.state.print}
        {emptyMessage}
        {loadMore}
        {this.state.messages.map((data) => {
          if (!data.key) {
            data.key = makeKey();
          }
          return <Message data={data} key={data.key} />;
        })}
        {this.state.print_append}
      </div>
    );
  };

  Room.prototype.append = function append(e, doTyping) {
    // For some reason, pictures we send don't render for ourselves initially.
    // Setting e.messages to [""] fixes that, although I don't know why yet.
    if (e.messages.length === 0) e.messages.push("");
    // inline trim_message and append here to avoid extra .setState()/renders
    const max = this.state.mode === "channel" ? 50 : 5000; // original= 50: 5000
    const { messages } = this.state;
    if (messages.length > max) messages.shift();
    if (
      messages[messages.length - 1] &&
      messages[messages.length - 1].user.id === e.user.id &&
      !messages[messages.length - 1].picture &&
      !e.picture &&
      messages[messages.length - 1].messages.length < 16
    ) {
      const n = messages[messages.length - 1].messages;
      const r = n[n.length - 1];
      if (e.messages[0] === r) return;
      messages[messages.length - 1].messages.push(e.messages[0]);
    } else messages.push(e);
    // inline typing check here.
    let { typing } = this.state;
    if (doTyping) {
      if (e.typing) {
        if (e.user.id !== App.user.id) {
          typing = e.user.display_name;
          setTimeout(() => this.stop_typing(), 1e4);
        }
      } else {
        typing = null;
        App.room.typing = null;
      }
    }
    this.setState({
      messages,
      typing
    });
  };
}

Room.prototype.received = function received(e) {
  if (e.user.id !== App.user.id && e.messages) {
    App.room.play_sound("/sfx/simple_alert.wav");
    this.append(e, true);
    if (PushNotifications.idle()) {
      PushNotifications.send(e.user.display_name, {
        icon: e.user.display_picture,
        body: e.messages[0]
      });
    }
  } else if (e.typing) {
    if (e.user.id !== App.user.id) {
      this.setState({ typing: e.user.display_name });
      setTimeout(() => this.stop_typing(), 1e4);
    }
  }
};
