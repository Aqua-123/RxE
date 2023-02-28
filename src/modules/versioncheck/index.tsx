import ReactDOM from "react-dom";
import React from "react";
import userscript from "~src/userscript";
import { VersionDialog } from "~src/components/versionDialog";
import { versionComparison } from "~src/utils";
import { P, Preferences } from "~src/preferences";

const META =
  "https://raw.githubusercontent.com/Ritsu-Projects/Public-Releases/main/meta/VERSION";

const CHANGE_LOG =
  "https://raw.githubusercontent.com/Ritsu-Projects/Public-Releases/main/meta/CHANGE_LOG";

export async function initversionCheck() {
  if (!Preferences.get(P.notifyUpdates)) return;
  const newVersion = await fetch(META);
  const newVersionText = await newVersion.text();
  const changes = await fetch(CHANGE_LOG);
  const changesText = await changes.text();
  if (versionComparison(userscript.version, newVersionText.trim()) < 0) {
    ReactDOM.render(
      <VersionDialog version={newVersionText} changes={changesText} />,
      document.getElementById("ui-hatch")
    );
  }
}
