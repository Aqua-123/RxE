// open WFAF: RoomClient.switch({id:null, mode:'private'})
import { crel } from "~src/utils";
import T from "~src/text";

export function renderWFAF() {
  const channels = document.querySelectorAll(".channel-unit");
  if (!channels.length) return;
  const lastChannel = channels[channels.length - 1];
  if (lastChannel.textContent === T.WFAF) return;
  const div = crel("div", {
    className: "channel-unit",
    textContent: T.WFAF,
    onclick: () => RoomClient.switch({ id: null, mode: "private" })
  });
  lastChannel.parentElement?.insertBefore(div, lastChannel.nextSibling);
}
