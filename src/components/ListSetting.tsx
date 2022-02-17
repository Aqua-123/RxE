/* eslint-disable prettier/prettier */
import React from "react";
import { ListPreference, Preference } from "ts-preferences";
import { PA } from "~src/preferences";
import { onClickOrKeyUp } from "~src/utils";

type ListSettingProps<T> = {
  id: keyof typeof PA;
  value: readonly T[];
  onChange: (selection: T[]) => void;
  renderItem: (t: T) => JSXContent;
  removeItem: (t: T, list: T[]) => T[];
};
export default class ListSetting<T> extends React.Component<
  ListSettingProps<T>,
  { items: T[] }
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
    return (
      <div>
        <span
          className="ui-button-text"
          style={{
            margin: "0",
            padding: "0 10px"
          }}
          {...onClickOrKeyUp(() => this.handleItemRemoval(item), {
            allowSpace: true
          })}
          role="button"
          tabIndex={0}
        >
          ×
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center"
          }}
        >
          {renderItem(item)}
        </span>
      </div>
    );
  }

  render() {
    const { id, children } = this.props;
    const { items } = this.state;
    const preference = PA[id] as Preference<any>;
    if (!(preference instanceof ListPreference))
      throw new Error("ListSetting can only be used with ListPreference");
    return (
      <div>
        <div id={id} style={{ display: "block" }}>
          {items.length === 0 ? children : items.map(this.itemJSX.bind(this))}
        </div>
      </div>
    );
  }
}
