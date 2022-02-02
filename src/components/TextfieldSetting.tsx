import React from "react";
import { PA } from "~src/preferences";

type TextFieldSettingsProps = {
  id: keyof typeof PA;
  value: string;
  onchange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function TextSetting(props: TextFieldSettingsProps) {
  const { id, value, onchange } = props;
  return (
    <div>
      <input type="text" id={id} value={value} onChange={onchange} />
      <label htmlFor={id}>{PA[id]!.label}</label>
    </div>
  );
}
