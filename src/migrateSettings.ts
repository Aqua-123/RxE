import { P, Preferences } from "./preferences";

declare function GM_getValue<T extends any>(key: string, defaultValue: T): T;
declare function GM_deleteValue(key: string): void;

export function migrateSettings() {
  if (typeof GM_getValue === "undefined") return;

  const themeToMigrate = GM_getValue("theme", false);
  if (themeToMigrate) {
    Preferences.set(P.theme, themeToMigrate);
    console.log("Migrated THEME");
    GM_deleteValue("theme");
  }
  const hacksToMigrate = GM_getValue<any>("hacks", false);
  if (hacksToMigrate) {
    Preferences.set(P.adBlocker, !!hacksToMigrate.disableNags);
    if (FEATURES.HACKS) {
      Preferences.set(P.superTemp!, !!hacksToMigrate.disableNags);
    }
    Preferences.set(P.fancyColors, !!hacksToMigrate.fancyColors);
    console.log("Migrated HACKS");
    GM_deleteValue("hacks");
  }
  const settingsToMigrate = GM_getValue<any>("settings", false);
  if (settingsToMigrate) {
    Preferences.set(P.imgControl, !!settingsToMigrate.imgControl);
    Preferences.set(P.imgProtect, !!settingsToMigrate.imgProtect);
    Preferences.set(P.showInfo, !!settingsToMigrate.showInfo);
    console.log("Migrated SETTINGS");
    GM_deleteValue("settings");
  }
  const blockedPicsToMigrate = GM_getValue<any>("blockedPictures", false);
  if (blockedPicsToMigrate instanceof Array) {
    const blockedHashes = [...Preferences.get(P.blockedHashes)];
    for (const hash of blockedPicsToMigrate) {
      if (!blockedHashes.includes(hash)) {
        blockedHashes.push(hash);
      }
    }
    Preferences.set(P.blockedHashes, blockedHashes);
    console.log("Migrated BLOCKED PICTURES");
    GM_deleteValue("blockedPictures");
  }
  const savedPicsToMigrate = GM_getValue<any>("savedPictures", false);
  if (savedPicsToMigrate instanceof Array) {
    const savedPictures = [...Preferences.get(P.savedPictures)];
    for (const url of savedPicsToMigrate) {
      if (!savedPictures.includes(url)) {
        savedPictures.push(url);
      }
    }
    Preferences.set(P.savedPictures, savedPictures);
    console.log("Migrated SAVED PICTURES");
    GM_deleteValue("savedPictures");
  }
}
