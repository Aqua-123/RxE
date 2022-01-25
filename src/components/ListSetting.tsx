/* eslint-disable prettier/prettier */
import React from "react";
import { ListPreference, Preference } from "ts-preferences";
import { P } from "~src/preferences";

type ListSettingProps<T> = {
    id: keyof typeof P;
    value: readonly T[];
    onChange: (selection: T[]) => void;
    renderItem: (t: T) => JSX.Element;
    removeItem: (t: T, list: T[]) => T[];
};
export default class ListSetting<T> extends React.Component<
    ListSettingProps<T>, { items: T[] }
> {
    constructor(props: ListSettingProps<T>) {
        super(props);
        this.state = { items: Array.from(props.value) };
    }

    handleItemRemoval(item: T) {
        const { onChange, removeItem } = this.props;
        const itemsNew = removeItem(item, this.items());
        this.setState({
            items: itemsNew
        });
        onChange(itemsNew);
    }

    items() {
        const { items } = this.state;
        return Array.from(items);
    }

    itemJSX(item: T) {
        const { renderItem } = this.props;
        return <div>
            <span className="ui-button-text"
                onClick={() => this.handleItemRemoval(item)}
                onKeyPress={(event) =>
                    ["Enter", "Space"].includes(event.key)
                    && this.handleItemRemoval(item)}
                role="button"
                tabIndex={0}
            >×</span>
            <span>{renderItem(item)}</span>
        </div>
    }

    render() {
        const { id } = this.props;
        const { items } = this.state;
        const preference = P[id] as Preference<any>;
        if (!(preference instanceof ListPreference))
            throw new Error(
                "ListSetting can only be used with ListPreference"
            );
        return (
            <div>
                <div id={id} style={{ display: "block" }}>
                    {items.map(this.itemJSX)}
                </div>
            </div>
        );
    }
}
