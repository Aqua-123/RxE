import { crel } from "~src/utils";

export function addLookupButton() {
  const roomUserLabel = document.querySelector(
    ".room-component-right .room-user-label"
  );
  if (roomUserLabel) {
    const anyProfileLink = roomUserLabel.querySelector(".lookup-button");
    if (!anyProfileLink) {
      const button = crel("div", {
        className: "material-icons navigation-notification-unit lookup-button",
        textContent: "face",
        onclick: () => {
          if (typeof UserViewReact === "undefined") {
            alert("open a user profile once first");
            return;
          }
          const id = prompt(
            "Enter a user id",
            "" + UserViewReact.state.user.id
          );
          if (id) {
            UserViewReact.state.user.id = +id;
            UserViewReact.view_profile();
          }
        }
      });
      roomUserLabel.append(button);
    }
  }
}
