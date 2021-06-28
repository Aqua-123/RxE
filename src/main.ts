import { log } from "../lib/userscripter";

import U from "~src/userscript";

import { useTheme } from "./themes";
import { accountOverrides } from "./modules/accountoverrides";
import { fixAppendPictures, initPictures } from "./modules/pictures";
import { render } from "./modules/render";
import { reorderMenu } from "./modules/reordermenu";
import { injectRitsuMenu } from "./modules/ritsumenu";
import { decorateHeader } from "./modules/header";
import { decoratePictures } from "./modules/pictures";
import { decorateProfileDialog } from "./modules/flaircolor";
import { addLookupButton } from "./modules/lookupbutton";
import { decorateMessages } from "./modules/messages";
import { removeAds } from "./modules/ads";
import { initNetwork } from "./modules/network";

function init() {
  const flags = [];
  if (FEATURES.HACKS) flags.push("HACKS");
  if (FEATURES.P2P) flags.push("P2P");
  const featureSet = flags.length ? `(${flags})` : "";
  log.log(`${U.name} Version ${U.version} ${featureSet}`);
  // override some builtin behavior
  accountOverrides();
  // inject network middleware
  initNetwork();
  // apply theme
  useTheme();
  // initialize picture control
  initPictures();
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
    fixAppendPictures
  ]);
}

init();
