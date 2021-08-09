import React from "react";
import { log } from "~userscripter";

const PLACEHOLDER =
  "Use Ritsu x Emerald 0.9.0 or newer to see an image instead of this placeholder.";
const IMG_REGEXP = new RegExp(`^${PLACEHOLDER}(.*)$`);

const b64Set =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
// abuse of https://en.wikipedia.org/wiki/Tags_(Unicode_block)
const tagSet = Array.from({ length: 65 }, (_, i) =>
  String.fromCodePoint(i + 0xe0020)
).join("");

function encode(urlPath: string) {
  const str = btoa(urlPath);
  let out = "";
  for (let pos = 0; pos < str.length; pos += 1) {
    const i = b64Set.indexOf(str[pos]);
    if (i === -1) return null;
    out += tagSet[i * 2] + tagSet[i * 2 + 1];
  }
  return out;
}

function decode(str: string) {
  let b64 = "";
  for (let pos = 1; pos < str.length; pos += 2) {
    const i = tagSet.indexOf(str[pos]);
    if (i === -1) throw new Error("bad image path");
    b64 += b64Set[(i - 1) / 2];
  }
  return atob(b64);
}

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
        } as EmeraldPicture
      });
    };

    if (e.messages?.[0]) {
      const matches = e.messages[0].match(IMG_REGEXP);
      if (matches) {
        try {
          emitImage(decode(matches[1]));
          return;
        } catch (err) {
          log.error(err.message);
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
          log.error(err.message);
        }
      }
    }
    rReceived.call(this, e);
  };
}
