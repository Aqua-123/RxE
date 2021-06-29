import {
  BooleanPreference,
  StringPreference,
  PreferenceManager,
  ListPreference
} from "ts-preferences";
import { loggingResponseHandler } from "../lib/userscripter/lib/preferences";

import U from "~src/userscript";
import T from "~src/text";

export const P = {
  // settings
  theme: new StringPreference({
    key: "theme",
    label: T.preferences.theme.label,
    description: T.preferences.theme.description,
    default: "default",
    multiline: false
  }),
  ...(FEATURES.HACKS && {
    disableNags: new BooleanPreference({
      key: "disableNags",
      label: T.preferences.disableNags!.label,
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
    fancyColors: new BooleanPreference({
      key: "fancyColors",
      label: T.preferences.fancyColors!.label,
      default: true
    })
  }),
  imgControl: new BooleanPreference({
    key: "imgControl",
    label: T.preferences.imgControl.label,
    default: true
  }),
  imgProtect: new BooleanPreference({
    key: "imgProtect",
    label: T.preferences.imgProtect.label,
    default: true
  }),
  imgBlur: new BooleanPreference({
    key: "imgBlur",
    label: T.preferences.imgBlur.label,
    default: true
  }),
  showInfo: new BooleanPreference({
    key: "showInfo",
    label: T.preferences.showInfo.label,
    default: true
  }),
  antiSpam: new BooleanPreference({
    key: "antiSpam",
    label: T.preferences.antiSpam.label,
    default: true
  }),
  showGender: new BooleanPreference({
    key: "showGender",
    label: T.preferences.showGender.label,
    default: true
  }),
  // known images
  blockedHashes: new ListPreference<string>({
    key: "blockedHashes",
    label: "blockedHashes", // TODO: how is that useful?
    default: []
  }),
  savedPictures: new ListPreference<string>({
    key: "savedPictures",
    label: "savedPictures",
    default: []
  })
} as const;

export const Preferences = new PreferenceManager(
  P,
  U.id + "-preference-",
  loggingResponseHandler
);
