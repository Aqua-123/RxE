import { BuildConfig, distFileName } from "./lib/userscripter/src/build";
import Manifest from "webextension-manifest";

import U from "./src/userscript";

const runMap = {
  "document-start": "document_start",
  "document-end": "document_end",
  "document-idle": "document_idle"
} as const;

export default function(_: BuildConfig): Manifest {
  return {
    manifest_version: 2,
    name: U.name,
    version: U.version,
    description: U.description,
    author: U.author,
    content_scripts: [
      {
        matches: [
          `*://${U.hostname}/${U.path ?? "*"}`,
          `*://www.${U.hostname}/${U.path ?? "*"}`
        ],
        js: [distFileName(U.id, "user")],
        run_at: runMap[U.runAt] ?? "document_start"
      }
    ],
    icons: {
      "16": "assets/logo-16.png",
      "32": "assets/logo-32.png",
      "48": "assets/logo-48.png",
      "128": "assets/logo-128.png"
    }
  };
}
