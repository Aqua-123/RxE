import ReactDOM from "react-dom";
import React from "react";
import { log } from "~userscripter";
import { initComponents } from "./components";
import {
  upload,
  decodeImage,
  display,
  emit,
  uploadInfo
} from "./image-process";
import { imageFromURL, IMGUR_ENDPOINT } from "./imgur";
import { canUpload, nextUpload } from "./ratelimit";
import { P } from "~src/preferences";

export function initSendPics() {
  initComponents();
  const rpUpload = Room.prototype.upload_picture;
  Room.prototype.upload_picture = function uploadPicture() {
    if (App.user.gold && !P.legacyImages && this.state.mode !== "channel") {
      rpUpload.call(this);
      return;
    }
    MessagePictureUpload.prototype.handleSubmit =
      async function handleSubmit(e: { preventDefault: () => void }) {
        e.preventDefault();
        const file = document.getElementById("image") as HTMLInputElement;
        if (!file || !file.files) return;
        const fileUploaded = file.files[0];
        MenuReactMicro.close();
        const uploadedimage = await upload(fileUploaded);
        const image = imageFromURL(uploadedimage.url, true);
        if (image) RoomClient?.sendRitsuPicture?.(image);
      };
    const element = React.createElement(
      MenuMicro,
      null,
      React.createElement(MessagePictureUpload, null)
    );
    ReactDOM.render(element, document.getElementById("ui-hatch-2"));
  };

  Room.prototype.sendRitsuPicture = function sendRitsuPicture(image) {
    const { mode } = this.state;
    this.append(display(image));
    App.room.client.speak({ message: emit(image), mode });
    this.scroll();
  };

  MessagePictureUpload.prototype.body = function body() {
    const enabled = canUpload();

    function ImageUploadNotes(props: any) {
      const { text } = props;
      return (
        <div>
          <b>Note</b>: {text}
        </div>
      );
    }

    const notesSection = (
      <div className="picture-upload-info">
        <ImageUploadNotes text={uploadInfo.destination} />
        <ImageUploadNotes text={uploadInfo.ratelimit} />
        {App.user._karma < 10 && (
          <ImageUploadNotes text={uploadInfo.lowKarma} />
        )}
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

  const rReceived = Room.prototype.received;
  Room.prototype.received = function received(message) {
    const receivedOld = rReceived.bind(this);
    const text = message.messages?.[0] as string | undefined;
    if (!text) return;
    const image = decodeImage(text);
    if (!image) {
      receivedOld(message);
      return;
    }
    try {
      receivedOld(display(image, message.user));
      return;
    } catch (err) {
      if (err instanceof Error) log.error(err.message);
    }
  };
}
