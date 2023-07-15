import { isYoutube, returnInnerHtml, isSpotify } from "./utils";
import { desanitizeURL } from "~src/modules/rendering/richtext/linkutils";
import css from "./style.scss";
import { loadCSS } from "~src/utils";
import { P, Preferences } from "~src/preferences";

export function willEmbed(content: string) {
  return isYoutube(content) || isSpotify(content);
}

function embedElements(className: string) {
  const newLineHtml = "<br>";
  const allowEmbeds = Preferences.get(P.toggleEmbeds);
  const messageList = document.querySelectorAll(`.${className}`);
  if (!allowEmbeds || !messageList) return;
  messageList.forEach((element) => {
    const childs = Array.from(element.children) as HTMLElement[];
    if (!childs) return;
    childs.forEach((message) => {
      if (message.querySelectorAll(".embed").length) return;
      const text = desanitizeURL(message.innerText);
      if (!isYoutube(text) && !isSpotify(text)) return;
      const embed = document.createElement("div");
      embed.classList.add("embed");
      embed.innerHTML = newLineHtml + returnInnerHtml(text);
      message.appendChild(embed);
    });
  });
}

export function initEmbeds() {
  loadCSS(css);
}
export function createEmbeds() {
  embedElements("user-comment-right");
  embedElements("user-micropost-right");
  embedElements("room-component-message-text");
}
