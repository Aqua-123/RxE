import { P, Preferences } from "~src/preferences";
import { crel } from "~src/utils";
import css from "./style.scss";

export function removeAds() {
  if (!document.querySelector("style.ad-block")) {
    document.head.append(
      crel("style", {
        className: "ad-block",
        type: "text/css",
        textContent: css
      })
    );
  }

  if (Preferences.get(P.adBlocker)) {
    document
      .querySelectorAll(
        'iframe:not([src*="captcha"]):not([src*="youtube"]):not([src*="about:blank"])'
      )
      .forEach((iframe) => {
        iframe.remove();
      });
  }
}
