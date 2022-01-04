/* eslint-disable */
import U from "~src/userscript";
import { log } from "~userscripter";
import browserWindow from "./browserWindow";
import { migrateSettings } from "./migrateSettings";
import { initAdBlocker, removeAds } from "./modules/ads";
import { initPictureAlbum } from "./modules/album";
import { initAntiBan } from "./modules/antiban";
import { initAntiSpam } from "./modules/antispam";
import { initAudio } from "./modules/audio";
import { initPicturesBlur } from "./modules/blur";
import { renderBrokenImages } from "./modules/brokenimages";
import { decorateProfileDialog } from "./modules/flaircolor";
import { initGender } from "./modules/gender";
import { decorateHeader } from "./modules/header";
import { initHideProfilePictures } from "./modules/hidePfp";
import { initKarmaTracker } from "./modules/karma";
import {
  betterMessageRendering,
  decorateMessages,
  initMessages
} from "./modules/messages";
import { initNetwork } from "./modules/network";
import { applyOverrides } from "./modules/overrides";
import { decoratePictures, initPictures } from "./modules/pictures";
import { initPluginAPI } from "./modules/plugin";
import { render } from "./modules/render";
import { reorderMenu } from "./modules/reordermenu";
import { initSendPictures } from "./modules/sendpictures";
import { applySettings, injectRitsuMenu } from "./modules/settings";
import { initUserList } from "./modules/userlist";
import { renderWFAFAndPrivateRooms } from "./modules/wfaf";
import { until } from "./utils";
import { permamute } from "./modules/permamute"
import { initLoadMore } from "./modules/fixloadmore"
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

  // extensible plugin framework thingy
  initPluginAPI();

  // override some builtin behavior
  applyOverrides();
  // inject network middleware
  initNetwork();
  // antiban
  initAntiBan();
  // ad blocker
  initAdBlocker();
  // audio tweaks
  initAudio();
  // apply settings and theme
  applySettings();
  // initialize message and picture control
  initMessages();
  initPictures();
  initPicturesBlur();
  initHideProfilePictures();
  initPictureAlbum();
  initSendPictures();
  // karma tracker
  initKarmaTracker();
  // anti-spam
  initAntiSpam();
  // decorate user icons with gendered borders
  initGender();
  // improve message rendering performance/behavior
  betterMessageRendering();
  initLoadMore();
  initUserList();
  permamute(GM_getValue("mutelist", []));
  // start our script's rendering loop
  render([
    reorderMenu,
    injectRitsuMenu,
    decorateHeader,
    decoratePictures,
    decorateProfileDialog,
    decorateMessages,
    removeAds,
    renderBrokenImages,
    renderWFAFAndPrivateRooms
  ]);
}

init();
