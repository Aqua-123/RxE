import { log } from "../lib/userscripter";

import U from "~src/userscript";

import { initTheme } from "./themes";
import { accountOverrides } from "./modules/accountoverrides";
import {
  fixAppendPictures,
  initPictures,
  decoratePictures
} from "./modules/pictures";
import { render } from "./modules/render";
import { reorderMenu } from "./modules/reordermenu";
import { injectRitsuMenu } from "./modules/ritsumenu";
import { decorateHeader } from "./modules/header";

import { decorateProfileDialog } from "./modules/flaircolor";
import { addLookupButton } from "./modules/lookupbutton";
import { decorateMessages } from "./modules/messages";
import { removeAds } from "./modules/ads";
import { initNetwork } from "./modules/network";
import { initPicturesBlur } from "./modules/blur";
import { initAntiSpam } from "./modules/antispam";
import { renderBrokenImages } from "./modules/brokenimages";
import { renderWFAFAndPrivateRooms } from "./modules/wfaf";
import { initGender } from "./modules/gender";

function init() {
  const featureSet = `(${[
    ...(FEATURES.HACKS ? ["HACKS"] : []),
    ...(FEATURES.P2P ? ["P2P"] : [])
  ]})`;
  log.log(`${U.name} Version ${U.version} ${featureSet}`);
  // override some builtin behavior
  accountOverrides();
  // inject network middleware
  initNetwork();
  // apply theme
  initTheme();
  // initialize picture control
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
    fixAppendPictures,
    renderBrokenImages,
    renderWFAFAndPrivateRooms
  ]);
}

init();
