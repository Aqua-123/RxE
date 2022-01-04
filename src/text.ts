import U from "./userscript";

export default {
  title: `${U.name} ${U.version}`,
  themeTitle: "Choose your theme",
  ...(FEATURES.HACKS && { hacksTitle: "Enable various hacks here" }),
  generalTitle: "General Settings",
  imagesTitle: "Image Settings",
  messageTitle: "Message Settings",
  preferences: {
    theme: {
      label: "Theme",
      description: "Reskin the chat"
    },
    ...(FEATURES.HACKS && {
      superTemp: {
        label: "Remove some temporary account restrictions"
      },
      enableModUI: {
        label: "Enable non-functional Moderator interface"
      },
      universalFriend: {
        label: "Access any profile"
      },
      antiBan: {
        label: "Prevent bans from closing the chat immediately"
      }
    }),
    adBlocker: {
      label: "Remove ads and nags"
    },
    fancyColors: {
      label: "Use any color for your flair"
    },
    imgControl: {
      label: "Overlay controls to block and favorite images"
    },
    imgProtect: {
      label: "Hide images from low karma accounts"
    },
    imgBlur: {
      label: "Blur all user images until hovered"
    },
    hidePfp: {
      label: "Hide profile pictures in chat"
    },
    showInfo: {
      label: "Show user info (karma,gender,since) on messages"
    },
    antiSpam: {
      label: "Auto-mute users flooding the chat"
    },
    showGender: {
      label: "Gender-color the outline around avatars"
    },
    trackKarma: {
      label: "Display Karma in header and track changes"
    },
    mutetoggle: {
      label: "Toggle perma mute"
    },
    mutelist: {
      label: "Perma mute list"
    },
    userSort: {
      label: "Sort users by..",
      "name.asc": "Name Asc.",
      "name.desc": "Name Desc.",
      "age.asc": "Account age Asc.",
      "age.desc": "Account age Desc."
    }
  },
  hiddenChannels: "hidden channels",
  WFAF: "WFAF ⌛",
  privateRooms: "Private Rooms 🔒",
  privateRoomsPrompt:
    "Enter a private room key:\nOnly people with the key can enter this room.",
  privateRoomsWarning:
    "Chat history and user list is not available in unlisted rooms.",
  ...(FEATURES.HACKS && {
    banMessage:
      "⚠️ You have been banned! You may not be able to rejoin the chat! ⚠️"
  })
} as const;
