import React from "react";
import { SettingsDialogSettings } from "./SettingsDialog";
import CheckboxSetting from "./CheckboxSetting";
import T from "~src/text";
import styles from "./style.module.scss";

type SettingsProps = SettingsDialogSettings & {
  applySettings(obj: Partial<SettingsDialogSettings>): void;
};

export default function Settings(props: SettingsProps) {
  const {
    imgControl,
    imgProtect,
    imgBlur,
    showInfo,
    antiSpam,
    applySettings
  } = props;
  return (
    <div>
      <div className={`m1 ${styles.settingsSection}`}>{T.imagesTitle}</div>
      <CheckboxSetting
        id="imgControl"
        value={imgControl}
        onChange={() => applySettings({ imgControl: !imgControl })}
      />
      <CheckboxSetting
        id="imgProtect"
        value={imgProtect}
        onChange={() => applySettings({ imgProtect: !imgProtect })}
      />
      <CheckboxSetting
        id="imgBlur"
        value={imgBlur}
        onChange={() => {
          document.documentElement.classList.toggle("ritsu-blur", !imgBlur);
          applySettings({ imgBlur: !imgBlur });
        }}
      />
      <div className={`m1 ${styles.settingsSection}`}>{T.messageTitle}</div>
      <CheckboxSetting
        id="antiSpam"
        value={antiSpam}
        onChange={() => applySettings({ antiSpam: !antiSpam })}
      />
      <CheckboxSetting
        id="showInfo"
        value={showInfo}
        onChange={() => applySettings({ showInfo: !showInfo })}
      />
    </div>
  );
}
