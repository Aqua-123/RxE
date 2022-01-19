/* eslint-disable */
import React from "react";
import { SettingsDialogSettings } from "./SettingsDialog";
import CheckboxSetting from "./CheckboxSetting";
import TextSetting from "./TextfieldSetting";
import T from "~src/text";
import styles from "./style.module.scss";
import { updateMutes } from "~src/modules/permamute";
import RadioSetting from "./RadioSetting";

const mutes_format = /^\{(\s*\d+\s*:\s*"[^"]*"\s*,\s*)*(\s*\d+\s*:\s*"[^"]*"\s*)?\}$/;

type SettingsProps = SettingsDialogSettings & {
  applySettings(obj: Partial<SettingsDialogSettings>): void;
};

export default function Settings(this: any, props: SettingsProps) {
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
    permaMuteList,
    blockReqs,
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
      <RadioSetting
        id="blockReqs"
        value={blockReqs}
        onChange={(blockReqs) => applySettings({ blockReqs })}
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
      <TextSetting
        id="permaMuteList"
        value={JSON.stringify(Object.fromEntries(permaMuteList))}
        onchange={event => {
          if (!(mutes_format.test(event.target.value))) return true;
          const mutes: Record<number, string> = JSON.parse(event.target.value);
          const mute_list: Array<[number, string]> = [];
          for (const uid in mutes)
            if ("number" === typeof uid && "string" === typeof mutes[uid])
              mute_list.push([uid, mutes[uid]]);
          updateMutes(mute_list);
          applySettings({ permaMuteList: mute_list });
          return true;
        }}
      />
    </div>
  );
}
