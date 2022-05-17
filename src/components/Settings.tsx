import React from "react";
import T from "~src/text";
import styles from "./style.module.scss";
import {
  SettingsProps,
  createCheckBox,
  createRadio,
  createDiv,
  createTextField,
  createRegexSetting,
  createMuteList
} from "./SettingsUtils";

export default function Settings(props: SettingsProps) {
  return React.createElement(
    "div",
    { className: styles.settings },
    createCheckBox("adBlocker", props),
    createCheckBox("trackKarma", props),
    createCheckBox("fancyColors", props),
    createRadio("blockReqs", props),
    createDiv(styles.settingsSection, T.imagesTitle),
    createCheckBox("imgBlur", props),
    createCheckBox("imgProtect", props),
    createCheckBox("hidePfp", props),
    createCheckBox("showAnimatedImages", props),
    createCheckBox("imgControl", props),
    createCheckBox("hideImageFallback", props),
    createDiv(styles.settingsSection, T.messageTitle),
    createCheckBox("antiSpam", props),
    createCheckBox("showGender", props),
    createCheckBox("showInfo", props),
    createCheckBox("highlightMentions", props),
    createCheckBox("bigEmoji", props),
    createCheckBox("toggleEmbeds", props),
    createCheckBox("largerText", props),
    createDiv(styles.settingsSection, T.advancedTitle),
    createCheckBox("ignoreURLBlacklist", props),
    createTextField(
      "imgurAPIKey",
      props,
      T.preferences.imgurAPIKey.placeholder
    ),
    createRegexSetting("muteRegexes", props, "i"),
    createMuteList(props)
  );
}
