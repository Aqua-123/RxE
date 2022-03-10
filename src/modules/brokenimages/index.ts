import tickSVG from "./tick.svg";

// 1. replace /badges/tick.svg broken images with a data: tickSVG URI
// 2. do something cool with other broken images somehow.

export function renderBrokenImages() {
  // todo: overwrite Badge() -> this.badges.gold instead

  const goldImages = document.querySelectorAll('img[src*="/badges/tick.svg"]');
  goldImages.forEach((img) => {
    // can't set a data: URI in <img>, blocked by CSP. be violent instead.
    const parent = img.parentElement;
    img.outerHTML = tickSVG;
    parent?.querySelector("svg")?.classList.add("user-badge-tick");
  });

  Array.from(document.images).forEach((img) => {
    if (!img.onerror) {
      img.onerror = async () => {
        if (
          img.src.startsWith("https://robohash.org/") ||
          img.src.includes("/avicons_strict/") ||
          img.src.startsWith("data:image") ||
          img.classList.contains("room-component-message-picture")
        )
          return;
        img.src = `https://robohash.org/${img.src}.png?set=set4`;
      };
    }
    if (img.complete && img.naturalHeight === 0) {
      img.onerror("");
    }
  });
}
