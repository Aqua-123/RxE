/* eslint-disable prettier/prettier */
import React from "react";
import { MultichoicePreference, Preference } from "ts-preferences";
import { P } from "~src/preferences";

type RadioSettingProps<T> = {
    id: keyof typeof P;
    value: T;
    onChange: (selection: T) => void;
};

export default function RadioSetting<T>(props: RadioSettingProps<T>) {
    const { id, value: selected, onChange } = props;
    const preference = P[id] as Preference<any>;
    if (!(preference instanceof MultichoicePreference))
        throw new Error(
            "RadioSetting can only be used with MultichoicePreference"
        );
    return (
        < div >
            <label htmlFor={id}>{preference.label}</label>
            <div id={id} style={{ display: "block" }}>
                {preference.options.map(({ value, label }) => (
                    <div>
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
        </div >
    );
}
