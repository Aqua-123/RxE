import ReactDOM from "react-dom";
import { log } from "~userscripter";
import { initComponents, uploadForm } from "./components";
import { upload, decodeImage, display, emit } from "./image-process";
import { imageFromURL } from "./imgur";
import { canUpload } from "./ratelimit";
import { P } from "~src/preferences";

export function initSendPics() {
  initComponents();
  const rpUpload = Room.prototype.upload_picture;
  Room.prototype.upload_picture = function uploadPicture() {
    if (App.user.gold && !P.legacyImages && this.state.mode !== "channel") {
      rpUpload.call(this);
      return;
    }

    ReactDOM.render(uploadForm(), document.getElementById("ui-hatch-2"));
    // compatibility with fav pictures
    PictureUploader.onUploaded = function onUploaded(picture) {
      if (!RoomClient) return;
      const image = imageFromURL(picture.url, true);
      if (image) RoomClient.sendRitsuPicture?.(image);
    };
  };

  Room.prototype.sendRitsuPicture = function sendRitsuPicture(image) {
    this.append(display(image));
    App.room.client.speak({ message: emit(image) });
    this.scroll();
  };

  PictureUpload.prototype.uploadImage = async function uploadImage() {
    if (!canUpload()) return;
    const fileInput = document.querySelector(
      ".picture-upload-button"
    ) as HTMLInputElement;
    const imageFile = fileInput.files?.[0];
    if (!imageFile) return;
    try {
      const image = await upload(imageFile);
      this.close();
      if (RoomClient) RoomClient.sendRitsuPicture?.(image);
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
