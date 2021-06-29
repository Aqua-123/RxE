import { P, Preferences } from "~src/preferences";

export function removeAds() {
  // ad block
  if (!FEATURES.HACKS) return;
  if (Preferences.get(P.disableNags!)) {
    document
      .querySelectorAll(
        'iframe:not([src*="captcha"]):not([src*="youtube"]):not([src*="about:blank"])'
      )
      .forEach((iframe) => {
        iframe.remove();
      });
  }
}
