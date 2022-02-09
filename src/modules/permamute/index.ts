import React from "react";
import { ListPreferenceMap } from "~src/listprefcache";
import { P, Preferences } from "~src/preferences";
import { setDiff } from "~src/utils";

/**
 * Updates mutes about to be saved.
 */
export function updateRoomMutes(permamuteList: Array<[number, string]>) {
  const permamutes = new Set(permamuteList.map((x) => x[0]));
  const permamutesOld = new Set(
    Preferences.get(P.permaMuteList).map((x) => x[0])
  );
  const { added, removed } = setDiff(permamutesOld, permamutes);
  added.forEach((id) => App.room.mute(id));
  removed.forEach((id) => App.room.unmute(id));
}

export function initPermaMute() {
  App.room.muted.push(...Preferences.get(P.permaMuteList).map((x) => x[0]));
  UserView.prototype.bottom = function permamute() {
    const { id } = this.state.user;
    const muted = App.room.muted.includes(id);
    const permamuted = Preferences.get(P.permaMuteList)
      .map((x) => x[0])
      .includes(id);

    return React.createElement(
      "div",
      {
        className: "user-profile-micro-bottom"
      },
      React.createElement(
        "div",
        {
          onMouseDown: this.view_profile.bind(this),
          className: "user-profile-micro-button"
        },
        "View Profile"
      ),
      React.createElement(
        "div",
        {
          onMouseDown: this.message.bind(this),
          className: "user-profile-micro-button"
        },
        "Message"
      ),
      this.mod_button(),
      React.createElement(
        "div",
        {
          onMouseDown: muted ? this.unmute.bind(this) : this.mute.bind(this),
          className: "user-profile-micro-button",
          disabled: permamuted
        },
        muted ? "Unmute" : "Mute"
      ),
      React.createElement(
        "div",
        {
          onMouseDown: permamuted
            ? this.permaunmute.bind(this)
            : this.permamute.bind(this),
          className: "user-profile-micro-button"
        },
        permamuted ? "Perma Unmute" : "Perma Mute"
      ),
      React.createElement(
        "div",
        {
          onMouseDown: this.close.bind(this),
          className: "user-profile-micro-button"
        },
        "Close"
      )
    );
  };
  UserView.prototype.permamute = function permamute() {
    const { id, display_name: name } = this.state.user;
    ListPreferenceMap.addItem({ key: id, item: name }, P.permaMuteList);
    App.room.mute(id, name, "Permamuted by user");
    // For blockreqs
    NotificationsReact.update();
    this.forceUpdate();
  };
  UserView.prototype.permaunmute = function permaunmute() {
    const { id } = this.state.user;
    ListPreferenceMap.removeItem({ key: id }, P.permaMuteList);
    App.room.unmute(id);
    NotificationsReact.update();
    this.forceUpdate();
  };
  // TODO: belongs in a more general file
  UserView.prototype.exit_click = function exitClick(e) {
    if (!(e.target instanceof HTMLElement)) return;
    if (!e.target.matches(".user-profile-micro, .user-profile-micro *"))
      this.close();
  };
}
