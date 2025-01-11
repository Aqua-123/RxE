export default {
  id: "ritsu-emerald",
  name: "Ritsu x Emerald",
  shortName: "RxE",
  version: "0.13.5.6", // yarn bump to update version
  description: "Custom Emerald Chat themes and fixes.",
  icon: "https://i.imgur.com/14f9VD4.png",
  author: "Atsos/Ritsu, Aqua, Strawberry, Teriyaki",
  hostname: "emeraldchat.com",
  path: "app",
  sitename: "Emerald Chat",
  namespace: "Emerald Bot - Ritsu Project",
  runAt: "document-end",
  grant: ["GM_getValue", "GM_deleteValue", "unsafeWindow"]
} as const;
