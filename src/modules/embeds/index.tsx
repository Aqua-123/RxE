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
    const childs = Array.from(element.children);
    if (!childs) return;
    childs.forEach((message) => {
      // check if embed already created
      const children = Array.from(message.children);
      if (children.some((child) => child.classList.contains("embed"))) return;
      const messageboi = message as HTMLElement;
      const text = desanitizeURL(messageboi.innerText);
      if (!isYoutube(text) && !isSpotify(text)) return;
      const embed = document.createElement("div");
      embed.classList.add("embed");
      messageboi.innerHTML = "";
      embed.innerHTML = newLineHtml + returnInnerHtml(text);
      messageboi.appendChild(embed);
    });
  });
}

export function createEmbeds() {
  loadCSS(css);
  embedMessages("user-comment-right");
  embedMessages("user-micropost-right");
  embedMessages("room-component-message-text");
}
