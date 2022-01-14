import React from "react";
import { P } from "~src/preferences";

type TextFieldSettingsProps = {
  id: keyof typeof P;
  value: string;
  onchange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function TextSetting(props: TextFieldSettingsProps) {
  const { id, value, onchange } = props;
  return (
    <div>
      <input
        type="text"
        id={id}
        value={value}
        onChange={onchange}
      />
      <label htmlFor={id}>{P[id]!.label}</label>
    </div>
  );
}
