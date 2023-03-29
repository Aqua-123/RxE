import React from "react";
import T from "~src/text";
import styles from "./style.module.scss";
import {
  SettingsProps,
  checkboxPreference,
  radioPreference,
  settingsSection,
  textPreference,
  mutelist
} from "./SettingsComponents";
import RegExpSetting from "./RegExpSetting";

export default function Settings(props: SettingsProps) {
  const { muteRegexes, applySettings } = props;
  return (
    <div className={styles.settings}>
      {settingsSection(styles.settingsSection, T.generalTitle)}
      {checkboxPreference("adBlocker", props)}
      {checkboxPreference("trackKarma", props)}
      {checkboxPreference("fancyColors", props)}
      {checkboxPreference("notifyUpdates", props)}
      {App.user.mod && checkboxPreference("hideFromGc", props)}
      {radioPreference("blockReqs", props)}
      {settingsSection(styles.settingsSection, T.imagesTitle)}
      {checkboxPreference("imgBlur", props)}
      {checkboxPreference("imgProtect", props)}
      {checkboxPreference("legacyImages", props)}
      {checkboxPreference("hidePfp", props)}
      {checkboxPreference("showAnimatedImages", props)}
      {checkboxPreference("imgControl", props)}
      {checkboxPreference("hideImageFallback", props)}
      {settingsSection(styles.settingsSection, T.messageTitle)}
      {checkboxPreference("antiSpam", props)}
      {checkboxPreference("showGender", props)}
      {checkboxPreference("showInfo", props)}
      {checkboxPreference("highlightMentions", props)}
      {checkboxPreference("bigEmoji", props)}
      {checkboxPreference("toggleEmbeds", props)}
      {checkboxPreference("largerText", props)}
      {settingsSection(styles.settingsSection, T.advancedTitle)}
      {checkboxPreference("ignoreURLBlacklist", props)}
      {textPreference(
        "imgurAPIKey",
        props,
        T.preferences.imgurAPIKey.placeholder
      )}
      <RegExpSetting
        id="muteRegexes"
        value={muteRegexes[0] ?? { source: "", flags: "" }}
        onChange={({ source, flags }) =>
          applySettings({ muteRegexes: [{ source, flags }] })
        }
        flagsAllowed="i"
      />
      {mutelist(props)}
    </div>
  );
}
