import { P, Preferences } from "~src/preferences";
import { crel, loadCSS, wrapMethod } from "~src/utils";
import css from "./style.scss";
import T from "~src/text";

function showBanBanner() {
  const banner = crel("div", {
    className: "top-message",
    textContent: T.banMessage,
    onclick: () => banner.remove()
  });
  document.body.append(banner);
}

export function initAntiBan() {
  if (!FEATURES.HACKS) return;
  wrapMethod(
    App.events,
    "received",
    (e) => {
      if (!Preferences.get(P.antiBan!)) return;
      if (e.ban) {
        e.ban = false;
        showBanBanner();
      }
    },
    true
  );
  loadCSS(css);
}
