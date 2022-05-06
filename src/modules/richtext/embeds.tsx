import {
  isUrlImageHost,
  isYoutube,
  // isSpotify,
  // isTwitch,
  returnInnerHtml,
  desanitizeURL
} from "./linkutils";
import css from "./style.scss";
import { loadCSS } from "~src/utils";

export function createEmbeds() {
  loadCSS(css);
  const messageList = document.querySelectorAll(".room-component-message-text");
  // get child divs
  if (!messageList.length) return;
  messageList.forEach((element) => {
    const childs = Array.from(element.children);
    if (!childs.length) return;
    childs.forEach((message) => {
      const messageboi = message as HTMLElement;
      const text = desanitizeURL(messageboi.innerText);
      const oldInnerHTML = messageboi.innerHTML;
      // check if already has embed loaded
      const newLineHtml = "<br>";
      const childies = Array.from(message.children);
      if (childies.some((child) => child.classList.contains("embed"))) return;
      console.log(text);
      if (
        isYoutube(text) ||
        // isSpotify(text) ||
        // isTwitch(text) ||
        isUrlImageHost(text)
      ) {
        const embed = document.createElement("div");
        embed.classList.add("embed");
        messageboi.innerHTML = "";
        const newInnerHTML = returnInnerHtml(text);
        console.log(newInnerHTML);
        embed.innerHTML = oldInnerHTML + newLineHtml + newInnerHTML;
        messageboi.appendChild(embed);
      }
    });
  });
}
// https://www.youtube.com/watch?v=KvxFD8HXD4E
// https://open.spotify.com/playlist/37i9dQZF1EXguaIz0PIIjG?si=90da8c589337411c
// https://open.spotify.com/track/3t4KHjd8uQpJJ2fa0fRIpR?si=41065d8edb2c4d1f
