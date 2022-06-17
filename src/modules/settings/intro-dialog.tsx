import React from "react";
import ReactDOM from "react-dom";
import {
  CURRENT_INTRO_VERSION,
  IntroDialog
} from "~src/components/IntroDialog";
import { PA, Preferences } from "~src/preferences";

export function openIntro() {
  ReactDOM.render(<IntroDialog />, document.getElementById("ui-hatch"));
}

export function init() {
  const completedIntroVersion = Preferences.get(
    PA.introductionCompletedVersion
  );
  if (completedIntroVersion < CURRENT_INTRO_VERSION) {
    openIntro();
  }
}
