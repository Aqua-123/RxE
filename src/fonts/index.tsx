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

/*
export const fontsQuery = [
  { value: "roboto", label: "Default Font" },
  {
    value: "comic_sans",
    label: "Comic Sans MS"
  },
  {
    value: "helvetica",
    label: "Helvetica"
  },
  {
    value: "trebuchet",
    label: "Trebuchet MS"
  },
  { value: "verdana", label: "Verdana" }
];
*/
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
// export type Font = typeof fontsQuery[number]["value"];

// function defaultFont() {
//   const body = document.getElementsByTagName("body")[0];
//   body.style.font = "14px Roboto";
//   const microposts = document.querySelectorAll(
//     ".user-profile-micro"
//   ) as NodeListOf<HTMLElement>;
//   Array.from(microposts).forEach((element) => {
//     element.style.fontFamily = "Roboto !important";
//   });
//   const menuNotif = document.querySelectorAll(
//     ".notification-menu-container-text"
//   ) as NodeListOf<HTMLElement>;
//   Array.from(menuNotif).forEach((element) => {
//     element.style.fontFamily = "Roboto";
//   });
// }

// function changeFont(font: string) {
//   const body = document.getElementsByTagName("body")[0];
//   const size = "14px ";
//   body.style.font = `${size + font}`;
//   const microposts = document.querySelectorAll(
//     ".user-profile-micro"
//   ) as NodeListOf<HTMLElement>;
//   const importantTag = " !important";
//   Array.from(microposts).forEach((element) => {
//     element.style.fontFamily = `${font + importantTag}`;
//   });
//   const menuNotif = document.querySelectorAll(
//     ".notification-menu-container-text"
//   ) as NodeListOf<HTMLElement>;
//   Array.from(menuNotif).forEach((element) => {
//     element.style.fontFamily = font;
//   });
//   const micro = document.querySelectorAll(
//     ".user-micropost-unit"
//   ) as NodeListOf<HTMLElement>;
//   Array.from(micro).forEach((element) => {
//     element.style.fontFamily = font;
//   });
// }

export function initFont() {
  const font = Preferences.get(P.font) as FontLabel;
  let styleSheet = document.head.querySelector(".custom-font");
  console.log(font);
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
  // const font = Preferences.get(P.font) as FontLabel;
  // if (!font || font === "Default Font") changeFont("Roboto");
  // // const fontLabel = fontsQuery[font];
  // else changeFont(font);
  //
  // switch (font.value) {
  //   case "roboto":
  //   default:
  //     changeFont(font.label[0]);
  //     break;
  //   case "comic_sans":
  //     changeFont(font.label[1]);
  //     break;
  //   case "helvetica":
  //     changeFont(font.label[2]);
  //     break;
  //   case "trebuchet":
  //     changeFont(font.label[3]);
  //     break;
  //   case "verdana":
  //     changeFont(font.label[4]);
  //     break;
  // }
}
