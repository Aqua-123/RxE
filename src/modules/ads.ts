import { P, Preferences } from "~src/preferences";

export function removeAds() {
  // ad block
  if (process.env.HACKS != "OFF" && Preferences.get(P.disableNags!)) {
    document
      .querySelectorAll('iframe:not([src*="captcha"]):not([src*="youtube"])')
      .forEach(iframe => {
        console.log("removing iframe:", iframe);
        iframe.remove();
      });
  }
}
