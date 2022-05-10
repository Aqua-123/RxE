import React from "react";
import ReactDOM from "react-dom";
import { updatePicToAlbum } from "src/modules/newalbum";
import { uploadForm } from "src/modules/newsendpics/components";
import { parseImage, FORMATS } from "../altpfp/formats";
import { setBioImage } from "../altpfp/bio-image";
import { P, Preferences } from "~src/preferences";

const profileTabs = {
  feed: { name: "Feed" },
  info: { name: "Info" },
  pictures: { name: "Pictures" }
};

export function closeAndReload() {
  const { id } = App.user;
  MenuReactMicro.close();
  UserProfileReact?.load(id);
}
function tabElement(tab: keyof typeof profileTabs, active: boolean) {
  return React.createElement(
    "div",
    {
      onMouseDown: UserProfileReact?.switch_tab.bind(UserProfileReact, tab),
      className: active
        ? "user-profile-tab user-profile-tab-active"
        : "user-profile-tab"
    },
    profileTabs[tab].name
  );
}

function tabElements(...tabs: Array<keyof typeof profileTabs>) {
  return tabs.map((tabName) =>
    tabElement(tabName, UserProfileReact?.state.tab === tabName)
  );
}

export function albumFunctionality() {
  PictureAlbum.prototype.set_display_picture = function sdp(picture) {
    const { url } = picture;
    const { user } = App;
    const parsed = parseImage(url, FORMATS.IMGUR);
    if (!parsed) return;
    setBioImage(user, parsed);
    closeAndReload();
  };

  PictureAlbum.prototype.delete_picture = function deletePic(picture) {
    const url = parseImage(picture.url, FORMATS.IMGUR);
    const album = [...Preferences.get(P.imgurPfpAlbum)];
    if (!url || !album.includes(url)) return;
    album.splice(album.indexOf(url), 1);
    Preferences.set(P.imgurPfpAlbum, album);
    closeAndReload();
  };

  UserProfile.prototype.tabs = function tabs() {
    const shownUserId = this.state.data.user.id;
    if (shownUserId === App.user.id)
      return React.createElement(
        "div",
        null,
        ...tabElements("feed", "info", "pictures")
      );
    return React.createElement("div", null, ...tabElements("feed", "info"));
  };

  PictureAlbum.prototype.add_to_album = function addToAlbum() {
    PictureUploader.onUploaded = function onUploaded(picture) {
      const { url } = picture;
      updatePicToAlbum(url);
      closeAndReload();
    };
  };
  PictureAlbum.prototype.upload_picture = function uploadPicture() {
    ReactDOM.render(uploadForm(), document.getElementById("ui-hatch-2"));
  };
}
