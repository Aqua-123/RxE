import React from "react";
import { P } from "~src/preferences";

type CheckboxSettingProps = {
  id: keyof typeof P;
  value: any[];
  defaultValue: string;
  onclick: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function TextSetting(props: CheckboxSettingProps) {
  const { id, value, defaultValue, onclick } = props;
  return (
    <div>
      <input
        type="text"
        id={id}
        defaultValue={defaultValue}
        value={value}
        onKeyPress={onclick}
      />
      <label htmlFor={id}>{P[id]!.label}</label>
    </div>
  );
}
