import React, { Component } from "react";
import styles from "./style.module.scss";
import T from "~src/text";
import { fontsQuery } from "~src/fonts/index";

export interface FontFormProps {
  fonts: {
    value: string;
    label: string;
  }[];
}

interface FontFormState {
  font: string;
}

export class FontForm extends Component<FontFormProps, FontFormState> {
  constructor(props: FontFormProps) {
    super(props);
    this.state = {
      font: props.fonts[0].label
    };
  }

  handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value;
    this.setState({ font: selectedFont });
  };
}

export default function Fonts(props: FontFormProps) {
  const { font, applyFont } = props;
  return (
    <div>
      <div className={`m1 ${styles.settingsSection}`}>{T.fontTitle}</div>
      <label className="ui-select" htmlFor="font">
        <select
          name="font"
          id="font"
          value={font}
          onChange={this.handleFontChange}
        >
          {fontsQuery.map((fontObj) => (
            <option key={fontObj.value} value={fontObj.label}>
              {fontObj.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
