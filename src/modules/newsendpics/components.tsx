import React from "react";
import { IMGUR_ENDPOINT } from "./imgur";

export const uploadForm = () => (
  <MenuMicro>
    <PictureUpload />
  </MenuMicro>
);

export function initComponents() {
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
          onMouseDown={() => this.upload_picture()}
          role="button"
          tabIndex={0}
        >
          photo_camera
        </span>
      </div>
    );
  };

  PictureUpload.prototype.body = function body() {
    return (
      <form
        id="picture_upload"
        name="picture_upload"
        data-remote="true"
        method="post"
        action={IMGUR_ENDPOINT}
      >
        <input
          id="image"
          className="picture-upload-button"
          name="image"
          type="file"
          accept="image/*"
          onChange={() => this.uploadImage?.()}
        />
        <label htmlFor="image">
          <span
            className="material-icons"
            style={{
              verticalAlign: "text-top",
              marginRight: "5px"
            }}
          >
            cloud_upload
          </span>
          {" Choose a file"}
        </label>
      </form>
    );
  };
}
