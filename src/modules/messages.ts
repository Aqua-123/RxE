import { P, Preferences } from "~src/preferences";
import { crel } from "~src/utils";

export function decorateMessages() {
  const messages = document.querySelectorAll(
    ".room-component-message-container"
  );
  const msgs = RoomClient?.state?.messages;
  if (msgs?.length) {
    if (msgs.length !== messages.length) {
      console.error("message mismatch!", { messages, msgs });
      return;
    }
    for (let i = 0; i < msgs.length; i++) {
      const msgElt = messages[i];
      const msgFlair = msgElt.querySelector(".room-component-flair");
      const { messages: lines, user, picture } = msgs[i];
      if (Preferences.get(P.imgProtect) && picture) {
        const img = msgElt.querySelector(".room-component-message-text")
          ?.firstChild?.firstChild;
        if (img instanceof Image && (user.temp || user.karma < 10)) {
          img.remove();
        }
      }
      if (msgFlair instanceof HTMLElement) {
        let msgExtra = msgFlair.querySelector(".user-extra");
        if (Preferences.get(P.showInfo)) {
          if (!msgExtra) {
            msgExtra = crel("span", { className: "user-extra" });
          } else {
            msgExtra.innerHTML = "";
          }
          msgExtra.append(crel("b", { textContent: "\xa0Karma:\xa0" }));
          msgExtra.append(crel("span", { textContent: user.karma }));
          msgExtra.append(crel("b", { textContent: "\xa0Since:\xa0" }));
          msgExtra.append(
            crel("span", {
              textContent: new Date(user.created_at).toLocaleDateString()
            })
          );
          if (user.master) {
            msgExtra.append(
              crel("b", {
                style: "color: rgb(255,0,0)",
                textContent: "\xa0CALLAN"
              })
            );
          }
          if (user.mod) {
            msgExtra.append(
              crel("b", {
                style: "color: rgb(255,0,0)",
                textContent: "\xa0MOD"
              })
            );
          }
          msgFlair.append(msgExtra);
        } else {
          if (msgExtra) msgExtra.innerHTML = "";
        }
      }
      // clean up Facing Ditto's mess
      const divs = msgElt?.querySelector(
        ".room-component-message-text"
      )?.childNodes;
      while (divs && divs.length > lines.length) {
        divs[0].remove();
      }
    }
  }
}
