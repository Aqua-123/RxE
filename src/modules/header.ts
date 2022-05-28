// #9. Decorate Header
import U from "~src/userscript";
import { crel } from "~src/utils";
import { getDisplayPicture } from "./altpfp/interceptUser";

const logo = document.querySelector(".main-logo");
function setLogo() {
  const displayPicture = getDisplayPicture(App.user);
  if (!(logo instanceof HTMLImageElement) || logo.src === displayPicture)
    return;
  logo.src = displayPicture;
}
function setFavicon() {
  if (document.head.querySelector(`link[rel="icon"][href="${U.icon}"]`)) return;
  document.head
    .querySelectorAll(`link[rel="icon"]`)
    .forEach((node) => node.remove());
  const favicon = crel("link", {
    rel: "icon",
    href: U.icon
  });
  document.head.prepend(favicon);
}

function addKarmaPlaceholder() {
  const karmaTracker = document.querySelector(".karma-tracker");
  if (karmaTracker) return;
  const tracker = crel("div", {
    className: "karma-tracker"
  });
  logo?.parentElement?.insertBefore(tracker, logo?.nextSibling);
}

function fullScreenButton() {
  const iconsHolder = document.querySelector(".navigation-notification-icons");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (
    document.fullscreenEnabled &&
    iconsHolder?.children &&
    !Array.from(iconsHolder?.children).some((child) =>
      child?.textContent?.includes("full")
    ) &&
    !isMobile
  ) {
    const fullscreenIcon = crel("span", {
      className: "material-icons navigation-notification-unit",
      textContent: "open_in_full",
      onmousedown: async () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          fullscreenIcon.textContent = "open_in_full";
        } else {
          await document.body.requestFullscreen();
          fullscreenIcon.textContent = "close_fullscreen";
        }
      }
    });
    const icon = crel("span");
    icon.append(fullscreenIcon);
    iconsHolder.prepend(icon);
  }
}
function addTextToLogo() {
  const displayName = App.user.display_name ?? "(...)";
  const title = `${displayName} - ${U.shortName} ${U.version}`;
  if (document.title !== title) document.title = title;
  const logoText = document.querySelector(".main-logo-text");
  if (!logoText) {
    const text = crel("div", {
      className: "main-logo-text",
      textContent: title
    });
    logo?.parentElement?.insertBefore(text, logo?.nextSibling);
  } else if (logoText.textContent !== title) {
    logoText.textContent = title;
  }
}

export function decorateHeader() {
  if (!logo) return;
  setLogo();
  setFavicon();
  // add karma placeholder
  addKarmaPlaceholder();
  // add text next to logo and add title
  addTextToLogo();
  // add fullscreen button
  fullScreenButton();
}
