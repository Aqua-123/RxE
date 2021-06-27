// #1. Overriding builtin behaviors

import { P, Preferences } from "~src/preferences";

export function accountOverrides() {
  if (process.env.HACKS !== "OFF") {
    if (Preferences.get(P.disableNags!)) {
      App.user.karma = 31337;
      App.user.temp = false;
      UpgradeClient.form = () => {};
      Cookies.set("goldad", "1");
    }
    if (Preferences.get(P.enableModUI!)) {
      App.user.master = true;
      App.user.mod = true;
      ModPanel.prototype.componentDidMount = function() {
        this.setState({ tab: "default" });
      };
    }
    setTimeout(accountOverrides, 1000);
  }
}
