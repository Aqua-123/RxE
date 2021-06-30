// This file cannot contain Webpack-resolved imports (e.g. "~src/foo").
// Use this file to share userscript metadata with SCSS files

import U from "./userscript";

export const NAME = U.sitename;
export const HOSTNAME = U.hostname;
