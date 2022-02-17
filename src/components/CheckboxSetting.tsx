import React from "react";
import { PA } from "~src/preferences";

type CheckboxSettingProps = {
  id: keyof typeof PA | string;
  value: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function CheckboxSetting(
  // eslint-disable-next-line react/require-default-props
  props: CheckboxSettingProps & { children?: JSXContent }
) {
  const { id, value, onChange, children } = props;
  return (
    <div>
      <input type="checkbox" id={id} checked={value} onChange={onChange} />
      <label htmlFor={id}>
        {id in PA ? PA[id as keyof typeof PA]!.label : children ?? null}
      </label>
    </div>
  );
}
