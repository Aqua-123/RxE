import { loadCSS } from "~src/utils";
import blurCSS from "./style.scss";

export function applyBlurs() {
  const toBeBlurred = [
    "room-component-message-picture",
    "navigation-notification-unit-image"
  ];
  toBeBlurred.forEach((className) => {
    const arrElements = document.querySelectorAll(
      `.${className}`
    ) as NodeListOf<HTMLImageElement>;
    arrElements.forEach((element) => {
      if (
        element.src.includes("robohash") ||
        element.classList.contains("ritsu-would-blur")
      )
        return;
      element.classList.add("ritsu-would-blur");
    });
  });
}

export function initPicturesBlur() {
  loadCSS(blurCSS);
}
