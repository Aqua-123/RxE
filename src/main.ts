import { log } from "../lib/userscripter";

import U from "~src/userscript";

import { useTheme } from "./themes";
import { accountOverrides } from "./modules/accountoverrides";
import { initPictures } from "./modules/pictures";
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
  log.log(`Version ${U.version}`);
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
    removeAds
  ]);
}

init();
