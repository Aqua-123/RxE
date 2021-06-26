import React from "react";
import ReactDOM from "react-dom";
import RitsuDialog from "~src/components/RitsuDialog";
import { crel } from "~src/utils";

function openRitsuDialog() {
  ReactDOM.render(<RitsuDialog />, document.getElementById("ui-hatch"));
}

export function injectRitsuMenu() {
  let ritsuMenu = document.querySelector(".navigation-dropdown-ritsu");
  if (!ritsuMenu) {
    document.querySelector(".navigation-dropdown-content")?.prepend(
      crel("li", {
        className: "navigation-dropdown-ritsu",
        textContent: "Ritsu Menu",
        onmousedown: openRitsuDialog
      })
    );
  }
}
