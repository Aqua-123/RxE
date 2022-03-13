// import avicons1 from 'static/assets/avicons_strict_1.png';
import browserWindow from "~src/browserWindow";
import {
  existing,
  expect,
  loadCSS,
  notNum,
  timeout,
  wrapMethod
} from "~src/utils";
import { extractBioImage } from "./bio-image";
import * as format0 from "./format0/index";
import { interceptUsers } from "./interceptUser";
import css from "./styles.scss";
import { profilePicture } from "./uploadPicture";

type ImageFormatType = "0" | "h";

interface ImageFormat {
  unpack(compressed: string): string | null;
  compress(image: Image, options: SamplingOptions): Promise<string>;
}

const imageFormats: Record<ImageFormatType, ImageFormat> = {
  "0": format0,
  "h": format0
};

export async function compressImage(
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
  if (format === "h") {
    return compressed;
  }

  return imageFormats[format as ImageFormatType].unpack(compressed.slice(1));
}

export function getDisplayPicture(user: Partial<EmeraldUser>): string {
  const fallback = !user?.display_picture?.includes("emeraldchat.com/uploads")
    ? `https://robohash.org/yay${user.id}.png?set=set4`
    : user.display_picture;
  if (user.bio === undefined) {
    console.warn("user.bio is undefined");
    return fallback;
  }
  const imageCompressed = extractBioImage(user.bio);
  if (imageCompressed) {
    const imageUnpacked = unpackImage(imageCompressed);
    if (imageUnpacked) {
      // console.log(`loaded custom image for user ${user.display_name}`);
      return imageUnpacked;
    }
  }
  return fallback;
}

export function init() {
  loadCSS(css);
  loadCSS(`.room-component-message-avatar {
  color: transparent;
  }

  #ritsu-profile-picture-upload {
    display: none;
  }`);
  UserProfile.prototype.profile_picture = profilePicture;
  const { Comment } = browserWindow;
  const MNU = MessageNotificationUnit;
  interceptUsers(Room, "received", (_, { user }) => [notNum(user)]);
  interceptUsers(Room, "append", (_, { user }) => [notNum(user)]);
  interceptUsers(RoomChannelMembers, "setState", (_, state) => {
    if (state && "members" in state) return existing(state.members);
    return [];
  });
  interceptUsers(UserProfile, "profile_picture", ({ state }) => [
    state.data.user
  ]);
  interceptUsers(FriendUnit, "body", (self) => [self.props.data]);
  interceptUsers(Comment, "render", (self) => [self.state.comment_data?.user]);
  interceptUsers(Micropost, "render", (self) => [self.state.data?.author]);
  interceptUsers(MNU, "image", (self) => [self.props.data.data.sender]);
  interceptUsers(Message, "render", (self) => [notNum(self.props.data.user)]);
  interceptUsers(RoomUserUnit, "body", (self) => [self.props.data]);
  interceptUsers(UserUnit, "body", (self) => [self.props.data]);
  interceptUsers(UserView, "top", (self) => [self.state.user]);
  wrapMethod(
    Dashboard.prototype,
    "render",
    function render() {
      // todo: this isn't available immediately
      if (App.user.bio !== undefined)
        this.state.user.display_picture = getDisplayPicture(App.user);
      else console.warn("App.user.bio is undefined");
    },
    true
  );
}
