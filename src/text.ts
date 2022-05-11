import U from "./userscript";

export default {
  title: `${U.name} ${U.version}`,
  themeTitle: "Choose your theme",
  ...(FEATURES.HACKS && { hacksTitle: "Extra Settings" }),
  generalTitle: "General Settings",
  imagesTitle: "Image Settings",
  messageTitle: "Message Settings",
  mutelistTitle: "Permanent Mutes",
  advancedTitle: "Advanced Settings",
  preferences: {
    theme: {
      label: "Theme",
      description: "Reskin the chat"
    },
    ...(FEATURES.HACKS && {
      superTemp: {
        label: "Spoof karma and registered status locally"
      },
      enableModUI: {
        label: "Spoof mod status locally"
      },
      universalFriend: {
        label: "See any user's profile"
      },
      antiBan: {
        label: "Ignore ban temporarily"
      }
    }),
    adBlocker: {
      label: "Remove ads and nags"
    },
    fancyColors: {
      label: "Choose your own flair color"
    },
    imgControl: {
      label: "Block and favorite images"
    },
    imgProtect: {
      label: "No images from low karma accounts"
    },
    imgBlur: {
      label: "Blur user images"
    },
    hidePfp: {
      label: "Hide profile pictures in chat"
    },
    showInfo: {
      label: "Show extra user info"
    },
    antiSpam: {
      label: "Mute spammers automatically"
    },
    showGender: {
      label: "Show gender on profile pictures"
    },
    trackKarma: {
      label: "Show live karma & flash changes"
    },
    mutelist: {
      label: "Perma mute list"
    },
    userSort: {
      "label": "Sort users by..",
      "name.asc": "Name Asc.",
      "name.desc": "Name Desc.",
      "age.asc": "Account age Asc.",
      "age.desc": "Account age Desc."
    },
    blockReqs: {
      label: "Block friend requests from new accounts"
    },
    highlightMentions: {
      label: "Highlight your name when you're mentioned"
    },
    altpfpBackground: {
      label: "Choose the background colour for transparent pictures"
    },
    bigEmoji: {
      label: "Jumbo-sized emoji"
    },
    hideImageFallback: {
      label: "Hide your images from non-RxE users"
    },
    ignoreURLBlacklist: {
      label: "Ignore URL blacklist"
    },
    imgurAPIKey: {
      placeholder: "Imgur API Key",
      label: "Leave blank for default"
    },
    muteRegexes: {
      label: "Mute users matching"
    },
    toggleEmbeds: {
      label: "Show embeds"
    },
    largerText: {
      label: "Increase text size"
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
