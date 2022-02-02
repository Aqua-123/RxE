import { BooleanPreference } from "ts-preferences";
import T from "~src/text";

export const PX = FEATURES.HACKS
  ? ({
      superTemp: new BooleanPreference({
        key: "superTemp",
        label: T.preferences.superTemp!.label,
        default: true
      }),
      enableModUI: new BooleanPreference({
        key: "enableModUI",
        label: T.preferences.enableModUI!.label,
        default: false
      }),
      universalFriend: new BooleanPreference({
        key: "universalFriend",
        label: T.preferences.universalFriend!.label,
        default: true
      }),
      antiBan: new BooleanPreference({
        key: "antiBan",
        label: T.preferences.antiBan!.label,
        default: true
      })
    } as const)
  : null;
