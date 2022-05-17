import React from "react";
import ReactDOM from "react-dom";
import { SettingsDialogSettings, SettingsDialogHacks } from "./SettingsDialog";
import CheckboxSetting from "./CheckboxSetting";
import RadioSetting from "./RadioSetting";
import TextSetting from "./TextfieldSetting";
import RegExpSetting from "./RegExpSetting";
import { updateRoomMutes } from "~src/modules/permamute";
import ListSetting from "./ListSetting";

export type SettingsProps = SettingsDialogSettings & {
  applySettings(obj: Partial<SettingsDialogSettings>): void;
};
export type HacksProps = SettingsDialogHacks & {
  applyHacks(obj: Partial<SettingsDialogHacks>): void;
};

type settingsList = keyof SettingsDialogSettings;
type hackList = keyof SettingsDialogHacks;
export function createCheckBox(setting: settingsList, props: SettingsProps) {
  const { applySettings } = props;
  const value = props[setting] as boolean;
  return (
    <CheckboxSetting
      id={setting}
      value={value}
      onChange={() => applySettings({ [setting]: !value })}
    />
  );
}

export function createHackSetting(setting: hackList, props: HacksProps) {
  const { applyHacks } = props;
  const value = props[setting];
  return (
    <CheckboxSetting
      id={setting}
      value={value}
      onChange={() => applyHacks({ [setting]: !value })}
    />
  );
}

export function createRadio(setting: settingsList, props: SettingsProps) {
  const { applySettings } = props;
  const value = props[setting] as boolean;
  return (
    <RadioSetting
      id={setting}
      value={value}
      onChange={() => applySettings({ [setting]: !value })}
      inline={false}
    />
  );
}

export function createTextField(
  setting: settingsList,
  props: SettingsProps,
  placeholder: string
) {
  const { applySettings } = props;
  const value = props[setting] as string;
  return (
    <TextSetting
      id={setting}
      value={value}
      onChange={(e) => applySettings({ [setting]: e.target.value })}
      placeholder={placeholder}
    />
  );
}

export function createRegexSetting(
  setting: settingsList,
  props: SettingsProps,
  flagsAllowed: string
) {
  const { applySettings } = props;
  const value = props[setting] as {
    source: string;
    flags: string;
  }[];
  return (
    <RegExpSetting
      id={setting}
      value={value[0] ?? { source: "", flags: "" }}
      onChange={({ source, flags }) =>
        applySettings({ [setting]: [{ source, flags }] })
      }
      flagsAllowed={flagsAllowed}
    />
  );
}

export function createDiv(className: string, title: string) {
  return <div className={`m1 ${className}`}>{title}</div>;
}

// TODO: create a standard function for this
function createUserProfile(id: number) {
  const userProfile = React.createElement(UserProfile, { id });
  ReactDOM.render(userProfile, document.getElementById("ui-hatch"));
}
export function createMuteList(props: SettingsProps) {
  const { applySettings, permaMuteList } = props;
  return (
    <ListSetting
      id="permaMuteList"
      value={permaMuteList}
      removeItem={([id], items) => items.filter((item) => item[0] !== id)}
      renderItem={([id, name]) => [
        <span className="ritsu-permamutelist-user-name">{name}</span>,
        <span
          className="material-icons"
          onClick={() => createUserProfile(id)}
          onKeyDown={() => createUserProfile(id)}
          style={{
            marginLeft: "0.5em",
            cursor: "pointer"
          }}
          role="button"
          tabIndex={0}
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
  );
}
