// #9. Decorate Header
import U from "~src/userscript";
import { crel } from "~src/utils";

export function decorateHeader() {
  // replace logo
  const logo = document.querySelector(".main-logo");
  if (logo instanceof HTMLImageElement && logo.src !== U.icon) {
    logo.src = U.icon;
  }
  // set favicon
  if (!document.head.querySelector(`link[rel="icon"][href="${U.icon}"]`)) {
    document.head
      .querySelectorAll(`link[rel="icon"]`)
      .forEach((node) => node.remove());
    const favicon = crel("link", {
      rel: "icon",
      href: U.icon
    });
    document.head.prepend(favicon);
  }
  // set title
  const title = `${U.name} ${U.version}`;
  if (document.title !== title) {
    document.title = title;
  }
  // add text next to logo
  const logoText = document.querySelector(".main-logo-text");
  if (!logoText) {
    const text = crel("div", {
      className: "main-logo-text",
      textContent: title
    });
    logo?.parentElement?.insertBefore(text, logo?.nextSibling);
  }
  // add fullscreen button
  const iconsHolder = document.querySelector(".navigation-notification-icons");
  if (
    document.fullscreenEnabled &&
    iconsHolder?.firstChild?.textContent?.indexOf("full") === -1
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
