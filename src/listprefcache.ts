/* eslint-disable max-classes-per-file */
import { AllowedTypes, ListPreference } from "ts-preferences";
import { Preferences } from "~src/preferences";

// eslint pls
// eslint-disable-next-line no-shadow
enum CacheLifeCycle {
  Created,
  Alive,
  Destroyed
}

const prefsInUse = new Map<string, ListPreferenceCache<any, any, any>>();
abstract class ListPreferenceCache<Store, Pref extends AllowedTypes, Item> {
  protected static ERR_PREF_IN_USE: string = `Cannot create multiple ListPreferenceCache instances \
    linked to the same preference. Hint: .destroy() the previous instance`;

  protected readonly preference: ListPreference<Pref>;

  protected state: CacheLifeCycle = CacheLifeCycle.Created;

  protected abstract realStore: Store;

  protected assertAlive() {
    if (this.state === CacheLifeCycle.Destroyed)
      throw new Error("Attempted to use destroyed ListPreferenceCache object");
    if (this.state === CacheLifeCycle.Created)
      throw new Error(
        "Attempted to use uninitialized ListPreferenceCache object"
      );
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
    this.assertAlive();
    this.state = CacheLifeCycle.Destroyed;
    if (this.preference) prefsInUse.delete(this.preference.key);
  }

  constructor(preference: ListPreference<Pref>, load: boolean = false) {
    this.preference = preference;
    if (load) this.load();
  }

  public abstract hasItem(item: Item): boolean;

  public abstract values(): Item[];

  protected abstract asSaved(): Pref[];

  protected abstract loadFrom(items: readonly Pref[]): void;

  load() {
    const { preference: pref } = this;
    if (prefsInUse.has(pref.key) && prefsInUse.get(pref.key) !== this)
      throw new Error(ListPreferenceCache.ERR_PREF_IN_USE);
    prefsInUse.set(pref.key, this);
    this.state = CacheLifeCycle.Alive;
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
  protected realStore!: Item[];

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
  protected realStore!: Set<Item>;

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
  protected realStore!: Map<Key, Item>;

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
