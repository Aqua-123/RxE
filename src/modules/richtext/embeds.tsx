import {
  isUrlImageHost,
  isYoutube,
  returnInnerHtml,
  desanitizeURL
} from "./linkutils";
import css from "./style.scss";
import { loadCSS } from "~src/utils";

export function createEmbeds() {
  loadCSS(css);
  const messageList = document.querySelectorAll(".room-component-message-text");
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
      const oldInnerHTML = messageboi.innerHTML;

      if (!isYoutube(text) && !isUrlImageHost(text)) return;

      const embed = document.createElement("div");
      embed.classList.add("embed");
      messageboi.innerHTML = "";
      embed.innerHTML = oldInnerHTML + newLineHtml + returnInnerHtml(text);
      messageboi.appendChild(embed);
    });
  });
}
