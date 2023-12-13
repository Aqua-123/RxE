import { P, Preferences } from "~src/preferences";
import { loadCSS } from "~src/utils";
import css from "./style.scss";

export function initAdBlocker() {
  loadCSS(css);
}
// list for exceptions for source
const exceptions = [
  "captcha",
  "youtube",
  "about:blank",
  "open.spotify.com",
  "i.redd.it",
  "ibb.co",
  "challenges.cloudflare.com"
];

export function removeAds() {
  if (!Preferences.get(P.adBlocker)) return;
  const iframes = Array.from(document.querySelectorAll("iframe"));
  iframes.forEach((iframe) => {
    const { src } = iframe;
    if (src && !exceptions.some((e) => src.includes(e))) {
      iframe.remove();
    }
  });
}

export function removeNewUIAd() {
  if (!Preferences.get(P.blockNewUIAd)) return;
  const ad = document.querySelector(".new-ui-ad");
  if (ad) ad.remove();
}
