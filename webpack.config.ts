import * as AppRootPath from "app-root-path";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import {
  createWebpackConfig,
  DEFAULT_BUILD_CONFIG,
  DEFAULT_METADATA_SCHEMA
} from "./lib/userscripter/src/build";

import MANIFEST from "./manifest";
import METADATA from "./metadata";
import * as CONFIG from "./src/config";
import * as SITE from "./src/site";
import U from "./src/userscript";

const config: webpack.Configuration = {
  ...createWebpackConfig({
    buildConfig: {
      ...DEFAULT_BUILD_CONFIG({
        rootDir: AppRootPath.path,
        id: U.id,
        now: new Date()
      }),
      sassVariables: { CONFIG, SITE }
    },
    manifest: MANIFEST,
    metadata: METADATA,
    metadataSchema: DEFAULT_METADATA_SCHEMA,
    env: process.env
  }),
  externals: {
    react: "React",
    "react-dom": "ReactDOM"
  },
  devServer: {
    liveReload: false,
    port: 9001,
    open: true,
    before: app =>
      app.get("/", (req, res) =>
        res.send(`
        <h1>${U.name} Dev Server</h1>
        <h3>Feature flags enabled: 
          ${!!process.env.HACKS ? "HACKS" : ""}
          ${!!process.env.P2P ? "P2P" : ""}
        </h3>
        <a href='${U.id}.user.js'
        style="display:inline-block;border:1px outset #aaa;background: #eee;border-radius: 5px;padding: .5em;font-weight: 600;color: #b821bd;text-decoration: none;">
        <img width="48" referrerPolicy="no-referrer" 
        src="${U.icon}" valign="middle">
        Install UserScript</a>
        <iframe src="/${U.id}.meta.js" 
        style="border:0;width:100%;height:200px"/>
      `)
      )
  }
};
config.plugins!.unshift(
  new webpack.DefinePlugin({
    "FEATURES.HACKS": JSON.stringify(!!process.env.HACKS ?? false),
    "FEATURES.P2P": JSON.stringify(!!process.env.P2P ?? false)
  })
);

export default config;
