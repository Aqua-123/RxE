// fix Audio button so it's persistent as intended
document.body.addEventListener("mouseup", ({ target }) => {
  if (
    target instanceof HTMLElement &&
    target.classList.contains("mute-button")
  ) {
    Cookies.set("muted", MuteButtonClient.state.muted ? "t" : "");
  }
});
