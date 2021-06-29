// open WFAF: RoomClient.switch({id:null, mode:'private'})
import { crel } from "~src/utils";
import T from "~src/text";

export function renderWFAF() {
  const channels = document.querySelectorAll(".channel-unit");
  if (!channels.length) return;
  const lastChannel = channels[channels.length - 1];
  if (lastChannel.textContent === T.WFAF) return;
  const div = crel("div", {
    className: "wfaf channel-unit",
    textContent: T.WFAF,
    onclick: () => joinWFAF()
  });
  lastChannel.parentElement?.insertBefore(div, lastChannel.nextSibling);
}

function joinWFAF() {
  // base WFAF: RoomClient.switch({ id: null, mode: "private"})
  RoomClient.setState({ messages: [], current_channel: null });
  RoomChannelMembersClient.setState({ members: [] });
  App.room.join(null);
  document
    .querySelectorAll(".channel-unit")
    .forEach(channel => channel.classList.remove("channel-unit-active"));
  document.querySelector(".wfaf")?.classList.add("channel-unit-active");
}
