// import avicons1 from 'static/assets/avicons_strict_1.png';
import browserWindow from "~src/browserWindow";
import { existing, loadCSS, notNum, wrapMethod } from "~src/utils";
import { getDisplayPicture, interceptUsers } from "./interceptUser";
import css from "./styles.scss";
import { profilePicture } from "./upload-components";

export function init() {
  loadCSS(css);
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
  interceptUsers(MNU, "image", (self) =>
    existing([self.props.data.data.sender])
  );
  interceptUsers(Message, "render", (self) => [notNum(self.props.data.user)]);
  interceptUsers(NotificationUnit, "render", (self) => [
    notNum(self.props.data.data.sender)
  ]);
  interceptUsers(RoomUserUnit, "body", (self) => [self.props.data]);
  interceptUsers(UserUnit, "body", (self) => [self.props.data]);
  interceptUsers(UserView, "top", (self) => [self.state.user]);
  wrapMethod(
    Dashboard.prototype,
    "render",
    function render() {
      if (App.user.bio)
        this.state.user.display_picture = getDisplayPicture(App.user);
    },
    true
  );
}
