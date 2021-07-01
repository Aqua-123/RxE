import { P, Preferences } from "~src/preferences";
import { loadCSS } from "~src/utils";
import blurCSS from "./style.scss";

export function initPicturesBlur() {
  // const imgBlur = Preferences.get(P.imgBlur);
  loadCSS(blurCSS);
}
