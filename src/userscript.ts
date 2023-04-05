export default {
  id: "ritsu-emerald",
  name: "Ritsu x Emerald",
  shortName: "RxE",
  version: "0.12.7.0", // yarn bump to update version
  description: "Custom Emerald Chat themes and fixes.",
  icon: "https://i.imgur.com/KLtVhho.png",
  author: "Atsos/Ritsu, Aqua, Strawberry, Teriyaki",
  hostname: "emeraldchat.com",
  path: "app",
  sitename: "Emerald Chat",
  namespace: "Emerald Bot - Ritsu Project",
  runAt: "document-end",
  grant: ["GM_getValue", "GM_deleteValue", "unsafeWindow"]
} as const;
