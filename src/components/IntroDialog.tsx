import React from "react";
import { P, Preferences, RequestBlockMode } from "~src/preferences";
import styles from "./style.module.scss";
import T from "~src/text";
import ThemesView from "./Themes";
import { initTheme, Theme } from "~src/themes";

import { getSettings } from "~src/modules/settings";

export const CURRENT_INTRO_VERSION = 1;

type Preset = "safe" | "normal" | "unsafe";
const PRESETS: Preset[] = ["safe", "normal", "unsafe"];

type IntroDialogState = {
  theme: Theme;
  preset: Preset;
};

type PresetProps = {
  preset: Preset;
  applyPreset(preset: Preset): void;
};

function PresetView({ preset: presetCurrent, applyPreset }: PresetProps) {
  return (
    <div>
      <div className={`m1 ${styles.settingsSection}`}>
        {T.introduction.presetsTitle}
      </div>
      {PRESETS.map((preset) => (
        <div>
          <input
            type="radio"
            id={`ritsu-preset-${preset}`}
            name="preset"
            value={preset}
            checked={preset === presetCurrent}
            onChange={() => applyPreset(preset)}
          />
          <label htmlFor={`ritsu-preset-${preset}`}>
            {T.introduction.presets[preset].title}
            <br />
          </label>
          <div className="notification-menu-container-text">
            {T.introduction.presets[preset].content}
          </div>
          <br />
        </div>
      ))}
    </div>
  );
}

export class IntroDialog extends React.Component<{}, IntroDialogState> {
  constructor() {
    super({});
    const { theme } = getSettings();
    this.state = { theme, preset: "normal" };
  }

  applyTheme = (theme: Theme) => {
    Preferences.set(P.theme, theme);
    document.body.classList.add("themeChange");
    initTheme();
    this.setState({ theme });
    setTimeout(() => document.body.classList.remove("themeChange"), 1000);
  };

  applyPreset = (preset: Preset) => {
    if (preset === "safe") {
      Preferences.set(P.blockReqs, RequestBlockMode.Reject);
      Preferences.set(P.imgBlur, true);
      Preferences.set(P.imgProtect, true);
      Preferences.set(P.showAnimatedImages, false);
      Preferences.set(P.toggleEmbeds, false);
    } else if (preset === "normal") {
      Preferences.set(P.blockReqs, RequestBlockMode.None);
      Preferences.set(P.imgBlur, false);
      Preferences.set(P.imgProtect, true);
      Preferences.set(P.showAnimatedImages, true);
      Preferences.set(P.toggleEmbeds, true);
    } else if (preset === "unsafe") {
      Preferences.set(P.blockReqs, RequestBlockMode.None);
      Preferences.set(P.imgBlur, false);
      Preferences.set(P.imgProtect, false);
      Preferences.set(P.showAnimatedImages, true);
      Preferences.set(P.toggleEmbeds, true);
    }

    this.setState({ preset });
  };

  render() {
    const { theme, preset } = this.state;
    return (
      <Menu>
        <div key="custom_menu" className={styles.ritsuMenuContainer}>
          {T.introduction.title}
          <br />
          <br />
          {T.introduction.content}
          <ThemesView theme={theme} applyTheme={this.applyTheme} />
          <PresetView preset={preset} applyPreset={this.applyPreset} />
          <div className="ui-menu-buttons">
            <div
              role="button"
              tabIndex={0}
              className="ui-button"
              onMouseDown={() => {
                Preferences.set(
                  P.introductionCompletedVersion,
                  CURRENT_INTRO_VERSION
                );
                MenuReact.close();
              }}
            >
              Save
            </div>
          </div>
        </div>
      </Menu>
    );
  }
}
