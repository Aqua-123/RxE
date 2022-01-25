/* eslint-disable */
import React from "react";
import ReactDOM from "react-dom";
import RitsuDialog from "~src/components/RitsuDialog";
import { crel } from "~src/utils";
import { P, Preferences } from "~src/preferences";
import { initTheme, Theme } from "~src/themes";

export function getSettings() {
  return {
    theme: Preferences.get(P.theme) as Theme,
    ...(FEATURES.HACKS && {
      hacks_: {
        superTemp: Preferences.get(P.superTemp!),
        enableModUI: Preferences.get(P.enableModUI!),
        universalFriend: Preferences.get(P.universalFriend!),
        antiBan: Preferences.get(P.antiBan!)
      }
    }),
    settings: {
      adBlocker: Preferences.get(P.adBlocker),
      trackKarma: Preferences.get(P.trackKarma),
      fancyColors: Preferences.get(P.fancyColors!),
      imgControl: Preferences.get(P.imgControl),
      imgProtect: Preferences.get(P.imgProtect),
      imgBlur: Preferences.get(P.imgBlur),
      hidePfp: Preferences.get(P.hidePfp),
      showInfo: Preferences.get(P.showInfo),
      showGender: Preferences.get(P.showGender),
      antiSpam: Preferences.get(P.antiSpam),
      permaMuteList: Preferences.get(P.permaMuteList),
      blockReqs: Preferences.get(P.blockReqs),
      highlightMentions: Preferences.get(P.highlightMentions),
      bigEmoji: Preferences.get(P.bigEmoji)
    }
  };
}

export type SettingsType = Required<ReturnType<typeof getSettings>>;

export function applySettings() {
  const settings = getSettings();
  let obj: Record<string, any>;
  if (FEATURES.HACKS) {
    obj = { ...settings.settings, ...settings.hacks_ };
  } else {
    obj = settings.settings;
  }
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "boolean") {
      document.documentElement.classList.toggle(key, obj[key]);
    }
  });
  NotificationsReact?.update();
  initTheme();
}

export function openSettings() {
  ReactDOM.render(<RitsuDialog />, document.getElementById("ui-hatch"));
}

export function injectRitsuMenu() {
  const ritsuMenu = document.querySelector(".navigation-dropdown-ritsu");
  const dropdownContent = document.querySelector(".navigation-dropdown-content");
  if (!ritsuMenu && dropdownContent) {
    /* i give up
    const settingsButton = dropdownContent.parentElement?.children[0]
    if (settingsButton instanceof HTMLElement)
      settingsButton.style.color = "var(--ritsu-menu-fg-color)";
      */
    dropdownContent.prepend(
      crel("li", {
        className: "navigation-dropdown-ritsu",
        textContent: "Ritsu Menu",
        onmousedown: openSettings
      })
    );
  }
}
