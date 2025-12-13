import React from "react";
import { P, Preferences } from "~src/preferences";
import { loadCSS, notNum } from "~src/utils";
import css from "./style.scss";

function genderIntercept(this: any, element: () => JSX.Element) {
  let gender;
  let img = element.apply(this);
  if (!this.props.data) return img;
  // this is why you typecheck
  if (this.props.data.data?.sender) gender = this.props.data.data.sender.gender;
  if (this.props.data.gender) gender = this.props.data.gender;
  if (img.props.children) {
    const { children } = img.props;
    children[0].props["data-gender"] = gender;
    const newProps = img.props;
    newProps.children = children;
    img = React.cloneElement(img, newProps);
  }
  img = React.cloneElement(img, { "data-gender": gender });
  return img;
}

function addGenderToImg(
  element: React.ReactElement,
  gender: string
): React.ReactElement {
  if (!element || typeof element !== "object") return element;
  // If this is an img element, add data-gender
  if (element.type === "img") {
    return React.cloneElement(element, { "data-gender": gender });
  }
  // If element has children, process them recursively
  if (element.props && element.props.children) {
    const children = React.Children.map(element.props.children, (child) => {
      if (React.isValidElement(child)) {
        return addGenderToImg(child, gender);
      }
      return child;
    });
    return React.cloneElement(element, {}, children);
  }
  return element;
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
    return genderIntercept.call(this, fuBody);
  };

  const ruuBody = RoomUserUnit.prototype.body;
  RoomUserUnit.prototype.body = function body() {
    return genderIntercept.call(this, ruuBody);
  };

  const mRender = Message.prototype.render;
  Message.prototype.render = function render() {
    const div = mRender.apply(this);
    if (div && typeof div === "object" && "props" in div) {
      div.props.children[0].props.children = React.cloneElement(
        div.props.children[0].props.children,
        { "data-gender": notNum(this.props.data.user)?.gender ?? "" }
      );
    }
    return div;
  };

  // Add gender colors to user profile picture
  const originalProfilePicture = UserProfile.prototype.profile_picture;
  /* eslint-disable camelcase */
  UserProfile.prototype.profile_picture = function profile_picture() {
    const result = originalProfilePicture.apply(this);
    const gender = this.state?.data?.user?.gender || "";
    return addGenderToImg(result, gender);
  };

  // Add gender to UserView micro avatar (user-profile-micro-avatar)
  // This is the popup user menu
  if (UserView && UserView.prototype.top) {
    const originalUserViewTop = UserView.prototype.top;
    UserView.prototype.top = function top() {
      const result = originalUserViewTop.apply(this);
      const gender = this.state?.user?.gender || "";
      if (result && typeof result === "object" && "props" in result) {
        // Look for the user-profile-micro-avatar img and add data-gender
        return addGenderToImg(result, gender);
      }
      return result;
    };
  }
}
