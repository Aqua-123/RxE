import React from "react";
import { PA } from "~src/preferences";

type TextFieldSettingsProps = {
  id: keyof typeof PA | string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
};

export default function TextSetting(
  // eslint-disable-next-line react/require-default-props
  props: TextFieldSettingsProps & { children?: JSXContent }
) {
  const { id, value, onChange, placeholder, children } = props;
  return (
    <div>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      <label htmlFor={id}>
        {id in PA ? PA[id as keyof typeof PA]!.label : children ?? null}
      </label>
    </div>
  );
}
