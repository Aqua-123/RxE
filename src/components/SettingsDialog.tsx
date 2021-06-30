import React from "react";
import { P, Preferences } from "~src/preferences";

import SettingsView from "./Settings";
import ThemesView from "./Themes";
import HacksView from "./Hacks";

import { Theme, initTheme } from "../themes";
import styles from "./style.module.scss";
import {
  applySettings,
  getSettings,
  SettingsType
} from "~src/modules/settings";

type SettingsDialogState = SettingsType & {
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
      ...getSettings(),
      needsReload: false
    } as SettingsDialogState;
    if (FEATURES.HACKS) {
      this.applyHacks = (obj: SettingsDialogHacks) => {
        const hacks = { ...this.state.hacks, ...obj };
        const keys = Object.keys(obj);
        keys.forEach((key) => Preferences.set(P[key]!, obj[key]));
        applySettings();
        this.setState({ hacks, needsReload: true });
      };
    }
  }
  applySettings = (obj: SettingsDialogSettings) => {
    const settings = { ...this.state.settings, ...obj };
    const keys = Object.keys(obj);
    keys.forEach((key) => Preferences.set(P[key], obj[key]));
    applySettings();

    this.setState({ settings, needsReload: true });
  };
  applyTheme = (theme: Theme) => {
    Preferences.set(P.theme, theme);
    document.body.classList.add("themeChange");
    initTheme();
    this.setState({ theme });
    setTimeout(() => document.body.classList.remove("themeChange"), 1000);
  };
  applyHacks!: (obj: SettingsDialogHacks) => void;
  render() {
    const { theme, settings, needsReload } = this.state;
    return (
      <div>
        {/* <style type="text/css">{styles.toString()}</style> */}
        <SettingsView {...settings} applySettings={this.applySettings} />
        <ThemesView theme={theme} applyTheme={this.applyTheme} />
        {FEATURES.HACKS && (
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
