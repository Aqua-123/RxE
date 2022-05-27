import React from "react";
import { IMGUR_ENDPOINT } from "./imgur";
import { canUpload, nextUpload } from "./ratelimit";
import { uploadInfo } from "./image-process";
import { loadCSS } from "~src/utils";
import css from "./style.scss";

export const uploadForm = () => (
  <MenuMicro>
    <PictureUpload />
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
  function CreateNote(props: any) {
    const { text } = props;
    return (
      <div>
        <b>Note</b>: {text}
      </div>
    );
  }
  function CaughtFailure(props: any) {
    const { failureReason } = props;
    return (
      <div className="picture-upload-error">
        <div>We couldn&apos;t upload your picture.</div>
        <div>
          {"Reason: "}
          <span className="picture-upload-error-reason">{failureReason}</span>
        </div>
      </div>
    );
  }

  PictureUpload.prototype.body = function body() {
    const { failureReason } = this.state;
    const enabled = canUpload();

    const notesSection = (
      <div className="picture-upload-info">
        <CreateNote text={uploadInfo.destination} />
        <CreateNote text={uploadInfo.ratelimit} />
        {failureReason && <CaughtFailure failureReason={failureReason} />}
      </div>
    );

    const uploadSection = enabled
      ? " Choose a file"
      : ` Wait ${$.timeago(nextUpload())} before uploading again.`;

    const labelComp = (
      <label htmlFor="image">
        <span
          className="material-icons upload-thing"
          style={{ cursor: enabled ? "pointer" : "not-allowed" }}
        >
          {enabled ? "cloud_upload" : "hourglass_top"}
        </span>
        {uploadSection}
      </label>
    );
    const inputElement = (
      <input
        id="image"
        className="picture-upload-button"
        name="image"
        type="file"
        accept="image/*"
        disabled={!enabled}
        onChange={() => enabled && this.uploadImage?.()}
      />
    );

    return (
      <form
        id="picture_upload"
        name="picture_upload"
        data-remote="true"
        method="post"
        action={IMGUR_ENDPOINT}
      >
        {inputElement}
        {labelComp}
        {notesSection}
      </form>
    );
  };
}
