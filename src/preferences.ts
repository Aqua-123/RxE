/* eslint-disable max-classes-per-file */
import {
  BooleanPreference,
  StringPreference,
  PreferenceManager,
  ListPreference,
  AllowedTypes,
  MultichoicePreference
} from "ts-preferences";
import { preferences } from "~userscripter";

import U from "~src/userscript";
import T from "~src/text";

const darkMode = matchMedia("(prefers-color-scheme: dark)").matches;

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
    default: false
  }),
  altpfpBackground: new StringPreference({
    key: "altpfpBackground",
    label: T.preferences.altpfpBackground.label,
    default: "#fff",
    multiline: false
  })
} as const;

export const Preferences = new PreferenceManager(
  P,
  `${U.id}-preference-`,
  preferences.loggingResponseHandler
);

const preferencesInUse: Set<string> = new Set();
abstract class ListPreferenceCache<Store, Pref extends AllowedTypes, Item> {
  protected readonly preference: ListPreference<Pref>;

  protected alive: boolean = true;

  protected abstract realStore: Store;

  protected assertAlive() {
    if (!this.alive)
      throw new Error("Attempted to use destroyed ListPreferenceCache object");
  }

  protected get store(): Store {
    this.assertAlive();
    return this.realStore;
  }

  protected set store(store: Store) {
    this.assertAlive();
    this.realStore = store;
  }

  public destroy() {
    this.alive = false;
    preferencesInUse.delete(this.preference.key);
  }

  constructor(preference: ListPreference<Pref>, load: boolean = false) {
    if (preferencesInUse.has(preference.key))
      throw new Error(`Cannot create multiple ListPreferenceCache instances linked to the same preference.
Hint: Clean up the previous instance using .destroy()`);
    this.preference = preference;
    preferencesInUse.add(preference.key);
    if (load) this.load();
  }

  public abstract hasItem(item: Item): boolean;

  public abstract values(): Item[];

  protected abstract asSaved(): Pref[];

  protected abstract loadFrom(items: readonly Pref[]): void;

  load() {
    this.loadFrom(Preferences.get(this.preference));
  }

  protected save() {
    Preferences.set(this.preference, this.asSaved());
  }
}

abstract class ListPreferenceCacheKeyed<
  Store,
  Pref extends AllowedTypes,
  Key extends AllowedTypes,
  Item extends AllowedTypes
  // eslint-disable-next-line prettier/prettier
  > extends ListPreferenceCache<Store, Pref, Item> {
  public abstract hasKey(key: Key): boolean;

  public abstract getItem(key: Key): Item | undefined;

  public abstract entries(): Array<[Key, Item]>;

  public setItem(key: Key, item: Item) {
    this._setItem(key, item);
    this.save();
  }

  public addItem(key: Key, item: Item) {
    this.setItem(key, item);
  }

  protected abstract _setItem(key: Key, item: Item): void;

  public removeItem(key: Key) {
    const existed = this._removeItem(key);
    this.save();
    return existed;
  }

  protected abstract _removeItem(key: Key): boolean;
}

abstract class ListPreferenceCacheUnkeyed<
  Store,
  Pref extends AllowedTypes,
  Item extends AllowedTypes
  // eslint-disable-next-line prettier/prettier
  > extends ListPreferenceCache<Store, Pref, Item> {
  public add(item: Item): void {
    this._add(item);
    this.save();
  }

  protected abstract _add(item: Item): void;

  public remove(item: Item): boolean {
    const existed = this._remove(item);
    this.save();
    return existed;
  }

  protected abstract _remove(item: Item): boolean;
}

export class ListPreferenceArray<
  Item extends AllowedTypes
  // eslint-disable-next-line prettier/prettier
  > extends ListPreferenceCacheKeyed<Item[], Item, number, Item> {
  protected realStore: Item[] = [];

  hasKey(key: number) {
    return key in this.store;
  }

  hasItem(item: Item) {
    return this.store.includes(item);
  }

  getItem(key: number): Item | undefined {
    return this.store[key];
  }

  protected _setItem(key: number, item: Item) {
    this.store[key] = item;
  }

  protected _removeItem(key: number) {
    return delete this.store[key];
  }

  values() {
    return [...this.store];
  }

  entries() {
    return [...this.store.entries()];
  }

  /*
  protected _add(item: Item) { this.store.push(item); }

  protected _remove(item: Item) {
    const index = this.store.indexOf(item);
    if (index === -1) return false;
    this.store.splice(index, 1);
    return true;
  }
  */

  protected asSaved() {
    return this.values();
  }

  protected loadFrom(items: readonly Item[]) {
    this.store = [...items];
  }
}

export class ListPreferenceSet<
  Item extends AllowedTypes
  // eslint-disable-next-line prettier/prettier
  > extends ListPreferenceCacheUnkeyed<Set<Item>, Item, Item> {
  protected realStore: Set<Item> = new Set();

  hasItem(item: Item) {
    return this.store.has(item);
  }

  // eslint-disable-next-line class-methods-use-this
  hasKey(_key: null) {
    return false;
  }

  values() {
    return [...this.store.values()];
  }

  entries() {
    return this.values();
  }

  protected _add(item: Item) {
    this.store.add(item);
  }

  protected _remove(item: Item) {
    return this.store.delete(item);
  }

  protected asSaved() {
    return this.values();
  }

  protected loadFrom(items: readonly Item[]) {
    this.store = new Set(items);
  }
}

// Gotta love it when DictionaryPreference<string, string> doesn't compile so you do this
export class ListPreferenceMap<
  Key extends AllowedTypes,
  Item extends AllowedTypes
  // eslint-disable-next-line prettier/prettier
  > extends ListPreferenceCacheKeyed<Map<Key, Item>, [Key, Item], Key, Item> {
  protected realStore: Map<Key, Item> = new Map();

  hasKey(key: Key) {
    return this.store.has(key);
  }

  hasItem(item: Item) {
    return this.values().some((value) => value === item);
  }

  getItem(key: Key) {
    return this.store.get(key);
  }

  protected _removeItem(key: Key) {
    return this.store.delete(key);
  }

  protected _setItem(key: Key, item: Item) {
    return this.store.set(key, item);
  }

  values() {
    return [...this.store.values()];
  }

  entries() {
    return [...this.store.entries()];
  }

  protected asSaved() {
    return [...this.store.entries()];
  }

  protected loadFrom(data: Array<[Key, Item]>) {
    this.store = new Map(data);
  }
}
