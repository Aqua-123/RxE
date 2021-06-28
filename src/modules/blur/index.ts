import { P, Preferences } from "~src/preferences";
import { crel } from "~src/utils";
import blurCSS from "./style.scss";

export function initPicturesBlur() {
  const imgBlur = Preferences.get(P.imgBlur);
  document.head.append(
    crel("style", {
      className: "image-blur",
      type: "text/css",
      textContent: blurCSS
    })
  );
  document.documentElement.classList.toggle("ritsu-blur", imgBlur);
}
