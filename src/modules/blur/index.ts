import { loadCSS } from "~src/utils";
import blurCSS from "./style.scss";

export function applyBlurs() {
  const arrElements = document.querySelectorAll(
    ".navigation-notification-unit-image"
  ) as NodeListOf<HTMLImageElement>;
  console.log(arrElements);
  arrElements.forEach((element) => {
    if (
      element.src.includes("robohash") ||
      element.classList.contains("ritsu-would-blur")
    )
      return;
    element.classList.add("ritsu-would-blur");
    console.log("blurring", element.src);
  });
}

export function initPicturesBlur() {
  loadCSS(blurCSS);
}
