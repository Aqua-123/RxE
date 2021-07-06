import React from "react";

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
    const message = urlChunks ? `Image: [${btoa(urlChunks[1])}]` : undefined;
    App.room.client.speak({
      message,
      picture: e
    });
    this.scroll();
  };

  // tweaking received picture handling
  const rReceived = Room.prototype.received;
  Room.prototype.received = function received(e) {
    if (e.messages?.[0]) {
      const matches = e.messages[0].match(/^Image: \[([a-zA-Z0-9/=-]+)\]$/);
      if (matches) {
        rReceived.call(this, {
          messages: [],
          user: e.user,
          picture: {
            url: `https://static.emeraldchat.com/uploads/picture/${atob(
              matches[1]
            )}`
          } as EmeraldPicture
        });
        return;
      }
    }
    rReceived.call(this, e);
  };
}
