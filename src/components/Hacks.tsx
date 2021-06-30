import React from "react";
import { SettingsDialogHacks } from "./SettingsDialog";
import CheckboxSetting from "./CheckboxSetting";
import T from "~src/text";
import styles from "./style.module.scss";

type HacksProps = SettingsDialogHacks & {
  applyHacks(obj: Partial<SettingsDialogHacks>): void;
};

export default function Hacks(props: HacksProps) {
  const {
    disableNags,
    enableModUI,
    universalFriend,
    antiBan,
    fancyColors,
    applyHacks
  } = props;
  return (
    <div>
      <div className={`m1 ${styles.settingsSection}`}>{T.hacksTitle}</div>
      <CheckboxSetting
        id="disableNags"
        value={disableNags}
        onChange={() => applyHacks({ disableNags: !disableNags })}
      />
      <CheckboxSetting
        id="enableModUI"
        value={enableModUI}
        onChange={() => applyHacks({ enableModUI: !enableModUI })}
      />
      <CheckboxSetting
        id="universalFriend"
        value={universalFriend}
        onChange={() => applyHacks({ universalFriend: !universalFriend })}
      />
      <CheckboxSetting
        id="antiBan"
        value={antiBan}
        onChange={() => applyHacks({ antiBan: !antiBan })}
      />
      {/* <CheckboxSetting
        id="fancyColors"
        value={fancyColors}
        onChange={() => applyHacks({ fancyColors: !fancyColors })}
      /> */}
    </div>
  );
}
