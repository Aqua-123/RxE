import * as CONFIG from "./config";
import U from "./userscript";

export default {
  title: `${U.name} ${U.version}`,
  themeTitle: "Choose your theme",
  ...(FEATURES.HACKS && { hacksTitle: "Enable various hacks here" }),
  imagesTitle: "Image Settings",
  messageTitle: "Message Settings",
  preferences: {
    theme: {
      label: "Theme",
      description: "Reskin the chat"
    },
    ...(FEATURES.HACKS && {
      disableNags: {
        label: "Remove ads, nagging and limits on temp accounts"
      },
      enableModUI: {
        label: "Enable non-functional Moderator interface"
      },
      universalFriend: {
        label: "Access any profile"
      },
      fancyColors: {
        label: "Use any color for your flair"
      }
    }),
    imgControl: {
      label: "Overlay controls to block and favorite images"
    },
    imgProtect: {
      label: "Hide images from low karma accounts"
    },
    imgBlur: {
      label: "Blur all user images until hovered"
    },
    showInfo: {
      label: "Show user info (karma,gender,since) on messages"
    },
    antiSpam: {
      label: "Auto-mute users flooding the chat"
    }
  }
} as const;
