import { P, Preferences } from "~src/preferences";

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

export type Font =
  | "roboto"
  | "comic_sans"
  | "helvetica"
  | "trebuchet"
  | "verdana";

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

function changeFont(font: string) {
  const body = document.getElementsByTagName("body")[0];
  const size = "14px ";
  body.style.font = size.concat(font);
  const microposts = document.querySelectorAll(
    ".user-profile-micro"
  ) as NodeListOf<HTMLElement>;
  const importantTag = " !important";
  Array.from(microposts).forEach((element) => {
    element.style.fontFamily = font.concat(importantTag);
  });
  const menuNotif = document.querySelectorAll(
    ".notification-menu-container-text"
  ) as NodeListOf<HTMLElement>;
  Array.from(menuNotif).forEach((element) => {
    element.style.fontFamily = font;
  });
}

export function initFont() {
  const font = Preferences.get(P.font) as Font;
  if (!font) changeFont("roboto");
  const fontLabel = fontsQuery[font];
  changeFont(fontLabel);
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
