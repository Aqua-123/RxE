import { isYoutube, returnInnerHtml, isSpotify } from "./utils";
import { desanitizeURL } from "../richtext/linkutils";
import css from "./style.scss";
import { loadCSS } from "~src/utils";
import { P, Preferences } from "~src/preferences";

function embedMessages(className: string) {
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

export function createEmbeds() {
  loadCSS(css);
  embedMessages("user-comment-right");
  embedMessages("user-micropost-right");
  embedMessages("room-component-message-text");
}
