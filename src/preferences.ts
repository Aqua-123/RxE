/* eslint-disable max-classes-per-file */
import {
  BooleanPreference,
  StringPreference,
  PreferenceManager,
  ListPreference,
  MultichoicePreference
} from "ts-preferences";
import { preferences } from "~userscripter";

import U from "~src/userscript";
import T from "~src/text";
import { PX } from "./x/preferences";

// eslint-disable-next-line no-shadow
export enum RequestBlockMode {
  None = 0,
  Hide = 1,
  Reject = 2
}

export const P = {
  // settings
  theme: new StringPreference({
    key: "theme",
    label: T.preferences.theme.label,
    description: T.preferences.theme.description,
    default: "ritsu",
    multiline: false
  }),
  adBlocker: new BooleanPreference({
    key: "adBlocker",
    label: T.preferences.adBlocker.label,
    default: true
  }),
  fancyColors: new BooleanPreference({
    key: "fancyColors",
    label: T.preferences.fancyColors!.label,
    default: true
  }),
  imgControl: new BooleanPreference({
    key: "imgControl",
    label: T.preferences.imgControl.label,
    default: true
  }),
  imgProtect: new BooleanPreference({
    key: "imgProtect",
    label: T.preferences.imgProtect.label,
    default: false
  }),
  imgBlur: new BooleanPreference({
    key: "imgBlur",
    label: T.preferences.imgBlur.label,
    default: true
  }),
  hidePfp: new BooleanPreference({
    key: "hidePfP",
    label: T.preferences.hidePfp.label,
    default: false
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
  permaMuteList: new ListPreference<[number, string]>({
    key: "permaMuteList",
    label: T.preferences.mutelist.label,
    default: []
  }),
  showGender: new BooleanPreference({
    key: "showGender",
    label: T.preferences.showGender.label,
    default: true
  }),
  trackKarma: new BooleanPreference({
    key: "trackKarma",
    label: T.preferences.trackKarma.label,
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
  }),
  // sort
  userSort: new StringPreference({
    key: "userSort",
    label: T.preferences.userSort.label,
    default: "name.asc",
    multiline: false
  }),
  blockReqs: new MultichoicePreference<RequestBlockMode>({
    key: "blockReqs",
    label: T.preferences.blockReqs.label,
    default: 0,
    options: [
      {
        value: RequestBlockMode.None,
        label: "Off"
      },
      {
        value: RequestBlockMode.Hide,
        label: "Hide"
      },
      {
        value: RequestBlockMode.Reject,
        label: "Reject"
      }
    ]
  }),
  highlightMentions: new BooleanPreference({
    key: "highlightMentions",
    label: T.preferences.highlightMentions.label,
    default: true
  }),
  altpfpBackground: new StringPreference({
    key: "altpfpBackground",
    label: T.preferences.altpfpBackground.label,
    default: "#fff",
    multiline: false
  }),
  bigEmoji: new BooleanPreference({
    key: "bigEmoji",
    label: T.preferences.bigEmoji.label,
    default: true
  }),
  toggleEmbeds: new BooleanPreference({
    key: "toggleEmbeds",
    label: T.preferences.toggleEmbeds.label,
    default: true
  }),
  largerText: new BooleanPreference({
    key: "largerText",
    label: T.preferences.largerText.label,
    default: false
  }),
  imgurLastUploadTimes: new ListPreference<number>({
    key: "imgurLastUploadTimes",
    label: "imgurLastUploadTimes",
    default: []
  }),
  imgurPfpAlbum: new ListPreference<string>({
    key: "imgurPfpAlbum",
    label: "imgurPfpAlbum",
    default: []
  }),
  hideImageFallback: new BooleanPreference({
    key: "hideImageFallback",
    label: T.preferences.hideImageFallback.label,
    default: false
  }),
  imgurDeleteHashes: new ListPreference<[string, string]>({
    key: "imgurDeleteHashes",
    label: "imgurDeleteHashes",
    default: []
  }),
  ignoreURLBlacklist: new BooleanPreference({
    key: "ignoreURLBlacklist",
    label: T.preferences.ignoreURLBlacklist.label,
    default: false
  }),
  imgurAPIKey: new StringPreference({
    key: "imgurAPIKey",
    label: T.preferences.imgurAPIKey.label,
    default: "",
    multiline: false
  }),
  muteRegexes: new ListPreference<{ source: string; flags: string }>({
    key: "muteRegexes",
    label: T.preferences.muteRegexes.label,
    default: []
  }),
  showAnimatedImages: new BooleanPreference({
    key: "showAnimatedImages",
    label: T.preferences.showAnimatedImages.label,
    default: false
  })
} as const;

export const PA = {
  ...P,
  ...PX
};

export const Preferences = new PreferenceManager(
  PA,
  `${U.id}-preference-`,
  preferences.loggingResponseHandler
);
