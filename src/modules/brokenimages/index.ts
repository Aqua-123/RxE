import tickSVG from "./tick.svg";

// 1. replace /badges/tick.svg broken images with a data: tickSVG URI
// 2. do something cool with other broken images somehow.

export function renderBrokenImages() {
  const images = document.querySelectorAll('img[src*="/badges/tick.svg"]');
  images.forEach((img) => {
    // can't set a data: URI in <img>, blocked by CSP. be violent instead.
    const parent = img.parentElement;
    img.outerHTML = tickSVG;
    parent?.querySelector("svg")?.classList.add("user-badge-tick");
  });
}
// TODO: also /avicons_strict/1.png for older accounts.. (1-32.png apparently. lame.)
