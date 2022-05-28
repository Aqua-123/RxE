export function generalOverrides() {
  // increase the lower limit of karma
  App.karma.data[0].range[1] = -Infinity;
}
