export default {
  id: "ritsu-emerald",
  name: "Ritsu x Emerald",
  shortName: "RxE",
  version: "0.11.1.1", // also check package.json
  description: "Custom Emerald Chat themes and fixes.",
  icon: "https://i.imgur.com/KLtVhho.png",
  author: "Atsos/Ritsu, Aqua, Strawberry.",
  hostname: "emeraldchat.com",
  path: "app",
  sitename: "Emerald Chat",
  namespace: "Emerald Bot - Ritsu Project",
  runAt: "document-end",
  grant: ["GM_getValue", "GM_deleteValue", "unsafeWindow"]
} as const;
