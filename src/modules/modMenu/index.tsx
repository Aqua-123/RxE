/* eslint-disable react/no-this-in-sfc */
import React from "react";
import styles from "./style.scss";
import { loadCSS } from "~src/utils";
import { hideUser } from "./ws";
import { Preferences, P } from "~src/preferences";
import { BanForm, reasonList } from "./components/banForm";
import { reportModOverride } from "./components/reportModeration";
import { pictureModerationOverride } from "./components/PictureModeration/pictureModeration";
import { spamModOverride } from "./components/spamModeration";

export function modFunctionInit() {
  loadCSS(styles);
  spamModOverride();
  reportModOverride();
  pictureModerationOverride();
  if (Preferences.get(P.hideFromGc))
    setTimeout(() => {
      hideUser();
    }, 1000);
  ModPanel.prototype.issue_ban_menu = function issueMenu() {
    return <BanForm reasons={reasonList} />;
  };
}
