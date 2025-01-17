/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from "react";
import { ListPreferenceMap } from "~src/listprefcache";
import { P, Preferences } from "~src/preferences";
import { setDiff } from "~src/utils";
import { clearRating } from "~src/modules/chat/antispam";
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

    return (
      <div className="user-profile-micro-bottom">
        <div
          onMouseDown={this.view_profile.bind(this)}
          className="user-profile-micro-button"
        >
          View Profile
        </div>
        <div
          onMouseDown={this.message.bind(this, "message")}
          className="user-profile-micro-button"
        >
          Message
        </div>
        <div
          onMouseDown={this.message.bind(this, "video")}
          className="user-profile-micro-button"
        >
          Video Call
        </div>
        {this.mod_button()}
        <div
          onMouseDown={() => {
            if (permamuted) return undefined;
            if (muted) return this.unmute.bind(this);
            return this.mute.bind(this);
          }}
          onKeyDown={muted ? this.unmute.bind(this) : this.mute.bind(this)}
          onClick={muted ? this.unmute.bind(this) : this.mute.bind(this)}
          className={`user-profile-micro-button ${
            permamuted ? "disabled" : ""
          }`}
        >
          {muted ? "Unmute" : "Mute"}
        </div>
        <div
          onMouseDown={
            permamuted ? this.permaunmute.bind(this) : this.permamute.bind(this)
          }
          onKeyDown={
            permamuted ? this.permaunmute.bind(this) : this.permamute.bind(this)
          }
          onClick={
            permamuted ? this.permaunmute.bind(this) : this.permamute.bind(this)
          }
          className="user-profile-micro-button"
        >
          {permamuted ? "Perma Unmute" : "Perma Mute"}
        </div>
        <div
          onMouseDown={this.report_type.bind(this)}
          className="user-profile-micro-button"
        >
          Report
        </div>
        <div
          onMouseDown={this.close.bind(this)}
          className="user-profile-micro-button"
        >
          Close
        </div>
      </div>
    );
  };
  function updateEverything() {
    NotificationsReact.update();
    UserViewReact?.forceUpdate();
    RoomClient?.forceUpdate();
  }
  UserView.prototype.permamute = function permamute() {
    const { id, display_name: name } = this.state.user;
    ListPreferenceMap.addItem({ key: id, item: name }, P.permaMuteList);
    App.room.mute(id, name, "Permamuted by user");
    updateEverything();
  };
  UserView.prototype.permaunmute = function permaunmute() {
    const { id, display_name: name } = this.state.user;
    ListPreferenceMap.removeItem({ key: id }, P.permaMuteList);
    App.room.unmute(id, name, "Permamuted by user");
    updateEverything();
    clearRating(id);
  };
  UserView.prototype.mute = function mute() {
    App.room.mute(
      this.state.user.id,
      this.state.user.display_name,
      "Muted by user"
    );
    // UserViewReact?.setState({ muted: true });
    this.setState({ muted: true });
    updateEverything();
  };
  UserView.prototype.unmute = function unmute() {
    const { id } = this.state.user;
    App.room.unmute(id, this.state.user.display_name, "Unmuted by user");
    this.setState({ muted: false });
    // UserViewReact?.setState({ muted: false });
    updateEverything();
    clearRating(id);
  };
}
