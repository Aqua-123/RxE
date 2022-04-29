import React from "react";
import { IMGUR_ENDPOINT } from "./imgur";
import { canUpload, nextUpload } from "./ratelimit";
import { uploadInfo } from "./image-process";
import { loadCSS } from "~src/utils";

export const uploadForm = () => (
  <MenuMicro>
    <PictureUpload />
  </MenuMicro>
);

const initCSS = () =>
  loadCSS(`.picture-upload-info {
  font-size: 14px;
  font-weight: 400;
  color: "#adb6c7";
}

.picture-upload-info div {
  margin-bottom: 1em;
}

.picture-upload-error {
  color: red;
  font-weight: bold;
}

.picture-upload-error-reason {
  font-weight: initial;
}`);

export function initComponents() {
  initCSS();
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
    const { failureReason } = this.state;
    const enabled = canUpload();
    const notesSection = (
      <div className="picture-upload-info">
        <div>
          <b>Note</b>: {uploadInfo.destination}
        </div>
        <div>
          <b>Note</b>: {uploadInfo.ratelimit}
        </div>
        {failureReason && (
          <div className="picture-upload-error">
            <div>We couldn&apos;t upload your picture.</div>
            <div>
              {"Reason: "}
              <span className="picture-upload-error-reason">
                {failureReason}
              </span>
            </div>
          </div>
        )}
      </div>
    );
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
        {notesSection}
      </form>
    );
  };
}
