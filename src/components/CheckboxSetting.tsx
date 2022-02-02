import React from "react";
import { PA } from "~src/preferences";

type CheckboxSettingProps = {
  id: keyof typeof PA;
  value: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function CheckboxSetting(props: CheckboxSettingProps) {
  const { id, value, onChange } = props;
  return (
    <div>
      <input type="checkbox" id={id} checked={value} onChange={onChange} />
      <label htmlFor={id}>{PA[id]!.label}</label>
    </div>
  );
}
