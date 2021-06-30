import tickSVG from "./tick.svg";

// 1. replace /badges/tick.svg broken images with a data: tickSVG URI
// 2. do something cool with other broken images somehow.

export function renderBrokenImages() {
  const goldImages = document.querySelectorAll('img[src*="/badges/tick.svg"]');
  goldImages.forEach((img) => {
    // can't set a data: URI in <img>, blocked by CSP. be violent instead.
    const parent = img.parentElement;
    img.outerHTML = tickSVG;
    parent?.querySelector("svg")?.classList.add("user-badge-tick");
  });
  const oldImages = document.querySelectorAll<HTMLImageElement>(
    'img[src*="/avicons_strict/"]'
  );
  oldImages.forEach((img) => {
    img.src =
      "https://static.emeraldchat.com/uploads/picture/image/9675465/avicons_strict.png";
  });
}
