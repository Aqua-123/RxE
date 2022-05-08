import React from "react";
import { parseImage, FORMATS } from "../altpfp/formats";
import { setBioImage } from "../altpfp/bio-image";
import { P, Preferences } from "~src/preferences";

export function albumFunctionality() {
  PictureAlbum.prototype.set_display_picture = function sdp(picture) {
    const { url } = picture;
    const { user } = App;
    const parsed = parseImage(url, FORMATS.IMGUR);
    if (!parsed) return;
    setBioImage(user, parsed);
    MenuReactMicro.close();
    this.forceUpdate();
    UserProfileReact?.load(user.id);
  };

  PictureAlbum.prototype.delete_picture = function deletePic(picture) {
    const { user } = App;
    const url = parseImage(picture.url, FORMATS.IMGUR);
    const album = Preferences.get(P.imgurPfpAlbum);
    if (url === null) return;
    if (!album.includes(url)) return;
    const newalbum = [...album];
    newalbum.splice(newalbum.indexOf(url), 1);
    Preferences.set(P.imgurPfpAlbum, newalbum);
    MenuReactMicro.close();
    UserProfileReact?.load(user.id);
  };

  UserProfile.prototype.tabs = function tabs() {
    const stateUserId = this.state.data.user.id;
    const { id } = App.user;
    let feed = React.createElement(
      "div",
      {
        onMouseDown: this.switch_tab.bind(this, "feed"),
        className: "user-profile-tab"
      },
      "Feed"
    );
    let info = React.createElement(
      "div",
      {
        onMouseDown: this.switch_tab.bind(this, "info"),
        className: "user-profile-tab"
      },
      "Info"
    );
    let pictures = React.createElement(
      "div",
      {
        onMouseDown: this.switch_tab.bind(this, "pictures"),
        className: "user-profile-tab"
      },
      "Pictures"
    );
    if (this.state.tab === "feed")
      feed = React.createElement(
        "div",
        {
          onMouseDown: this.switch_tab.bind(this, "feed"),
          className: "user-profile-tab user-profile-tab-active"
        },
        "Feed"
      );
    else if (this.state.tab === "info")
      info = React.createElement(
        "div",
        {
          onMouseDown: this.switch_tab.bind(this, "info"),
          className: "user-profile-tab user-profile-tab-active"
        },
        "Info"
      );
    else if (this.state.tab === "pictures")
      pictures = React.createElement(
        "div",
        {
          onMouseDown: this.switch_tab.bind(this, "tab"),
          className: "user-profile-tab user-profile-tab-active"
        },
        "Pictures"
      );
    if (id === stateUserId)
      return React.createElement("div", null, feed, info, pictures);
    return React.createElement("div", null, feed, info);
  };
}
