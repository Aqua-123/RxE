import { P, Preferences } from "~src/preferences";
import { loadCSS } from "~src/utils";
import css from "./style.scss";

export function initAdBlocker() {
  loadCSS(css);
}

export function removeAds() {
  if (Preferences.get(P.adBlocker)) {
    document
      .querySelectorAll(
        'iframe:not([src*="captcha"]):not([src*="youtube"]):not([src*="about:blank"]):not([src*="open.spotify.com"])'
      )
      .forEach((iframe) => {
        iframe.remove();
      });
  }
}
