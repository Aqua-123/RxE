import React from "react";
import { SettingsDialogHacks } from "./SettingsDialog";
import CheckboxSetting from "./CheckboxSetting";
import T from "~src/text";
import styles from "./style.module.scss";

type HacksProps = SettingsDialogHacks & {
  applyHacks(obj: Partial<SettingsDialogHacks>): void;
};

export default function Hacks(props: HacksProps) {
  const { superTemp, enableModUI, universalFriend, antiBan, applyHacks } =
    props;
  return (
    <div>
      <div className={`m1 ${styles.settingsSection}`}>{T.hacksTitle}</div>
      <CheckboxSetting
        id="superTemp"
        value={superTemp}
        onChange={() => applyHacks({ superTemp: !superTemp })}
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
    </div>
  );
}
