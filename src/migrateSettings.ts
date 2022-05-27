import { log } from "~userscripter";
import { P, Preferences } from "./preferences";
import { PX } from "./x/preferences";

export function migrateSettings() {
  // eslint-disable-next-line camelcase
  if (typeof GM_getValue === "undefined") return;

  const themeToMigrate = GM_getValue("theme", false);
  if (themeToMigrate) {
    Preferences.set(P.theme, themeToMigrate);
    log.log("Migrated THEME");
    GM_deleteValue("theme");
  }
  const hacksToMigrate = GM_getValue<any>("hacks", false);
  if (hacksToMigrate) {
    Preferences.set(P.adBlocker, !!hacksToMigrate.disableNags);
    if (FEATURES.HACKS) {
      Preferences.set(PX?.superTemp!, !!hacksToMigrate.disableNags);
    }
    Preferences.set(P.fancyColors, !!hacksToMigrate.fancyColors);
    log.log("Migrated HACKS");
    GM_deleteValue("hacks");
  }
  const settingsToMigrate = GM_getValue<any>("settings", false);
  if (settingsToMigrate) {
    Preferences.set(P.imgControl, !!settingsToMigrate.imgControl);
    Preferences.set(P.imgProtect, !!settingsToMigrate.imgProtect);
    Preferences.set(P.showInfo, !!settingsToMigrate.showInfo);
    log.log("Migrated SETTINGS");
    GM_deleteValue("settings");
  }
  const blockedPicsToMigrate = GM_getValue<any>("blockedPictures", false);
  if (blockedPicsToMigrate instanceof Array) {
    const blockedHashes = [...Preferences.get(P.blockedHashes)];
    blockedPicsToMigrate.forEach((hash) => {
      if (!blockedHashes.includes(hash)) {
        blockedHashes.push(hash);
      }
    });
    Preferences.set(P.blockedHashes, blockedHashes);
    log.log("Migrated BLOCKED PICTURES");
    GM_deleteValue("blockedPictures");
  }
  const savedPicsToMigrate = GM_getValue<any>("savedPictures", false);
  if (savedPicsToMigrate instanceof Array) {
    const savedPictures = [...Preferences.get(P.savedPictures)];
    savedPicsToMigrate.forEach((url) => {
      if (savedPictures.includes(url)) return;
      savedPictures.push(url);
    });
    Preferences.set(P.savedPictures, savedPictures);
    log.log("Migrated SAVED PICTURES");
    GM_deleteValue("savedPictures");
  }
}
