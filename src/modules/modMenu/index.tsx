/* eslint-disable react/no-this-in-sfc */
import React from "react";
import styles from "./style.scss";
import { loadCSS } from "~src/utils";
import { hideUser } from "./ws";
import { Preferences, P } from "~src/preferences";
import { spamModOverride } from "./spamModeration";
import { BanForm } from "./banForm";
import { reportModOverride } from "./reportModeration";
import { pictureModerationOverride } from "./pictureModeration";

const reasons = [
  { value: "spam", label: "Multiple spam attempts in chat" },
  {
    value: "harassment",
    label: "Harassment, threats and/or abuse towards an user or group of users"
  },
  {
    value: "sexual_harassment",
    label: "Sexually explicit remarks towards an user or group of users"
  },
  {
    value: "csa",
    label: "Distribution/Promotion of illegal content involving CP/CSA"
  },
  {
    value: "inappropriate_content",
    label: "Distribution/Promotion of illegal/explicit content"
  },
  {
    value: "underage",
    label: "You must be +18 in order to use 1-on-1 chat"
  },
  {
    value: "racism",
    label: "Spreading derogatory words/racism/bigotry in chat"
  },
  { value: "other", label: "Other" }
];

export function modFunctionInit() {
  loadCSS(styles);
  spamModOverride();
  reportModOverride();
  pictureModerationOverride();
  if (Preferences.get(P.hideFromGc)) hideUser();
  ModPanel.prototype.issue_ban_menu = function issueMenu() {
    return <BanForm reasons={reasons} />;
  };
}
