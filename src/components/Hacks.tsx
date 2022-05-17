import React from "react";
import { createHackSetting, HacksProps, createDiv } from "./SettingsUtils";
import styles from "./style.module.scss";
import T from "~src/text";

export default function Hacks(props: HacksProps) {
  return React.createElement(
    "div",
    { className: styles.settings },
    createDiv(styles.settingsSection, T.hacksTitle),
    createHackSetting("superTemp", props),
    createHackSetting("enableModUI", props),
    createHackSetting("universalFriend", props),
    createHackSetting("antiBan", props)
  );
}
