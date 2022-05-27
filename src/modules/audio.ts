export function initAudio() {
  // fix Audio button so it's persistent as intended
  document.body.addEventListener("mouseup", ({ target }) => {
    if (
      target instanceof HTMLElement &&
      target.classList.contains("mute-button")
    )
      Cookies.set("muted", MuteButtonClient.state.muted ? "t" : "");
  });

  // if no setting found, start with audio ping on every message disabled
  MuteButton.prototype.componentDidMount = function componentDidMount() {
    const muted = Cookies.get("muted");
    this.setState({
      muted: muted === "t" || muted === undefined
    });
  };
}
