import React from "react";
import { IMGUR_ENDPOINT } from "./imgur";
import { canUpload, nextUpload, uploadInfo } from "./ratelimit";

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

  PictureUpload.prototype.body = function body() {
    const enabled = canUpload();
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
          disabled={!enabled}
          onChange={() => enabled && this.uploadImage?.()}
        />
        <label htmlFor="image">
          <span
            className="material-icons"
            style={{
              verticalAlign: "middle",
              marginRight: "5px",
              cursor: enabled ? "pointer" : "not-allowed"
            }}
          >
            {enabled ? "cloud_upload" : "hourglass_top"}
          </span>
          {enabled
            ? " Choose a file"
            : ` Wait ${$.timeago(nextUpload())} before uploading again.`}
        </label>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 400,
            color: "#adb6c7"
          }}
        >
          Note: {uploadInfo}
        </div>
      </form>
    );
  };
}
