/* eslint-disable max-classes-per-file */
import {
  BooleanPreference,
  StringPreference,
  PreferenceManager,
  ListPreference
} from "ts-preferences";
import { preferences } from "~userscripter";

import U from "~src/userscript";
import T from "~src/text";

const darkMode = matchMedia("(prefers-color-scheme: dark)").matches;

export const P = {
  // settings
  theme: new StringPreference({
    key: "theme",
    label: T.preferences.theme.label,
    description: T.preferences.theme.description,
    default: darkMode ? "ritsu" : "light",
    multiline: false
  }),
  ...(FEATURES.HACKS && {
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
    default: false
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
  })
} as const;

export const Preferences = new PreferenceManager(
  P,
  `${U.id}-preference-`,
  preferences.loggingResponseHandler
);

abstract class ListPreferenceCache<S> {
  protected readonly preference: ListPreference<string>;

  protected abstract store: S;

  constructor(preference: ListPreference<string>) {
    this.preference = preference;
  }

  public abstract has(item: string): boolean;

  public abstract get(): S;

  public abstract toArray(): string[];

  public abstract add(item: string): void;

  public abstract remove(item: string): boolean;

  protected abstract set(items: readonly string[]): void;

  load() {
    this.set(Preferences.get(this.preference));
  }

  protected save() {
    Preferences.set(this.preference, this.toArray());
  }
}

export class ListPreferenceArray extends ListPreferenceCache<string[]> {
  protected store: string[] = [];

  has(item: string) {
    return this.store.includes(item);
  }

  get() {
    return [...this.store];
  }

  toArray() {
    return this.store;
  }

  add(item: string) {
    this.store.push(item);
    this.save();
  }

  remove(item: string) {
    const index = this.store.indexOf(item);
    if (index === -1) return false;
    this.store.splice(index, 1);
    this.save();
    return true;
  }

  protected set(items: readonly string[]) {
    this.store = [...items];
  }
}

export class ListPreferenceObject extends ListPreferenceCache<
  Partial<Record<string, boolean>>
> {
  protected store: Partial<Record<string, boolean>> = {};

  has(item: string) {
    return Object.prototype.hasOwnProperty.call(this.store, item);
  }

  get() {
    return this.store;
  }

  toArray() {
    return Object.keys(this.store);
  }

  add(item: string) {
    this.store[item] = true;
    this.save();
  }

  remove(item: string) {
    const existed = this.has(item);
    delete this.store[item];
    this.save();
    return existed;
  }

  protected set(items: readonly string[]) {
    this.store = Object.fromEntries(items.map((item) => [item, true]));
  }
}
