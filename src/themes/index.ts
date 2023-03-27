import { P, Preferences } from "~src/preferences";
import { crel } from "~src/utils";
import otherCSS from "./other.scss";
import baseCSS from "./base.scss";
import ritsuCSS from "./ritsu.scss";
import lightCSS from "./light.scss";
import teriblast from "./teriblast.scss";

export const THEMES = ["default", "ritsu", "light", "teriblast"] as const;

export type Theme = typeof THEMES[number];

export function initTheme() {
  const theme = Preferences.get(P.theme) as Theme;
  let styleSheet = document.head.querySelector(".custom-theme");
  if (!styleSheet) {
    document.head.append(
      crel("style", {
        className: "custom-theme",
        type: "text/css"
      })
    );
    styleSheet = document.head.querySelector(".custom-theme")!;
  }
  const css = [otherCSS];
  switch (theme) {
    case "default":
    default:
      break;
    case "ritsu":
      css.push(baseCSS, ritsuCSS);
      break;
    case "light":
      css.push(baseCSS, lightCSS);
      break;
    case "teriblast":
      css.push(baseCSS, teriblast);
      break;
  }
  styleSheet.textContent = css.join("\n");
}
