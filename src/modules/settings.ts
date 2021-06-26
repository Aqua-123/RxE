// ritsu settings

import { P, Preferences } from "~src/preferences";
import { Theme } from "~src/themes";

type Settings = {
  theme: Theme;
  hacks: {
    disableNags: boolean;
    enableModUI: boolean;
    universalFriend: boolean;
    fancyColors: boolean;
  };
};

// TODO: populate from preferences and defaults.
export const settings: Settings = {
  theme: Preferences.get(P.theme) as Settings["theme"],
  hacks: {
    disableNags: Preferences.get(P.disableNags),
    enableModUI: Preferences.get(P.enableModUI),
    universalFriend: Preferences.get(P.universalFriend),
    fancyColors: Preferences.get(P.fancyColors),
  },
};
