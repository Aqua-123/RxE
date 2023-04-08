import { P, Preferences } from "~src/preferences";
import { crel } from "~src/utils";
import verdana from "./verdana.scss";
import comicSans from "./comicSans.scss";
import helvetica from "./helvetica.scss";
import trebuchet from "./trebuchet.scss";

export type FontsProps = {
  font: Font;
  applyFont(font: Font): void;
};

export const fontsQuery = {
  roboto: "Default Font",
  comic_sans: "Comic Sans MS",
  helvetica: "Helvetica",
  trebuchet: "Trebuchet MS",
  verdana: "Verdana"
};

export type Font = keyof typeof fontsQuery;
export type FontLabel =
  | "Default Font"
  | "Comic Sans MS"
  | "Helvetica"
  | "Trebuchet MS"
  | "Verdana";

export function initFont() {
  const font = Preferences.get(P.font) as FontLabel;
  let styleSheet = document.head.querySelector(".custom-font");
  if (!styleSheet) {
    document.head.append(
      crel("style", {
        className: "custom-font",
        type: "text/css"
      })
    );
    styleSheet = document.head.querySelector(".custom-font")!;
  }
  const css = [];
  switch (font) {
    case "Default Font":
    default:
      break;
    case "Comic Sans MS":
      css.push(comicSans);
      break;
    case "Helvetica":
      css.push(helvetica);
      break;
    case "Trebuchet MS":
      css.push(trebuchet);
      break;
    case "Verdana":
      css.push(verdana);
      break;
  }
  styleSheet.textContent = css.join("\n");
}
