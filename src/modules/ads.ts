import { P, Preferences } from "~src/preferences";

export function removeAds() {
  // ad block
  if (Preferences.get(P.disableNags)) {
    document
      .querySelectorAll('iframe:not([src*="captcha"])')
      .forEach(iframe => iframe.remove());
  }
}
