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
          {user.karma}
          <b> Since </b>
          {new Date(user.created_at).toLocaleDateString()}
          {user.master && <b style={{ color: "#f00" }}> CALLAN </b>}
          {user.mod && <b style={{ color: "#f00" }}> MOD </b>}
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
        // console.error("stuck DIV found in message", divs[0]);
        divs[0].remove();
      }
    }
  }
}
