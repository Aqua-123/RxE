import { P, Preferences } from "~src/preferences";
import { loadCSS, notNum } from "~src/utils";
import css from "./style.scss";

function genderIntercept(this: any, element: () => JSX.Element) {
  let gender;
  if (this.props.data.data) gender = this.props.data.data.sender.gender;
  if (this.props.data.gender) gender = this.props.data.gender;
  const img = element.apply(this);
  img.props["data-gender"] = gender;
  return img;
}
export function initGender() {
  const showGender = Preferences.get(P.showGender);
  document.documentElement.classList.toggle("showGender", showGender);
  loadCSS(css);

  const mnuImage = MessageNotificationUnit.prototype.image;
  MessageNotificationUnit.prototype.image = function image() {
    return genderIntercept.call(this, mnuImage);
  };

  const nuImage = NotificationUnit.prototype.image;
  NotificationUnit.prototype.image = function image() {
    return genderIntercept.call(this, nuImage);
  };

  const suBody = SearchUnit.prototype.body;
  SearchUnit.prototype.body = function body() {
    return genderIntercept.call(this, suBody);
  };

  const uuBody = UserUnit.prototype.body;
  UserUnit.prototype.body = function body() {
    return genderIntercept.call(this, uuBody);
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
    const { children } = div.props;
    const img = children[0];
    if (img?.type === "img") {
      img.props["data-gender"] = this.props.data.gender;
    }
    return div;
  };

  const mRender = Message.prototype.render;
  Message.prototype.render = function render() {
    const div = mRender.apply(this);
    if (div && typeof div === "object" && "props" in div)
      div.props.children[0].props.children.props["data-gender"] =
        notNum(this.props.data.user)?.gender ?? "";
    return div;
  };
}
