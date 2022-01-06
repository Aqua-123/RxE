/* eslint-disable */
import React from "react";
import { P, Preferences } from "~src/preferences";
export function permamute(permamuted: any[]) {
    if (Preferences.get(P.mutetoggle)) {
        if (typeof permamuted !== 'undefined') {
            var muted = permamuted
            for (var i = 0; i < muted.length; i++) {
                App.room.muted.push(parseInt(muted[i]));
                console.log(muted[i])
            }
        }
    }
}
function mute(permamuted: any[]) {
    if (Preferences.get(P.mutetoggle)) {
        if (typeof permamuted[0] !== 'undefined') {
            var muted = permamuted
            for (var i = 0; i < muted.length; i++) {
                App.room.muted.push(parseInt(muted[i]));
                console.log(muted[i])
            }
        }
    }
}
export function initpermamute() {
    UserView.prototype.bottom = function permamute() {
        var e = null;
        var f = null;
        var muted: number[] = [];
        const id = this.state.user.id
        muted = GM_getValue("mutelist", [])

        return e = -1 != App.room.muted.indexOf(this.state.user.id) ? React.createElement("div", {
            onMouseDown: this.unmute.bind(this),
            className: "user-profile-micro-button"
        }, "Unmute") : React.createElement("div", {
            onMouseDown: this.mute.bind(this),
            className: "user-profile-micro-button"
        }, "Mute"),
            f = muted.includes(id) == false ? React.createElement("div", {
                onMouseDown: this.PermaMute.bind(this),
                className: "user-profile-micro-button"
            }, "Perma Mute") :
                React.createElement("div", {
                    onMouseDown: this.PermaUnMute.bind(this),
                    className: "user-profile-micro-button"
                }, "Perma Unmute"),

            React.createElement("div", {
                className: "user-profile-micro-bottom"
            },
                React.createElement("div", {
                    onMouseDown: this.view_profile.bind(this),
                    className: "user-profile-micro-button"
                }, "View Profile"), React.createElement("div", {
                    onMouseDown: this.message.bind(this),
                    className: "user-profile-micro-button"
                }, "Message"), this.mod_button(),
                f,
                React.createElement("div", {
                    onMouseDown: this.close.bind(this),
                    className: "user-profile-micro-button"
                }, "Close"))

    }
    UserView.prototype.PermaMute = function () {

        var muted: string[] = [];
        muted = GM_getValue("mutelist", [])
        const id = this.state.user.id
        muted.push(String(id))
        var result = muted.map(function (x) {
            return parseInt(x, 10);
        });
        GM_setValue("mutelist", result);
        console.log(result)
        mute(result)
        React.createElement("div", {
            onMouseDown: this.PermaUnMute.bind(this),
            className: "user-profile-micro-button"
        }, "Perma Unmute")
    }
    UserView.prototype.PermaUnMute = function () {
        var muted: number[] = [];
        muted = GM_getValue("mutelist", [])
        const id = this.state.user.id
        var result = muted.map(function (x) {
            return String(x);
        });
        if (muted.includes(id)) {
            const index = muted.indexOf(id);
            if (index > -1) {
                muted.splice(index, 1);
            }
            GM_setValue("mutelist", muted);
            console.log(muted)

        }
    }

}

