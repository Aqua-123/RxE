import React, { Component } from "react";
import styles from "./style.module.scss";
import T from "~src/text";
import { fontsQuery } from "~src/fonts/index";
import { P, Preferences } from "~src/preferences";

export type FontFormProps = typeof fontsQuery;

// export interface FontFormProps {
//   fonts: {
//     value: string;
//     label: string;
//   }[];
// }

interface FontFormState {
  font: string;
}

export class FontForm extends Component<FontFormProps, FontFormState> {
  constructor(props: FontFormProps) {
    super(props);
    this.state = {
      font: props.roboto
    };
  }

  handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value;
    Preferences.set(P.font, selectedFont);
    this.setState({ font: selectedFont });
  };

  render(): React.ReactNode {
    const { font } = this.state;
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
            {Object.keys(fontsQuery).map((fontKey) => (
              <option key={fontKey} value={fontsQuery[fontKey]}>
                {fontsQuery[fontKey]}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }
}

/*
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
*/
