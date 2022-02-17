import React, { ChangeEvent, DragEvent } from "react";
import ReactDOM from "react-dom";
import { P, Preferences } from "~src/preferences";
import {
  timeout,
  firstSuccessAsync,
  onClickOrKeyUp,
  readFile
} from "~src/utils";
import { saveBio, replaceBioImage } from "./bio-image";
import { interpolation } from "./interpolation";
import { compressImage } from "./index";

const noFile = () => alert("No file uploaded.");
const notImage = () =>
  alert("File is not an image or its format is not supported.");
const timedOut = () => alert("Could not load image.");

const FORMAT_DEFAULT = "0";

async function trySave(imageURL: string, user: EmeraldUser) {
  const sizes = [128, 96, 64, 48];
  const toSize = (size: number) => ({
    interpolator: interpolation.none,
    width: size,
    height: size
  });
  const image = await firstSuccessAsync<string>(
    sizes.map(
      (size) => () => compressImage(imageURL, FORMAT_DEFAULT, toSize(size))
    )
  );
  console.log(`compressed: ${image.length} chars`);
  await saveBio(user, replaceBioImage(user.bio, image));
}

async function uploadPicture(file: File | undefined, user: EmeraldUser) {
  if (!file) {
    noFile();
    return;
  }

  if (!file.type.startsWith("image")) {
    notImage();
    return;
  }

  try {
    const url = await timeout(readFile(file), 5000);
    await trySave(url, user);
  } catch (_) {
    timedOut();
  }
}

const onDropHandler = (user: EmeraldUser) => (ev: DragEvent) => {
  ev.preventDefault();
  ev.stopPropagation();
  const file = ev.dataTransfer.files?.[0];
  try {
    uploadPicture(file, user);
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
  (user: EmeraldUser) => (ev: ChangeEvent<HTMLInputElement>) => {
    const { currentTarget: input } = ev;
    const file = input.files?.[0];
    try {
      uploadPicture(file, user);
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
          onChange={uploadHandler(user)}
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
