import ReactDOM from "react-dom";
import { log } from "~userscripter";
import { initComponents, uploadForm } from "./components";
import { upload, decodeImage, display, emit } from "./image-process";
import { imageFromURL } from "./imgur";
import { canUpload } from "./ratelimit";

export function initSendPics() {
  initComponents();

  // eslint-disable-next-line camelcase
  Room.prototype.upload_picture = function uploadPicture() {
    ReactDOM.render(uploadForm(), document.getElementById("ui-hatch-2"));
    // compatibility with fav pictures
    PictureUploader.onUploaded = function onUploaded(picture) {
      if (RoomClient === null) return;
      const image = imageFromURL(picture.url, true);
      if (image) RoomClient.sendRitsuPicture?.(image);
    };
  };

  Room.prototype.sendRitsuPicture = function sendRitsuPicture(image) {
    if (RoomClient === null) return;
    RoomClient.append(display(image));
    App.room.client.speak({ message: emit(image) });
    this.scroll();
  };

  PictureUpload.prototype.uploadImage = async function uploadImage() {
    if (!canUpload()) return;
    const fileInput = document.querySelector(
      ".picture-upload-button"
    ) as HTMLInputElement;
    const imageFile = fileInput.files?.[0];
    if (imageFile === undefined || RoomClient === null) return;
    try {
      const image = await upload(imageFile);
      this.close();
      RoomClient.sendRitsuPicture?.(image);
    } catch (error) {
      this.setState({
        failureReason: error instanceof Error ? error.message : `${error}`
      });
    }
  };

  const rReceived = Room.prototype.received;
  Room.prototype.received = function received(message) {
    const receivedOld = rReceived.bind(this);
    const text = message.messages?.[0] as string | undefined;
    if (text === undefined) return;
    const image = decodeImage(text);
    if (image === null) {
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
