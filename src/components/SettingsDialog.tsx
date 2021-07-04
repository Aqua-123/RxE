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
  }

  applySettings = (obj: SettingsDialogSettings) => {
    const { settings } = this.state;
    const newSettings = { ...settings, ...obj };
    const keys = Object.keys(obj);
    keys.forEach((key) => Preferences.set(P[key], obj[key]));
    applySettings();

    this.setState({ settings: newSettings, needsReload: true });
  };

  applyTheme = (theme: Theme) => {
    Preferences.set(P.theme, theme);
    document.body.classList.add("themeChange");
    initTheme();
    this.setState({ theme });
    setTimeout(() => document.body.classList.remove("themeChange"), 1000);
  };

  applyHacks = (obj: SettingsDialogHacks) => {
    if (FEATURES.HACKS) {
      const { hacks } = this.state;
      const newHacks = { ...hacks, ...obj };
      const keys = Object.keys(obj);
      keys.forEach((key) => Preferences.set(P[key]!, obj[key]));
      applySettings();
      this.setState({ hacks: newHacks, needsReload: true });
    }
  };

  render() {
    const { theme, settings, hacks, needsReload } = this.state;
    return (
      <div>
        <SettingsView {...settings} applySettings={this.applySettings} />
        <ThemesView theme={theme} applyTheme={this.applyTheme} />
        {FEATURES.HACKS && (
          <HacksView {...hacks} applyHacks={this.applyHacks} />
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
