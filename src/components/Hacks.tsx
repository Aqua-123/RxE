import React from "react";
import {
  checkboxPreference,
  HacksProps,
  settingsSection
} from "./SettingsComponents";
import styles from "./style.module.scss";
import T from "~src/text";

export default function Hacks(props: HacksProps) {
  return React.createElement(
    "div",
    { className: styles.settings },
    settingsSection(styles.settingsSection, T.hacksTitle),
    checkboxPreference("superTemp", props),
    checkboxPreference("enableModUI", props),
    checkboxPreference("universalFriend", props),
    checkboxPreference("antiBan", props)
  );
}
