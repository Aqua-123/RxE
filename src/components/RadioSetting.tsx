/* eslint-disable prettier/prettier */
import React from "react";
import { MultichoicePreference, Preference } from "ts-preferences";
import { P } from "~src/preferences";

type RadioSettingProps<T> = {
    id: keyof typeof P;
    value: T;
    onChange: (selection: T) => void;
    inline: boolean;
};

export default function RadioSetting<T>(props: RadioSettingProps<T>) {
    const { id, value: selected, onChange, inline } = props;
    const preference = P[id] as Preference<any>;
    if (!(preference instanceof MultichoicePreference))
        throw new Error(
            "RadioSetting can only be used with MultichoicePreference"
        );
    return (
        <div className="ritsu-radio-setting-root">
            <label htmlFor={id}>{preference.label}</label>
            <div id={id} style={{
                display: "flex",
                flexDirection: inline ? "row" : "column"
            }}>
                {preference.options.map(({ value, label }) => (
                    <div className="ritsu-radio-setting-option">
                        <input
                            type="radio"
                            id={`${id}-option-${value}`}
                            name={id}
                            value={value}
                            checked={selected === value}
                            onChange={() => onChange(value)}
                        />
                        <label htmlFor={`${id}-option-${value}`}>{label}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}
