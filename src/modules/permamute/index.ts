import { P, Preferences } from "~src/preferences";

export function permamute(permamuted: any[]) {
    if (Preferences.get(P.mutetoggle)) {
        if (typeof permamuted[0] !== 'undefined') {
            var muted = permamuted[0]
            for (var i = 0; i < muted.length; i++) {
                App.room.muted.push(parseInt(muted[i]));
                console.log(muted[i])
            }
        }
    }
}