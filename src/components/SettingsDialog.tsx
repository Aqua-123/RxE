import React from "react";
import { P, Preferences } from "~src/preferences";

import SettingsView from "./Settings";
import ThemesView from "./Themes";
import HacksView from "./Hacks";

import { Theme, useTheme } from "../themes";
import styles from "./style.module.scss";

type SettingsDialogState = {
  theme: Theme;
  hacks: {
    disableNags: boolean;
    enableModUI: boolean;
    universalFriend: boolean;
    fancyColors: boolean;
  };
  settings: {
    imgControl: boolean;
    imgProtect: boolean;
    showInfo: boolean;
  };
  needsReload: boolean;
};

export type SettingsDialogSettings = SettingsDialogState["settings"];
export type SettingsDialogHacks = SettingsDialogState["hacks"];

export default class SettingsDialog extends React.Component<
  {},
  SettingsDialogState
> {
  constructor() {
    super({});
    this.state = {
      theme: Preferences.get(P.theme) as Theme,
      ...(process.env.HACKS !== "OFF" && {
        hacks: {
          disableNags: Preferences.get(P.disableNags!),
          enableModUI: Preferences.get(P.enableModUI!),
          universalFriend: Preferences.get(P.universalFriend!),
          fancyColors: Preferences.get(P.fancyColors!)
        }
      }),
      settings: {
        imgControl: Preferences.get(P.imgControl),
        imgProtect: Preferences.get(P.imgProtect),
        showInfo: Preferences.get(P.showInfo)
      },
      needsReload: false
    } as SettingsDialogState;

    if (process.env.HACKS !== "OFF") {
      this.applyHacks = (obj: SettingsDialogHacks) => {
        const hacks = { ...this.state.hacks, ...obj };
        const keys = Object.keys(obj);
        keys.forEach(key => Preferences.set(P[key]!, obj[key]));
        this.setState({ hacks, needsReload: true });
      };
    }
  }
  applySettings = (obj: SettingsDialogSettings) => {
    const settings = { ...this.state.settings, ...obj };
    const keys = Object.keys(obj);
    keys.forEach(key => Preferences.set(P[key], obj[key]));
    this.setState({ settings, needsReload: true });
  };
  applyTheme = (theme: Theme) => {
    Preferences.set(P.theme, theme);
    useTheme();
    this.setState({ theme });
  };
  applyHacks!: (obj: SettingsDialogHacks) => void;
  render() {
    const { theme, settings, needsReload } = this.state;
    console.log("styles=", styles);
    return (
      <div>
        {/* <style type="text/css">{styles.toString()}</style> */}
        <SettingsView {...settings} applySettings={this.applySettings} />
        <ThemesView theme={theme} applyTheme={this.applyTheme} />
        {process.env.HACKS !== "OFF" && (
          <HacksView {...this.state.hacks} applyHacks={this.applyHacks} />
        )}
        {needsReload && (
          <div className={styles.reloadWarning}>
            You may need to reload the app for your changes to take effect.
          </div>
        )}
      </div>
    );
  }
}
