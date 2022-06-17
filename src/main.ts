import U from "~src/userscript";
import { log } from "~userscripter";
import browserWindow from "./browserWindow";
import { migrateSettings } from "./migrateSettings";
import { initAdBlocker, removeAds } from "./modules/ads";
// import { initPictureAlbum } from "./modules/album";
import { initPictureAlbum } from "./modules/newalbum";
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
  initMessages,
  markTextOnly
} from "./modules/messages";
import { initNetwork } from "./modules/network";
import { applyOverrides } from "./modules/overrides";
import { decoratePictures, initPictures } from "./modules/pictures";
import { initPluginAPI } from "./modules/plugin";
import { render } from "./modules/render";
import { reorderMenu } from "./modules/reordermenu";
// import { initSendPictures } from "./modules/sendpictures";
import { applySettings, injectRitsuMenu } from "./modules/settings";
import { initUserList } from "./modules/userlist";
import { renderWFAFAndPrivateRooms } from "./modules/wfaf";
import { until } from "./utils";
import { initPermaMute } from "./modules/permamute";
import { initLoadMore } from "./modules/fixloadmore";
import { initSendPics } from "./modules/newsendpics";
import { multiLineOverride } from "./modules/multiline";
import * as altpfp from "./modules/altpfp";
import * as blockreqs from "./modules/blockreqs";
import * as highlightMentions from "./modules/highlightmentions/index";
import * as onbeforesend from "./modules/onbeforesend";
import * as richText from "./modules/richtext";
import * as dev from "./modules/dev";
import { createEmbeds } from "./modules/embeds";
import * as introModal from "./modules/settings/intro-dialog";

async function init() {
  const featureSet = `(${[
    ...(FEATURES.HACKS ? ["HACKS"] : []),
    ...(FEATURES.P2P ? ["P2P"] : [])
  ]})`;
  log.log(`${U.name} Version ${U.version} ${featureSet}`);

  blockreqs.early();

  // Wait for App to be loaded.
  await until(() => !!browserWindow.App);

  dev.init();
  // override some builtin behavior
  applyOverrides();
  // migrate settings from older userscripts, if any
  migrateSettings();

  // extensible plugin framework thingy
  initPluginAPI();

  // override some builtin behavior
  // applyOverrides();
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
  // karma tracker
  initKarmaTracker();
  // anti-spam
  initAntiSpam();
  // decorate user icons with gendered borders
  initGender();
  // improve message rendering performance/behavior
  betterMessageRendering();
  // fix load more
  initLoadMore();

  initUserList();
  initPermaMute();
  initSendPics();
  multiLineOverride();
  altpfp.init();
  highlightMentions.init();
  richText.init();
  onbeforesend.init();
  introModal.init();
  // decorateHeader();
  // start our script's rendering loop
  render([
    markTextOnly,
    createEmbeds,
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
