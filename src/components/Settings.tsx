/* eslint-disable */
import React from "react";
import { SettingsDialogSettings } from "./SettingsDialog";
import CheckboxSetting from "./CheckboxSetting";
import T from "~src/text";
import styles from "./style.module.scss";
import { updateRoomMutes } from "~src/modules/permamute";
import RadioSetting from "./RadioSetting";
import ListSetting from "./ListSetting";
import TextSetting from "./TextfieldSetting";
import ReactDOM from "react-dom";
import RegExpSetting from "./RegExpSetting";

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
    permaMuteList,
    blockReqs,
    highlightMentions,
    bigEmoji,
    hideImageFallback,
    ignoreURLBlacklist,
    imgurAPIKey,
    muteRegexes,
    applySettings,
    toggleEmbeds
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
        inline={false}
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
      <CheckboxSetting
        id="hideImageFallback"
        value={hideImageFallback}
        onChange={() =>
          applySettings({ hideImageFallback: !hideImageFallback })
        }
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
        id="highlightMentions"
        value={highlightMentions}
        onChange={() =>
          applySettings({ highlightMentions: !highlightMentions })
        }
      />
      <CheckboxSetting
        id="bigEmoji"
        value={bigEmoji}
        onChange={() => applySettings({ bigEmoji: !bigEmoji })}
      />
      <CheckboxSetting
        id="toggleEmbeds"
        value={toggleEmbeds}
        onChange={() => applySettings({ toggleEmbeds: !toggleEmbeds })}
      />
      <div className={`m1 ${styles.settingsSection}`}>{T.advancedTitle}</div>
      <CheckboxSetting
        id="ignoreURLBlacklist"
        value={ignoreURLBlacklist}
        onChange={() =>
          applySettings({ ignoreURLBlacklist: !ignoreURLBlacklist })
        }
      />
      <TextSetting
        id="imgurAPIKey"
        value={imgurAPIKey}
        onChange={({ currentTarget }) => {
          applySettings({ imgurAPIKey: currentTarget.value });
        }}
        placeholder={T.preferences.imgurAPIKey.placeholder}
      />
      <RegExpSetting
        id="muteRegexes"
        value={muteRegexes[0] ?? { source: "", flags: "" }}
        onChange={({ source, flags }) => {
          applySettings({ muteRegexes: [{ source, flags }] });
        }}
        flagsAllowed="i"
      />
      <div className={`m1 ${styles.settingsSection}`}>{T.mutelistTitle}</div>
      <ListSetting
        id="permaMuteList"
        value={permaMuteList}
        removeItem={([id], items) => items.filter((item) => item[0] !== id)}
        renderItem={([id, name]) => [
          <span className="ritsu-permamutelist-user-name">{name}</span>,
          <span
            className="material-icons"
            onClick={(event) => {
              const userProfile = React.createElement(UserProfile, { id });
              ReactDOM.render(userProfile, document.getElementById("ui-hatch"));
            }}
            style={{
              marginLeft: "0.5em",
              cursor: "pointer"
            }}
          >
            account_circle
          </span>
        ]}
        onChange={(items: Array<[number, string]>) => {
          updateRoomMutes(items);
          applySettings({ permaMuteList: items });
          NotificationsReact?.update();
        }}
      >
        No mutes active
      </ListSetting>
    </div>
  );
}
