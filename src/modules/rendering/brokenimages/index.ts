import { getImageType } from "~src/utils";
import { P, Preferences } from "~src/preferences";
import { urlImageDirectLinkAny } from "../../richtext/linkutils";
import tickSVG from "./tick.svg";

// 1. replace /badges/tick.svg broken images with a data: tickSVG URI
// 2. do something cool with other broken images somehow.

const isStaticImage: Record<string, boolean> = {};

const ROBOHASH = "https://robohash.org/";
const GEM_AVICON = "https://emeraldchat.com/avicons_strict/1.png";
const DATA_IMAGE = "data:image";
const IS_AVICON = (src: string) => src.includes("/avicons_strict/");
const IS_MESSAGE_PIC = (img: Image) =>
  img.classList.contains("room-component-message-picture");
const ROBOHASH_CAT_FALLBACK = (s: string) =>
  `https://robohash.org/yay${s}.png?set=set4`;

// eslint-disable-next-line no-shadow
enum FallbackLevel {
  RobohashFallback,
  AviconFallback,
  NoFallbackAvailable
}

function fallbackLevel(img: Image): FallbackLevel {
  if (IS_MESSAGE_PIC(img)) return FallbackLevel.NoFallbackAvailable;

  if (img.src.startsWith(ROBOHASH) || img.src.startsWith(DATA_IMAGE))
    return FallbackLevel.AviconFallback;

  if (IS_AVICON(img.src)) return FallbackLevel.NoFallbackAvailable;

  return FallbackLevel.RobohashFallback;
}

function useImageFallback(img: HTMLImageElement) {
  if (img.onerror) return;

  img.onerror = async () => {
    switch (fallbackLevel(img)) {
      case FallbackLevel.RobohashFallback:
        img.src = ROBOHASH_CAT_FALLBACK(img.src);
        break;
      case FallbackLevel.AviconFallback:
        img.src = GEM_AVICON;
        break;
      default:
        break;
    }
  };
}

function applyAnimationRestriction(img: Image, srcOriginal?: string) {
  if (isStaticImage[img.src] === true) {
    if (srcOriginal) img.src = srcOriginal;
    return false;
  }
  if (isStaticImage[img.src] === false) {
    img.src = "https://emeraldchat.com/avicons_strict/1.png";
    return true;
  }
  return false;
}

function restrictAnimation(img: Image) {
  if (img.classList.contains("zoomIn")) return;
  if (!urlImageDirectLinkAny().test(img.src)) return;
  const { src: srcOriginal } = img;
  if (applyAnimationRestriction(img)) return;

  getImageType(srcOriginal).then((type) => {
    isStaticImage[srcOriginal] = type !== "image/gif";
    // expected value for an image url = "url" : true
    applyAnimationRestriction(img, srcOriginal);
  });
}

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
    useImageFallback(img);
    if (img.complete && img.naturalHeight === 0) img.onerror?.("");
    if (!Preferences.get(P.showAnimatedImages)) restrictAnimation(img);
  });
}
