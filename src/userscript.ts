export default {
  id: "ritsu-emerald",
  name: "Ritsu x Emerald PreProd",
  shortName: "RxE",
  version: "0.11.3.4", // yarn bump to update version
  description: "Custom Emerald Chat themes and fixes.",
  icon: "https://i.imgur.com/KLtVhho.png",
  author: "Atsos/Ritsu, Aqua, Strawberry.",
  hostname: "em-preprod.herokuapp.com",
  path: "app",
  sitename: "Emerald Chat",
  namespace: "Emerald Bot - Ritsu Project",
  runAt: "document-end",
  grant: ["GM_getValue", "GM_deleteValue", "unsafeWindow"]
} as const;
