import React from "react";
import { P } from "~src/preferences";

type CheckboxSettingProps = {
  id: keyof typeof P;
  value: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function CheckboxSetting(props: CheckboxSettingProps) {
  const { id, value, onChange } = props;
  return (
    <div>
      <input type="checkbox" id={id} checked={value} onChange={onChange} />
      <label htmlFor={id}>{P[id]!.label}</label>
    </div>
  );
}
