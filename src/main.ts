import { log } from "../lib/userscripter";

import U from "~src/userscript";

import { initPictures, decoratePictures } from "./modules/pictures";
import { render } from "./modules/render";
import { reorderMenu } from "./modules/reordermenu";
import { decorateHeader } from "./modules/header";

import { decorateProfileDialog } from "./modules/flaircolor";
import { addLookupButton } from "./modules/lookupbutton";
import { initAdBlocker, removeAds } from "./modules/ads";
import { initNetwork } from "./modules/network";
import { initPicturesBlur } from "./modules/blur";
import { initAntiSpam } from "./modules/antispam";
import { renderBrokenImages } from "./modules/brokenimages";
import { renderWFAFAndPrivateRooms } from "./modules/wfaf";
import { initGender } from "./modules/gender";
import { initAntiBan } from "./modules/antiban";
import { applySettings, injectRitsuMenu } from "./modules/settings";
import { applyOverrides } from "./modules/overrides";
import { decorateMessages, initMessages } from "./modules/messages";
import { migrateSettings } from "./migrateSettings";
import { until } from "./utils";
import browserWindow from "./browserWindow";

async function init() {
  const featureSet = `(${[
    ...(FEATURES.HACKS ? ["HACKS"] : []),
    ...(FEATURES.P2P ? ["P2P"] : [])
  ]})`;
  log.log(`${U.name} Version ${U.version} ${featureSet}`);
  // Wait for App to be loaded.
  await until(() => !!browserWindow.App);
  // migrate settings from older userscripts, if any
  migrateSettings();
  // override some builtin behavior
  applyOverrides();
  // inject network middleware
  initNetwork();
  // antiban
  initAntiBan();
  // ad blocker
  initAdBlocker();
  // apply settings and theme
  applySettings();
  // initialize message and picture control
  initMessages();
  initPictures();
  initPicturesBlur();
  // anti-spam
  initAntiSpam();
  // decorate user icons with gendered borders
  initGender();

  // start our script's rendering loop
  render([
    reorderMenu,
    injectRitsuMenu,
    decorateHeader,
    decoratePictures,
    decorateProfileDialog,
    addLookupButton,
    decorateMessages,
    removeAds,
    renderBrokenImages,
    renderWFAFAndPrivateRooms
  ]);
}

init();
