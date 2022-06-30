import React from "react";
import { Theme, THEMES } from "~src/themes";
import T from "~src/text";
import styles from "./style.module.scss";

export type ThemesProps = {
  theme: Theme;
  applyTheme(theme: Theme): void;
};

export default function Themes(props: ThemesProps) {
  const { theme, applyTheme } = props;
  return (
    <div>
      <div className={`m1 ${styles.settingsSection}`}>{T.themeTitle}</div>
      {THEMES.map((eachTheme) => (
        <div>
          <input
            type="radio"
            id={eachTheme}
            name="theme"
            value={eachTheme}
            checked={theme === eachTheme}
            onChange={() => applyTheme(eachTheme)}
          />
          <label htmlFor={eachTheme}>
            {eachTheme[0].toUpperCase() + eachTheme.slice(1)}
          </label>
        </div>
      ))}
    </div>
  );
}
