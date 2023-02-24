// #9. Decorate Header
import U from "~src/userscript";
import { crel } from "~src/utils";

function setLogo(logo: Element) {
  const displayPicture = App.user.display_picture;
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

function addKarmaPlaceholder(logo: Element) {
  const karmaTracker = document.querySelector(".karma-tracker");
  if (karmaTracker) return;
  const tracker = crel("div", {
    className: "karma-tracker"
  });
  logo?.parentElement?.insertBefore(tracker, logo?.nextSibling);
}

function headerIcons() {
  const iconsHolder = document.querySelector(".navigation-notification-icons");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!iconsHolder?.children) return;
  if (
    document.fullscreenEnabled &&
    !iconsHolder.querySelector(".ritsu-button-fullscreen") &&
    !isMobile
  ) {
    const fullscreenIcon = crel("span", {
      className:
        "material-icons navigation-notification-unit ritsu-button-fullscreen",
      textContent: "open_in_full",
      tabIndex: -1,
      role: "button",
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
  if (!iconsHolder.querySelector(".ritsu-icon-network-unavail")) {
    const networkText =
      "Emerald is not responding - switching chats is not recommended.";
    const networkIcon = crel("span", {
      className:
        "material-icons navigation-notification-unit ritsu-icon-network-unavail",
      textContent: "signal_cellular_alt",
      tabIndex: -1,
      role: "button",
      title: networkText,
      onmousedown: () => alert(networkText)
    });
    const icon = crel("span");
    icon.append(networkIcon);
    iconsHolder.prepend(icon);
  }
}
function addTextToLogo(logo: Element) {
  const displayName = App.user.display_name || "(...)";
  const title = `${displayName} - ${U.shortName} ${U.version}`;
  if (document.title !== title) document.title = title;
  const logoText = document.querySelector(".main-logo-text");
  if (!logoText) {
    const text = crel("div", {
      className: "main-logo-text",
      textContent: title
    });
    if (logo.parentElement)
      logo.parentElement.insertBefore(text, logo.nextSibling);
  }
  if (logoText && logoText.textContent !== title) {
    logoText.textContent = title;
  }
}

export function decorateHeader() {
  const logo = document.querySelector(".main-logo");
  if (!logo) return;
  headerIcons();
  setLogo(logo);
  setFavicon();
  addKarmaPlaceholder(logo);
  addTextToLogo(logo);
}
