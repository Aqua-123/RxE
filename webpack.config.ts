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

const config = {
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
    contentBase: require("path").join(AppRootPath.path, "dist"),
    compress: true,
    liveReload: false,
    port: 9001
  }
};
config.plugins!.unshift(
  new webpack.DefinePlugin({
    "FEATURES.HACKS": JSON.stringify(!!process.env.HACKS ?? false),
    "FEATURES.P2P": JSON.stringify(!!process.env.P2P ?? false)
  })
);

export default config;
