import React from "react";
import ReactDOM from "react-dom";
import { SettingsDialogSettings, SettingsDialogHacks } from "./SettingsDialog";
import CheckboxSetting from "./CheckboxSetting";
import RadioSetting from "./RadioSetting";
import TextSetting from "./TextfieldSetting";
import { updateRoomMutes } from "~src/modules/permamute";
import ListSetting from "./ListSetting";

export type SettingsProps = SettingsDialogSettings & {
  applySettings(obj: Partial<SettingsDialogSettings>): void;
};
export type HacksProps = SettingsDialogHacks & {
  applyHacks(obj: Partial<SettingsDialogHacks>): void;
};

type Setting = keyof SettingsDialogSettings;

export function checkboxPreference<Props extends SettingsProps | HacksProps>(
  setting: KeysOfType<Props, boolean> & string,
  props: Props
) {
  const { [setting]: value } = props;
  const applySettings =
    "applySettings" in props ? props.applySettings : props.applyHacks;
  return (
    <CheckboxSetting
      id={setting}
      value={value as boolean}
      onChange={() => applySettings({ [setting]: !value })}
    />
  );
}

export function radioPreference(setting: Setting, props: SettingsProps) {
  const { applySettings, [setting]: value } = props;
  return (
    <RadioSetting
      id={setting}
      value={value}
      onChange={(newValue) => applySettings({ [setting]: newValue })}
      inline={false}
    />
  );
}

export function textPreference(
  setting: KeysOfType<SettingsProps, string>,
  props: SettingsProps,
  placeholder: string
) {
  const { applySettings, [setting]: value } = props;
  return (
    <TextSetting
      id={setting}
      value={value}
      onChange={(e) => applySettings({ [setting]: e.target.value })}
      placeholder={placeholder}
    />
  );
}

export function settingsSection(
  className: string,
  content: string | undefined
) {
  return <div className={`m1 ${className}`}>{content}</div>;
}

// TODO: create a standard function for this
function createUserProfile(id: number) {
  const userProfile = React.createElement(UserProfile, { id });
  ReactDOM.render(userProfile, document.getElementById("ui-hatch"));
}

export function mutelist(props: SettingsProps) {
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
