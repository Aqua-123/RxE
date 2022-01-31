/*eslint-disable*/
import React from "react";
import ReactDOM from "react-dom";
import {
  decodeInvisible as decode,
  encodeInvisible as encode
} from "~src/utils";
import { log } from "~userscripter";

export function initSendPics() {
  const PLACEHOLDER =
    "Use Ritsu x Emerald 0.10.0 or newer to see an image instead of this placeholder.";
  const IMG_REGEXP = new RegExp(`^${PLACEHOLDER}(.*)$`);
  //Bringing backk the legendary camera button (reusing code once again)
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

  Room.prototype.upload_picture = function newUpload() {
    var element;
    (element = React.createElement(
      MenuMicro,
      null,
      React.createElement(PictureUpload, null)
    )),
      ReactDOM.render(element, document.getElementById("ui-hatch-2")),
      (PictureUploader.onUploaded = function (this: Room, e: any) {
        this.send_picture(e), MenuReactMicro.close();
      }.bind(this));
  };

  // Slightly modified send pic code for new payload and all
  Room.prototype.send_picture = function sendPicture(e) {
    var u = `Image: ${e}`;
    const message = `${PLACEHOLDER}${encode(u)}`;
    RoomClient?.append({
      messages: [],
      user: App.user,
      picture: {
        url: `https://i.imgur.com/${e}.png`
      } as EmeraldPicture
    });
    App.room.client.speak({ message });
    this.scroll();
  };
  //image upload code for... uploading stuff heh
  PictureUpload.prototype.uploadImage = function () {
    const r = new XMLHttpRequest();
    const d = new FormData();
    const j = document.getElementsByClassName("picture-upload-button");
    var f = <HTMLInputElement>j[0];
    var e = f["files"]![0];
    PictureUpload.prototype.close();
    d.append("image", e);

    r.open("POST", "https://api.imgur.com/3/image/");
    r.setRequestHeader("Authorization", `Client-ID b8f69bdcc4d1373`);
    r.onreadystatechange = function () {
      if (r.status === 200 && r.readyState === 4) {
        let res = JSON.parse(r.responseText);
        RoomClient?.send_picture(res.data.id);
      }
    };
    r.send(d);
  };
  // Modifying existing upload page to send pics to imgur instead of callans leaking bucket (more like nuked)
  PictureUpload.prototype.body = function () {
    return React.createElement(
      "form",
      {
        "data-remote": "true",
        "name": "picture_upload",
        "id": "picture_upload",
        "method": "post",
        "action": "https://api.imgur.com/3/image"
      },
      React.createElement("input", {
        className: "picture-upload-button",
        type: "file",
        id: "image",
        name: "image",
        accept: "image/*",
        onChange: this.uploadImage.bind(this)
      }),
      React.createElement(
        "label",
        {
          htmlFor: "image"
        },
        React.createElement(
          "span",
          {
            style: {
              verticalAlign: "text-top",
              marginRight: "5px"
            },
            className: "material-icons"
          },
          "cloud_upload"
        ),
        " Choose a file"
      )
    );
  };
  //Re using this bit cause idk i dont understand the uncode magic being done here
  const rReceived = Room.prototype.received;
  Room.prototype.received = function received(e) {
    const emitImage = (path: string) => {
      var dat = path.split(" ").slice(-1)[0];
      rReceived.call(this, {
        messages: [],
        user: e.user,
        picture: {
          url: `https://i.imgur.com/${dat}.png`
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
