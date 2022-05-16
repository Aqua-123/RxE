import React, { ChangeEvent, DragEvent } from "react";
import ReactDOM from "react-dom";
import { DRAGNDROP_FORMAT, uploadPicture } from "./uploadPicture";
import { FORMATS, parseImage } from "./formats";
import { onClickOrKeyUp } from "~src/utils";
import { setBioImage } from "./bio-image";

const onDropHandler = (user: EmeraldUser) => (ev: DragEvent) => {
  ev.preventDefault();
  ev.stopPropagation();
  const file = ev.dataTransfer.files?.[0];
  try {
    uploadPicture(file, user, DRAGNDROP_FORMAT);
  } catch (reason) {
    alert(`Image loading failed: ${reason}`);
  }
};

const uploadHandler =
  (user: EmeraldUser, format: ImageFormatType) =>
  (ev: ChangeEvent<HTMLInputElement>) => {
    const { currentTarget: input } = ev;
    const file = input.files?.[0];
    try {
      uploadPicture(file, user, format);
    } catch (reason) {
      alert(`Image loading failed: ${reason}`);
    }
  };

export const fromURLHandler =
  (user: EmeraldUser, format: ImageFormatType) => () => {
    const url = prompt("Paste URL:", "");
    if (url === null) return;
    const parsed = parseImage(url, format);
    if (parsed === null) {
      alert("Invalid URL");
      return;
    }
    setBioImage(user, parsed);
  };

const openUserPicture = (user: EmeraldUser) => () => {
  ReactDOM.render(
    <Picture data={{ src: user.display_picture }} />,
    document.getElementById("ui-hatch-2")
  );
};

export function profilePicture(this: UserProfile) {
  const { user, current_user: currentUser } = this.state.data;
  const onDrop = onDropHandler(user);
  const { display_picture: displayPicture } = user;
  if (user.id === currentUser.id) {
    // const dragNDrop =
    // React.createElement('span', { onDrop }, 'DRAG &', React.createElement('br'), 'DROP')
    const dragNDrop = null;
    return (
      <span onDrop={onDrop}>
        <img
          alt="User avatar"
          className="user-profile-avatar"
          src={displayPicture}
          onDrop={onDrop}
        />
        <input
          id="ritsu-profile-picture-upload"
          type="file"
          onChange={uploadHandler(user, FORMATS.IMGUR)}
          onDrop={onDrop}
        />
        <label
          className="user-profile-picture-hover"
          htmlFor="ritsu-profile-picture-upload"
          onDrop={onDrop}
        >
          {dragNDrop}
          <span
            className="material-icons"
            style={{ fontSize: "36px" }}
            title="Upload a profile picture"
          >
            cloud_upload
          </span>
        </label>
        <input
          id="ritsu-profile-picture-use-existing"
          style={{ fontSize: "12px" }}
          className="btn"
          title="Upload using imgur"
          onDrop={onDrop}
          type="button"
          value="Add from Imgur"
          onClick={fromURLHandler(user, FORMATS.IMGUR)}
        />
      </span>
    );
  }

  return (
    <img
      className="user-profile-avatar"
      alt="User avatar"
      src={displayPicture}
      {...onClickOrKeyUp(openUserPicture(user))}
    />
  );
}
