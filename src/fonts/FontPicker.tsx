import React, { Component } from "react";
import styles from "./style.scss";
import T from "~src/text";
import { fontsQuery, Font, FontLabel } from "~src/fonts/index";
import { P, Preferences } from "~src/preferences";

export interface FontFormProps {
  fonts: {
    roboto: FontLabel;
    // eslint-disable-next-line camelcase
    comic_sans: FontLabel;
    helvetica: FontLabel;
    trebuchet: FontLabel;
    verdana: FontLabel;
  };
  currentFont: Font;
  applyFont(font: Font): void;
}

interface FontFormState {
  font: string;
}

export class FontForm extends Component<FontFormProps, FontFormState> {
  constructor(props: FontFormProps) {
    super(props);
    this.state = {
      font: props.currentFont
    };
  }

  handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value as Font;
    Preferences.set(P.font, selectedFont);
    this.setState({ font: selectedFont });
    const { applyFont } = this.props;
    applyFont(selectedFont);
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
