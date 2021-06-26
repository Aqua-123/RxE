import { Metadata } from "userscript-metadata";
import { BuildConfig } from "./lib/userscripter/src/build";

import U from "./src/userscript";

export default function(_: BuildConfig): Metadata {
  return {
    name: U.name,
    version: U.version,
    description: U.description,
    author: U.author,
    icon: U.icon,
    match: [`*://${U.hostname}/*`, `*://www.${U.hostname}/*`],
    namespace: U.namespace,
    run_at: U.runAt
  };
}
