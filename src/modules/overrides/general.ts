export function generalOverrides() {
  // increase the lower limit of karma
  App.karma.data[0].range[1] = -Infinity;
  // non-hack: "Sign up to continue" only shows once at start
  App.temp.check = () => {};
  // Hides the annoying useless gender pop-up
  SetGenderRenderer.render = function setGenderRender() {};
}
