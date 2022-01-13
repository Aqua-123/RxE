/* eslint-disable */
import React from "react";
import { ListPreferenceMap, P, Preferences } from "~src/preferences";
import { setDiff } from "~src/utils";
/**
 * Updates mutes about to be saved.
 */
export function updateMutes(mute_list: Array<[number, string]>) {
    const mutes = new Set(mute_list.map(x => x[0]));
    const mutes_old = new Set(
        Preferences.get(P.permaMuteList).map(x => x[0])
    );
    const { added, removed } = setDiff(mutes_old, mutes);
    console.log(added, removed);
    for (const id of added) App.room.mute(id);
    for (const id of removed) App.room.unmute(id);
}

function permaMuteAdd(id: number, name: string) {
    const muted = new ListPreferenceMap(P.permaMuteList);
    muted.addItem(id, name);
    muted.destroy();
}

function permaMuteRemove(id: number) {
    const muted = new ListPreferenceMap(P.permaMuteList);
    muted.removeItem(id);
    muted.destroy();
}

export function initPermaMute() {
    App.room.muted.push(...Preferences.get(P.permaMuteList).map(x => x[0]));
    UserView.prototype.bottom = function permamute() {
        const id = this.state.user.id
        let muted = App.room.muted.includes(id);
        let permamuted = Preferences.get(P.permaMuteList).map(x => x[0]).includes(id)

        return React.createElement("div", {
            className: "user-profile-micro-bottom"
        },
            React.createElement("div", {
                onMouseDown: this.view_profile.bind(this),
                className: "user-profile-micro-button"
            }, "View Profile"), React.createElement("div", {
                onMouseDown: this.message.bind(this),
                className: "user-profile-micro-button"
            }, "Message"), this.mod_button(),
            React.createElement("div", {
                onMouseDown: muted ? this.unmute.bind(this) : this.mute.bind(this),
                className: "user-profile-micro-button",
                disabled: permamuted
            }, muted ? "Unmute" : "Mute"),
            React.createElement("div", {
                onMouseDown:
                    permamuted
                        ? this.permaunmute.bind(this)
                        : this.permamute.bind(this),
                className: "user-profile-micro-button"
            }, permamuted ? "Perma Unmute" : "Perma Mute"),
            React.createElement("div", {
                onMouseDown: this.close.bind(this),
                className: "user-profile-micro-button"
            }, "Close")
        );

    }
    UserView.prototype.permamute = function () {
        const { id, display_name } = this.state.user;
        permaMuteAdd(id, display_name);
        App.room.mute(id, display_name, "Permamuted by user");
        this.forceUpdate();
    }
    UserView.prototype.permaunmute = function () {
        const { id } = this.state.user;
        permaMuteRemove(id);
        App.room.unmute(id);
        this.forceUpdate();
    }

}

