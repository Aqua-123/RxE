import U from "~src/userscript";
import { log } from "~userscripter";
import browserWindow from "./browserWindow";
import { migrateSettings } from "./migrateSettings";
import { initAdBlocker, removeAds, removeNewUIAd } from "./modules/ads";
import { initAntiBan } from "./modules/antiban";
import { initAntiSpam } from "./modules/chat/antispam";
import { initAudio } from "./modules/overrides/audio";
import { initPicturesBlur, applyBlurs } from "./modules/blur";
import { renderBrokenImages } from "./modules/rendering/brokenimages";
import { decorateProfileDialog } from "./modules/flaircolor";
import { initGender } from "./modules/rendering/gender";
import { decorateHeader, initHeader } from "./modules/rendering/header";
import { initKarmaTracker } from "./modules/karma";
import {
  betterMessageRendering,
  decorateMessages,
  hideTyping,
  initMessages
} from "./modules/chat/messages";
import { initNetwork } from "./modules/network";
import { applyOverrides } from "./modules/overrides";
import { decoratePictures, initPictures } from "./modules/rendering/pictures";
import { initPluginAPI } from "./modules/plugin";
import { render } from "./modules/render";
import { reorderMenu } from "./modules/reordermenu";
import { applySettings, injectRitsuMenu } from "./modules/settings";
import { initUserList } from "./modules/userlist";
import { renderWFAFAndPrivateRooms } from "./modules/wfaf";
import { until } from "./utils";
import { initPermaMute } from "./modules/chat/permamute";
import { initLoadMore } from "./modules/chat/fixloadmore";
import { initSendPics } from "./modules/chat/chat-image";
import { multiLineOverride } from "./modules/chat/multiline";
import * as blockreqs from "./modules/blockreqs";
import * as highlightMentions from "./modules/chat/highlightmentions/index";
import * as onbeforesend from "./modules/chat/onbeforesend";
import * as richText from "./modules/rendering/richtext";
import * as dev from "./modules/unobfuscate";
import { createEmbeds, initEmbeds } from "./modules/rendering/richtext/embeds";
import * as introModal from "./modules/settings/intro-dialog";
import { initversionCheck } from "./modules/versioncheck";
import { fixChatRoomWidth } from "./modules/rendering/chatroom";
import { modFunctionInit } from "./modules/modMenu";

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
  highlightMentions.init();
  richText.init();
  onbeforesend.init();
  introModal.init();
  initversionCheck();
  // start our script's rendering loop
  modFunctionInit();
  hideTyping();
  initEmbeds();
  initHeader();
  render([
    fixChatRoomWidth,
    applyBlurs,
    createEmbeds,
    reorderMenu,
    injectRitsuMenu,
    decorateHeader,
    decoratePictures,
    decorateProfileDialog,
    decorateMessages,
    removeAds,
    removeNewUIAd,
    renderBrokenImages,
    renderWFAFAndPrivateRooms
  ]);
}

init();
