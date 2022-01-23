/* eslint-disable prettier/prettier */
import React from "react";
import { ListPreference, Preference } from "ts-preferences";
import { P } from "~src/preferences";
import { without } from "~src/utils";

type ListSettingProps<T> = {
    id: keyof typeof P;
    value: readonly T[];
    onChange: (selection: T[]) => void;
    renderItem: (t: T) => JSX.Element;
    removeItem: (t: T, list: T[]) => T[];
};

export default class ListSetting<T> extends React.Component<ListSettingProps<T>, { items: T[] }> {
    constructor(props: ListSettingProps<T>) {
        super(props);
        this.state = { items: Array.from(props.value) };
    }
    items() {
        return this.state.items;
    }
    render() {
        const { id, onChange, renderItem, removeItem } = this.props;
        const { items } = this.state;
        const preference = P[id] as Preference<any>;
        if (!(preference instanceof ListPreference))
            throw new Error(
                "ListSetting can only be used with ListPreference"
            );
        return (
            <div>
                <div id={id} style={{ display: "block" }}>
                    {items.map((item) => (
                        <div>
                            <span className="ui-button-text"
                                onClick={() => {
                                    const itemsNew = removeItem(item, items)
                                    this.setState({
                                        items: itemsNew
                                    })
                                    onChange(itemsNew);
                                }}
                            >×</span>
                            <span>{renderItem(item)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
