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
            // run a bogus user view to get the right setup
            UserViewGenerator.generate({
              event: { preventDefault: () => {}, clientX: 100, clientY: 100 },
              user: {
                karma: 100,
                id: 2
              }
            });
            if (typeof UserViewReact === "undefined") return;
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
