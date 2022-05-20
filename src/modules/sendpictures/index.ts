import React from "react";
import {
  decodeInvisible as decode,
  encodeInvisible as encode
} from "~src/utils";
import { log } from "~userscripter";

const PLACEHOLDER =
  "Use Ritsu x Emerald 0.9.0 or newer to see an image instead of this placeholder.";
const IMG_REGEXP = new RegExp(`^${PLACEHOLDER}(.*)$`);

/**
 * This brings back image sending and receiving capability, but
 * both sender and receiver must be using this script for it to work
 */
export function initSendPictures() {
  // bring image upload button back
  // the server is preventing sending them the old way, but this is what
  // the rest of this file is for.
  Room.prototype.room_input = function roomInput() {
    return React.createElement(
      "div",
      { className: "room-component-input" },
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

  // tweaking send_picture
  Room.prototype.send_picture = function sendPicture(e) {
    this.append({
      messages: [],
      user: App.user,
      picture: e
    });
    // 1. continue to emit the picture payload, in case Callan changes his mind.
    // 2. don't allow arbitrary URLs to be passed in the message payload.
    const urlChunks = e.url.match(
      /^https:\/\/static.emeraldchat.com\/uploads\/picture\/(.*)$/
    );
    const message = urlChunks
      ? `${PLACEHOLDER}${encode(urlChunks[1])}`
      : undefined;
    App.room.client.speak({
      message,
      picture: e
    });
    this.scroll();
  };

  // tweaking received picture handling
  const rReceived = Room.prototype.received;
  Room.prototype.received = function received(e) {
    const emitImage = (path: string) => {
      rReceived.call(this, {
        messages: [],
        user: e.user,
        picture: {
          url: `https://static.emeraldchat.com/uploads/picture/${path}`
        }
      });
    };

    if (e.messages?.[0]) {
      const matches = e.messages[0].match(IMG_REGEXP);
      if (matches) {
        try {
          emitImage(decode(matches[1]));
          return;
        } catch (err) {
          if (err instanceof Error) log.error(err.message);
        }
      }
      const legacyMatches = e.messages[0].match(
        /^Image: \[([a-zA-Z0-9/=-]+)\]$/
      );
      if (legacyMatches) {
        try {
          emitImage(atob(legacyMatches[1]));
          return;
        } catch (err) {
          if (err instanceof Error) log.error(err.message);
        }
      }
    }
    rReceived.call(this, e);
  };
}
