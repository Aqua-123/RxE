import React from "react";
import { loadCSS } from "~src/utils";
import css from "./style.scss";

export const uploadForm = () => (
  <MenuMicro>
    <MessagePictureUpload />
  </MenuMicro>
);

export function initComponents() {
  loadCSS(css);
  Room.prototype.room_input = function roomInput() {
    return (
      <div className="room-component-input">
        <textarea
          id="room-input"
          className="room-component-input-textarea"
          onMouseDown={() => this.scroll()}
          onKeyDown={(e) => this.input(e)}
          placeholder="Say Something..."
        />
        <span
          className="room-component-input-icon material-icons"
          title="Attach image"
          onMouseDown={() => this.upload_picture()}
          role="button"
          tabIndex={0}
        >
          photo_camera
        </span>
      </div>
    );
  };
}
