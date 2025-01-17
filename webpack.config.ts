import * as AppRootPath from "app-root-path";
import webpack from "webpack";
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

const PORT = 9001;
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
    "react": "React",
    "react-dom": "ReactDOM"
  },
  devServer: {
    allowedHosts: ["192.168.*.*"],
    liveReload: false,
    injectClient: false,
    port: PORT,
    open: true,
    before: (app) =>
      app.get("/", (req, res) =>
        res.send(`
<style type="text/css">
a.btn {
  display: inline-block; border: 1px outset #aaa; background: #111112; border-radius: 5px;
  padding: .5em;font-weight: 600;color: #AAABB0;text-decoration: none;
}
a.eme-redirect {
  margin-top: -5.6em;
  padding: 0.7em
}
svg { width:48px;height:48px;vertical-align:middle }
body { background: #020303; color: #AAABB0; }
</style>
<h1>${U.name} Dev Server</h1>
<h3>Feature flags enabled: 
  ${process.env.HACKS ? "HACKS" : ""}
  ${process.env.P2P ? "P2P" : ""}
</h3>
<a href='${U.id}.user.js' class="btn">
<img width="48" referrerPolicy="no-referrer" 
src="${U.icon}" valign="middle">
Install UserScript</a>
<a href='https://www.${U.hostname}/${U.path}' 
valign="middle"
target="_blank" class="btn eme-redirect">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490.7 490.7">
<path d="M245 0a245 245 0 100 491 245 245 0 000-491z" fill="#009688"/>
<path d="M290 105a50 50 0 00-68 0 48 48 0 000 68l19 19H117a53 53 0 000 107h124l-19 19a48 48 0 0068 68l118-118c13-13 13-33 0-45L290 105z" fill="#fafafa"/>
</svg>
Open ${U.sitename}</a>
<iframe src="/${U.id}.meta.js" 
style="border:0;width:100%;height:300px"
onload="(this.contentDocument.body.style.color='#fafafa')"></iframe>
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

config.module?.rules.push({
  test: /\.png$/,
  loader: "file-loader"
});

export default config;
