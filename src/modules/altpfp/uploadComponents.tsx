import React, { ChangeEvent, DragEvent } from "react";
import ReactDOM from "react-dom";
import { P, Preferences } from "~src/preferences";
import { DRAGNDROP_FORMAT, uploadPicture } from "./uploadPicture";
import { FORMATS } from "./formats";
import { onClickOrKeyUp } from "~src/utils";

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

const customizeUpload = (ev: {
  stopPropagation: () => void;
  preventDefault: () => void;
}) => {
  ev.stopPropagation();
  ev.preventDefault();
  const colour = prompt(
    "Background colour for partially transparent pictures:",
    Preferences.get(P.altpfpBackground)
  );
  if (colour === null) return;
  const matches = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colour);
  if (!matches)
    alert("Sorry, try looking up the hex code for your colour online.");
  else Preferences.set(P.altpfpBackground, colour);
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
    // TODO: make new upload button pretty
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
            style={{
              fontSize: "36px"
            }}
            title="Upload a profile picture"
          >
            cloud_upload
          </span>
          <span
            className="material-icons"
            title="Customize how your picture gets uploaded"
            style={{ fontSize: "36px" }}
            onDrop={onDrop}
            {...onClickOrKeyUp(customizeUpload)}
          >
            palette
          </span>
        </label>
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
