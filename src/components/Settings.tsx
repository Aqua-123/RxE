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
    adBlocker,
    trackKarma,
    fancyColors,
    imgControl,
    imgProtect,
    imgBlur,
    hidePfp,
    showInfo,
    showGender,
    antiSpam,
    applySettings
  } = props;
  return (
    <div>
      <div className={`m1 ${styles.settingsSection}`}>{T.generalTitle}</div>
      <CheckboxSetting
        id="adBlocker"
        value={adBlocker}
        onChange={() => applySettings({ adBlocker: !adBlocker })}
      />
      <CheckboxSetting
        id="trackKarma"
        value={trackKarma}
        onChange={() => applySettings({ trackKarma: !trackKarma })}
      />
      <CheckboxSetting
        id="fancyColors"
        value={fancyColors}
        onChange={() => applySettings({ fancyColors: !fancyColors })}
      />
      <div className={`m1 ${styles.settingsSection}`}>{T.imagesTitle}</div>
      <CheckboxSetting
        id="hidePfp"
        value={hidePfp}
        onChange={() => applySettings({ hidePfp: !hidePfp })}
      />
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
        onChange={() => applySettings({ imgBlur: !imgBlur })}
      />
      <div className={`m1 ${styles.settingsSection}`}>{T.messageTitle}</div>
      <CheckboxSetting
        id="antiSpam"
        value={antiSpam}
        onChange={() => applySettings({ antiSpam: !antiSpam })}
      />
      <CheckboxSetting
        id="showGender"
        value={showGender}
        onChange={() => applySettings({ showGender: !showGender })}
      />
      <CheckboxSetting
        id="showInfo"
        value={showInfo}
        onChange={() => applySettings({ showInfo: !showInfo })}
      />
    </div>
  );
}
