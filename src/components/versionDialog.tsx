import React from "react";
import styles from "./style.module.scss";

export function VersionDialog(props: { version: string; changes: string }) {
  // eslint-disable-next-line react/destructuring-assignment
  const { version, changes } = props;
  const preStyle = {
    fontFamily: "Arial, sans-serif",
    fontSize: "16px"
  };
  return (
    <Menu>
      <div key="custom_menu" className={styles.ritsuMenuContainer}>
        Update available for RxE!
        <br />
        <br />
        Version {version} of RxE is out!
        <br />
        <br />
        The changes are:-
        <pre style={preStyle}>{changes}</pre>
        <br />
        <br />
        Visit the{" "}
        <a href="https://github.com/Ritsu-Projects/Public-Releases/raw/main/ritsu-emerald.user.js">
          Github repositry
        </a>{" "}
        or click{" "}
        <a href="https://github.com/Ritsu-Projects/Public-Releases/raw/main/ritsu-emerald.user.js">
          here
        </a>{" "}
        to update to the latest version!
        <div className="ui-menu-buttons">
          <div
            role="button"
            tabIndex={0}
            className="ui-button"
            onMouseDown={() => {
              MenuReact.close();
            }}
          >
            Close
          </div>
        </div>
      </div>
    </Menu>
  );
}
