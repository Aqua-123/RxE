import { getImageType } from "~src/bitutils";
import { P, Preferences } from "~src/preferences";
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
        if (img.src.startsWith("https://robohash.org/yay"))
          img.src = "https://emeraldchat.com/avicons_strict/1.png";
        if (
          img.src.startsWith("https://robohash.org/") ||
          img.src.includes("/avicons_strict/") ||
          img.src.startsWith("data:image") ||
          img.classList.contains("room-component-message-picture")
        )
          return;
        img.src = `https://robohash.org/yay${img.src}.png?set=set4`;
      };
    }
    if (img.complete && img.naturalHeight === 0) {
      img.onerror("");
    }
    if (
      !Preferences.get(P.showAnimatedImages) &&
      img.src.startsWith("https://i.imgur.com/") &&
      !img.classList.contains("ritsu-image-static") &&
      !img.classList.contains("zoomIn")
    ) {
      const url = img.src;
      img.src = "https://emeraldchat.com/avicons_strict/1.png";
      if (img.classList.contains("ritsu-image-static")) return;
      getImageType(url).then((type) => {
        if (img.classList.contains("ritsu-image-static")) return;
        if (type === "image/gif") return;
        img.classList.add("ritsu-image-static");
        img.src = url;
      });
    }
  });
}
