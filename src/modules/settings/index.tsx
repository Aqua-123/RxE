/* eslint-disable */
import React from "react";
import ReactDOM from "react-dom";
import RitsuDialog from "~src/components/RitsuDialog";
import { crel, mapValues, pickValues } from "~src/utils";
import { Preferences, P } from "~src/preferences";
import { PX } from "~src/x/preferences";
import { initTheme, Theme } from "~src/themes";
import {
  BooleanPreference as BooleanPreference,
  Preference
} from "ts-preferences";

function booleanSettings<
  K extends string | number | symbol,
  T extends Record<K, Preference<any>>
>(prefDict: T): Record<KeysOfType<T, BooleanPreference>, boolean> {
  return mapValues(pickValues(prefDict, BooleanPreference), (_, pref) =>
    Preferences.get(pref)
  );
}

export function getSettings() {
  return {
    theme: Preferences.get(P.theme) as Theme,
    ...(FEATURES.HACKS && {
      hacks_: booleanSettings(PX!)
    }),
    settings: {
      ...booleanSettings(P),
      muteRegexes: Preferences.get(P.muteRegexes),
      imgurAPIKey: Preferences.get(P.imgurAPIKey),
      blockReqs: Preferences.get(P.blockReqs),
      permaMuteList: Preferences.get(P.permaMuteList)
    }
  };
}

export type SettingsType = Required<ReturnType<typeof getSettings>>;

export function applySettings() {
  const settings = getSettings();
  const obj = FEATURES.HACKS
    ? { ...settings.settings, ...settings.hacks_ }
    : (settings.settings as Record<string, any>);
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] !== "boolean") return;
    document.documentElement.classList.toggle(key, obj[key]);
  });
  initTheme();
}

export function openSettings() {
  ReactDOM.render(<RitsuDialog />, document.getElementById("ui-hatch"));
}

export function injectRitsuMenu() {
  const ritsuMenu = document.querySelector(".navigation-dropdown-ritsu");
  const dropdownContent = document.querySelector(
    ".navigation-dropdown-content"
  );
  if (ritsuMenu || !dropdownContent) return;
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
