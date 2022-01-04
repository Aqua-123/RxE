import React from "react";
import { SettingsDialogSettings } from "./SettingsDialog";
import CheckboxSetting from "./CheckboxSetting";
import TextSetting from "./TextfieldSetting";
import T from "~src/text";
import styles from "./style.module.scss";
import { permamute } from "~src/modules/permamute/index";


type SettingsProps = SettingsDialogSettings & {
  applySettings(obj: Partial<SettingsDialogSettings>): void;
};
export var mutenew = GM_getValue("mutelist", null)
export default function Settings(this: any, props: any, mutenew: any[]) {

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
    mutetoggle,
    mutelist,
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
      <CheckboxSetting
        id="mutetoggle"
        value={mutetoggle}
        onChange={() => applySettings({ mutetoggle: !mutetoggle })}
      />
      <TextSetting
        id="mutelist"
        value={mutelist}
        defaultValue={GM_getValue("mutelist", "")}
        onclick={event => {
          if (event.key === 'Enter') {
            console.log(mutenew)
            if (mutenew == null) {
              mutenew = [((event.target as HTMLInputElement).value).split(",")]
              GM_setValue("mutelist", mutenew)
              permamute(mutenew)
            }
            else {
              mutenew = [((event.target as HTMLInputElement).value).split(",")]
              GM_setValue("mutelist", mutenew)
              permamute(mutenew)
            }
          }
        }}
      />
    </div>

  );
}
