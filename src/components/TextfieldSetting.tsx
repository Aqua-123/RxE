import React from "react";
import { PA } from "~src/preferences";

type TextFieldSettingsProps = {
  id: keyof typeof PA;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
};

export default function TextSetting(props: TextFieldSettingsProps) {
  const { id, value, onChange, placeholder } = props;
  return (
    <div>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      <label htmlFor={id}>{PA[id]!.label}</label>
    </div>
  );
}
