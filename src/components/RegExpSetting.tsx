import React from "react";
import { PA } from "~src/preferences";
import { without } from "~src/utils";
import CheckboxSetting from "./CheckboxSetting";
import TextSetting from "./TextfieldSetting";

type RegExpSettingProps = {
  id: string;
  value: {
    source: string;
    flags: string;
  };
  onChange: (value: RegExp | { source: string; flags: string }) => void;
  flagsAllowed: string;
};

const FLAGS = {
  g: "Global",
  i: "Case insensitive",
  m: "Multiline",
  u: "Unicode"
};

export default function RegExpSetting(
  // eslint-disable-next-line react/require-default-props
  props: RegExpSettingProps & { children?: JSXContent }
) {
  const { id, value, onChange, flagsAllowed, children } = props;
  let source = value?.source ?? "";
  let flags = value?.flags ?? "";
  const emit = (src?: string | null, flgs?: string[] | null) => {
    if (src != null) source = src;
    if (flgs != null) flags = flgs.join("");
    if (source === "") {
      onChange({ source, flags });
      return;
    }
    try {
      onChange(new RegExp(source, flags));
    } catch (_) {
      onChange({ source, flags });
    }
  };
  return (
    <div>
      <TextSetting
        id={`${id}-text`}
        value={source}
        placeholder="Regular expression"
        onChange={({ currentTarget }) => emit(currentTarget.value)}
      >
        {id in PA ? PA[id as keyof typeof PA]!.label : children}
      </TextSetting>
      {...flagsAllowed.split("").map((flag) => {
        if (!Object.prototype.hasOwnProperty.call(FLAGS, flag)) return null;
        return (
          <CheckboxSetting
            id={`${id}-flag-${flag}`}
            value={flags.includes(flag)}
            onChange={({ currentTarget }) => {
              const withoutFlag = without(flag, flags.split(""));
              const withFlag = [...withoutFlag, flag];
              emit(null, currentTarget.checked ? withFlag : withoutFlag);
            }}
          >
            {FLAGS[flag as keyof typeof FLAGS]}
          </CheckboxSetting>
        );
      })}
    </div>
  );
}
