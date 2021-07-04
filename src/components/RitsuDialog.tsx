import React from "react";
import SettingsDialog from "~src/components/SettingsDialog";
import styles from "./style.module.scss";

export default function RitsuDialog() {
  return (
    <Menu>
      <div key="custom_menu" className={styles.ritsuMenuContainer}>
        Ritsu Settings
        <br />
        <br />
        <SettingsDialog />
        <div className="ui-menu-buttons">
          <div
            role="button"
            tabIndex={0}
            className="ui-button-text"
            onMouseDown={() => MenuReact.close()}
          >
            Close
          </div>
        </div>
      </div>
    </Menu>
  );
}
