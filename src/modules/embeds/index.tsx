import { isUrlImageHost, isYoutube, returnInnerHtml, isSpotify } from "./utils";
import { desanitizeURL } from "../richtext/linkutils";
import css from "./style.scss";
import { loadCSS } from "~src/utils";

// room-component-message-text
function embedMessages(className: string, noImage: boolean) {
  const messageList = document.querySelectorAll(`.${className}`);
  const newLineHtml = "<br>";
  // get child divs
  if (!messageList.length) return;
  messageList.forEach((element) => {
    const childs = Array.from(element.children);
    if (!childs.length) return;
    childs.forEach((message) => {
      // check if embed already created
      const childies = Array.from(message.children);
      if (childies.some((child) => child.classList.contains("embed"))) return;
      const messageboi = message as HTMLElement;
      const oldInnerHTML = messageboi.innerHTML;
      const text = desanitizeURL(oldInnerHTML);

      if (!isYoutube(text) && !isUrlImageHost(text) && !isSpotify(text)) return;
      // preventing image embeds in posts cause that will be yucky
      if (!isSpotify(text) && noImage) return;
      const embed = document.createElement("div");
      embed.classList.add("embed");
      messageboi.innerHTML = "";
      embed.innerHTML = oldInnerHTML + newLineHtml + returnInnerHtml(text);
      messageboi.appendChild(embed);
    });
  });
}

export function createEmbeds() {
  loadCSS(css);
  embedMessages("user-comment-right", true);
  embedMessages("user-micropost-right", true);
  embedMessages("room-component-message-text", false);
}
