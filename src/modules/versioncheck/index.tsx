import ReactDOM from "react-dom";
import React from "react";
import userscript from "~src/userscript";
import { VersionDialog } from "~src/components/versionDialog";
import { versionComparison } from "~src/utils";
import { P } from "~src/preferences";

const META =
  "https://raw.githubusercontent.com/Ritsu-Projects/Public-Releases/main/meta/VERSION";

export function initversionCheck() {
  if (!P.notifyUpdates) return;
  $.ajax({
    url: META,
    type: "GET",
    success(result: string) {
      if (versionComparison(userscript.version, result.trim()) < 0) {
        ReactDOM.render(
          <VersionDialog version={result} />,
          document.getElementById("ui-hatch")
        );
      }
    }
  });
}
