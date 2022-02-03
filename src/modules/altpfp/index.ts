import React, { Attributes, DragEvent } from "react";
import ReactDOM from "react-dom";
// import avicons1 from 'static/assets/avicons_strict_1.png';
import browserWindow from "~src/browserWindow";
import { P, Preferences } from "~src/preferences";
import {
  wrapMethod,
  expect,
  timeout,
  firstSuccessAsync,
  loadCSS
} from "~src/utils";
import * as format0 from "./format0/index";
import { interpolation } from "./interpolation";
import css from "./styles.scss";

type ImageFormatType = "0";

interface ImageFormat {
  unpack(compressed: string): string | null;
  compress(image: Image, options: SamplingOptions): Promise<string>;
}

export const BIO_IMAGE = () =>
  /\[?rxe-pfp:?([A-Za-z0-9+/=\u{E0020}-\u{E005F}]+)\]?/gu;

const makeBioImage = (compressed: string) => `[rxe-pfp:${compressed}]`;

export function extractBioImage(bio: string): string | null {
  return (
    Array.from(bio.matchAll(BIO_IMAGE()))
      .map((match) => match[1])
      .slice(-1)[0] ?? null
  );
}

export function bioWithoutImage(bio: string): string {
  const lastIndex = Array.from(bio.matchAll(BIO_IMAGE()))
    .map((match) => match.index)
    .filter((index) => index !== undefined)
    .slice(-1)[0];
  // intended behaviour if undefined
  return bio.slice(0, lastIndex);
}

function replaceBioImage(bio: string, compressed: string) {
  const rawBio = bioWithoutImage(bio);
  return (
    rawBio +
    (rawBio[rawBio.length - 1] === "\n" ? "" : "\n") +
    makeBioImage(compressed)
  );
}

export async function saveBio(user: EmeraldUser, bio: string) {
  return new Promise<void>((resolve, reject) => {
    const params = {
      display_name: user.display_name,
      bio,
      flair: { color: user.flair.color },
      gender: user.gender
    };
    $.ajax({
      type: "GET",
      url: `/update_profile?${$.param(params)}`,
      dataType: "json",
      success() {
        UserProfileReact?.load(user.id);
        resolve();
      },
      error() {
        reject();
      }
    } as JQueryAjaxSettings); // old jQuery moment
  });
}

const imageFormats: Record<ImageFormatType, ImageFormat> = {
  "0": format0
};

async function compressImage(
  png64: string,
  format: ImageFormatType,
  options: SamplingOptions
) {
  if (!(format in imageFormats))
    throw new Error(`Format '${format}' not implemented`);
  const image = new Image();
  await timeout(
    expect(image, "load", (img) => {
      img.src = png64;
    }),
    5000
  );
  console.time("image-compression");
  const compressed = imageFormats[format]
    .compress(image, options)
    .then((data) => format + data);
  console.timeEnd("image-compression");
  return compressed;
}

function unpackImage(compressed: string): string | null {
  const format = compressed[0];
  if (!(format in imageFormats)) {
    console.error(
      `could not unpack image: ${compressed} (unknown format '${format}')`
    );
    return null;
  }
  return imageFormats[format as ImageFormatType].unpack(compressed.slice(1));
}

function getDisplayPicture(user: EmeraldUser): string {
  const fallback = user.display_picture.includes("emeraldchat.com/uploads")
    ? "https://emeraldchat.com/avicons_strict/1.png"
    : user.display_picture;
  if (user.bio === undefined) {
    console.warn("user.bio is undefined");
    return fallback;
  }
  const imageCompressed = extractBioImage(user.bio);
  if (imageCompressed) {
    const imageUnpacked = unpackImage(imageCompressed);
    if (imageUnpacked) {
      /*
            console.info(
                `Loaded custom image (${imageCompressed}) as (${imageUnpacked})`
            );
            */
      return imageUnpacked;
    }
  }
  return fallback;
}

function interceptUser<T, K extends FunctionKeys<T>>(
  { prototype: obj }: { prototype: T },
  method: K,
  getUser: PrependParam<ReplaceMethodReturn<T, K, EmeraldUser | undefined>, T>,
  before = true
) {
  if (typeof obj[method] !== "function" || typeof getUser !== "function")
    return;
  const methodName = `${method}()`;
  wrapMethod(
    obj,
    method,
    function wrapper(...params) {
      const user = getUser(this, ...params);
      const name = (obj as any as Prototype<T>)?.constructor?.name;
      const instance = name ? `'${name}' instance` : `unknown class instance`;
      if (user === undefined) return;
      if (
        !user ||
        typeof user !== "object" ||
        !("display_picture" in user) ||
        user.display_picture === undefined
      ) {
        console.warn(
          `expected EmeraldUser, in wrapper on ${instance} ${methodName} got: `,
          user
        );
        return;
      }
      if (user.bio === undefined) {
        console.warn(
          `EmeraldUser is missing 'bio' in wrapper on ${instance} ${methodName}`,
          user
        );
        return;
      }
      user.display_picture = getDisplayPicture(user);
    },
    before
  );
}

async function uploadPicture(file: File | undefined, user: EmeraldUser) {
  if (!file) {
    alert("No file uploaded.");
    return;
  }
  if (!file.type.startsWith("image")) {
    alert("File is not an image or its format is not supported.");
  }
  const reader = new FileReader();
  try {
    await timeout(
      expect(reader, "load", (fileReader) => fileReader.readAsDataURL(file)),
      5000
    );
  } catch (_) {
    alert("Could not load image.");
    return;
  }

  if (!reader.result) throw new Error("No result");
  const url = reader.result.toString();
  const options = [
    { interpolator: interpolation.none, width: 128, height: 128 },
    { interpolator: interpolation.none, width: 96, height: 96 },
    { interpolator: interpolation.none, width: 64, height: 64 },
    { interpolator: interpolation.none, width: 48, height: 48 }
  ];

  const image = await firstSuccessAsync<string>(
    options.map((opts) => () => compressImage(url, "0", opts))
  );
  console.log(`compressed: ${image.length} chars`);
  await saveBio(user, replaceBioImage(user.bio, image));
}

// eslint-disable-next-line camelcase
function profile_picture(this: UserProfile) {
  // eslint-disable-next-line camelcase
  const { user, current_user } = this.state.data;
  const onDrop = (ev: DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    const file = ev.dataTransfer.files?.[0];
    try {
      uploadPicture(file, user);
    } catch (reason) {
      alert(`Image loading failed: ${reason}`);
    }
  };
  if (user.id === current_user.id) {
    const picture = React.createElement("img", {
      // onMouseDown: this.update_profile_picture.bind(this),
      className: "user-profile-avatar",
      src: user.display_picture,
      onDrop
    } as Attributes);
    // drag'n'drop worked before I swear
    // const dragNDrop = React.createElement('span', { onDrop }, 'DRAG &', React.createElement('br'), 'DROP')
    const dragNDrop = null;
    const cloudIcon = React.createElement(
      "span",
      {
        style: {
          fontSize: "36px"
        },
        className: "material-icons",
        title: "Upload a profile picture",
        onDrop
      },
      "cloud_upload"
    );
    const customizeIcon = React.createElement(
      "span",
      {
        style: {
          fontSize: "36px"
        },
        className: "material-icons",
        title: "Customize how your picture gets uploaded",
        onDrop,
        onClick: (ev) => {
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
        }
      },
      "palette"
    );
    const fileInput = React.createElement("input", {
      type: "file",
      onChange(ev) {
        const { currentTarget: input } = ev;
        const file = input.files?.[0];
        try {
          uploadPicture(file, user);
        } catch (reason) {
          alert(`Image loading failed: ${reason}`);
        }
      },
      onDrop,
      id: "ritsu-profile-picture-upload",
      style: {
        display: "none"
      }
    });
    const overlay = React.createElement(
      "label",
      {
        // onMouseDown: this.update_profile_picture.bind(this),
        className: "user-profile-picture-hover",
        for: "ritsu-profile-picture-upload",
        onDrop
      },
      dragNDrop,
      cloudIcon,
      customizeIcon
    );
    return React.createElement("span", { onDrop }, picture, fileInput, overlay);
  }
  // eslint-disable-next-line no-shadow, camelcase
  const open_picture = function open_picture() {
    const element = React.createElement(Picture, {
      data: {
        src: user.display_picture
      }
    });
    ReactDOM.render(element, document.getElementById("ui-hatch-2"));
  };
  return React.createElement("img", {
    onMouseDown: open_picture,
    className: "user-profile-avatar",
    src: user.display_picture
  });
}

export function init() {
  loadCSS(css);
  // eslint-disable-next-line camelcase
  UserProfile.prototype.profile_picture = profile_picture;
  interceptUser(Room, "received", (_, messageData) => messageData.user);
  interceptUser(UserProfile, "profile_picture", (self) => self.state.data.user);
  interceptUser(FriendUnit, "body", (self) => self.props.data);
  const { Comment } = browserWindow;
  interceptUser(Comment, "render", (self) => self.state.comment_data?.user);
  interceptUser(Micropost, "render", (self) => self.state.data?.author);
  const MNU = MessageNotificationUnit;
  interceptUser(MNU, "image", (self) => self.props.data.data.sender);
  interceptUser(Message, "render", (self) => self.props.data.user);
  interceptUser(RoomUserUnit, "body", (self) => self.props.data);
  interceptUser(UserUnit, "body", (self) => self.props.data);
  interceptUser(UserView, "top", (self) => self.state.user);
  wrapMethod(Dashboard.prototype, "render", function render() {
    // todo: this isn't available immediately
    if (App.user.bio !== undefined)
      this.state.user.display_picture = getDisplayPicture(App.user);
    else console.warn("App.user.bio is undefined");
  });
}
