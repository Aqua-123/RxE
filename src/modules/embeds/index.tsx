import { isYoutube, returnInnerHtml, isSpotify } from "./utils";
import { desanitizeURL } from "../richtext/linkutils";
import css from "./style.scss";
import { loadCSS } from "~src/utils";
import { P, Preferences } from "~src/preferences";

// room-component-message-text
function embedMessages(className: string) {
  const allowEmbeds = Preferences.get(P.toggleEmbeds);
  if (!allowEmbeds) return;
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
