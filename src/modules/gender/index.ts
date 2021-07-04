import { P, Preferences } from "~src/preferences";
import { loadCSS } from "~src/utils";
import css from "./style.scss";

export function initGender() {
  const showGender = Preferences.get(P.showGender);
  document.documentElement.classList.toggle("showGender", showGender);
  loadCSS(css);

  const mnuImage = MessageNotificationUnit.prototype.image;
  MessageNotificationUnit.prototype.image = function image() {
    const img = mnuImage.apply(this);
    img.props["data-gender"] = this.props.data.data.sender.gender;
    return img;
  };

  const nuImage = NotificationUnit.prototype.image;
  NotificationUnit.prototype.image = function image() {
    const img = nuImage.apply(this);
    img.props["data-gender"] = this.props.data.data.sender.gender;
    return img;
  };

  const fuBody = FriendUnit.prototype.body;
  FriendUnit.prototype.body = function body() {
    const div = fuBody.apply(this);
    div.props.children[0].props["data-gender"] = this.props.data.gender;
    return div;
  };

  const ruuBody = RoomUserUnit.prototype.body;
  RoomUserUnit.prototype.body = function body() {
    const div = ruuBody.apply(this);
    if (div.props.children[0].type === "img") {
      div.props.children[0].props["data-gender"] = this.props.data.gender;
    }
    return div;
  };

  const suBody = SearchUnit.prototype.body;
  SearchUnit.prototype.body = function body() {
    const div = suBody.apply(this);
    div.props.children[0].props["data-gender"] = this.props.data.gender;
    return div;
  };

  const uuBody = UserUnit.prototype.body;
  UserUnit.prototype.body = function body() {
    const div = uuBody.apply(this);
    div.props.children[0].props["data-gender"] = this.props.data.gender;
    return div;
  };

  const mRender = Message.prototype.render;
  Message.prototype.render = function render() {
    const div = mRender.apply(this);
    div.props.children[0].props.children.props["data-gender"] =
      this.props.data.user.gender;
    return div;
  };
}
