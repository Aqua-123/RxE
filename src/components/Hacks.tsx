import React from "react";
import { createHackSetting, HacksProps } from "./SettingsUtils";
import styles from "./style.module.scss";

export default function Hacks(props: HacksProps) {
  return React.cloneElement(
    <div className={styles.hacks}>
      {createHackSetting("superTemp", props)}
      {createHackSetting("enableModUI", props)}
      {createHackSetting("universalFriend", props)}
      {createHackSetting("antiBan", props)}
    </div>,
    { className: styles.hacks }
  );
}
