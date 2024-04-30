# Ritsu x Emerald -- Enterprise Edition

[![CI](https://github.com/Ritsu-Projects/emerald/actions/workflows/main.yml/badge.svg)](https://github.com/Ritsu-Projects/emerald/actions/workflows/main.yml)

## some intro

This may look scary, but it mostly isn't. There are a bunch of little configuration files,
and they all do something neat, but you don't need to really care about them.  
This is a [WebPack (v4)](https://v4.webpack.js.org/concepts/)-based project.  
It relies on a modified version of `userscripter`, committed in the repo under /lib

## dependencies

1. Get a flavor of NVM first.

   - on Mac/Linux/Windows WSL: https://github.com/nvm-sh/nvm#installing-and-updating
   - on Windows: https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows

   (Note that you don't technically have to use NVM. If you'd rather manage your node.js version yourself, skip this step.)

2. Clone the repository
3. From the root of the repo, run `nvm i`. This will install a version of Node.js known to work with this project.
4. run `npm i -g yarn`. This will install the tool `yarn`, used to manage this project's dependencies among other things.
5. run `npm i -g rimraf `. This will install the tool `rimraf`. It's used to delete directories, and it's used in the build scripts.
6. run `yarn`. This will install all the other dependencies needed.

## build

1. `yarn dev` will build the project and start a web server at http://localhost:9001/  
   Open that site in your web browser, then click on the `ritsu-emerlad.user.js`. If you have a
   userscript extension installed (ViolentMonkey, TamperMonkey, etc.), it should allow you to install/update the extension directly.
   While `yarn dev` is running, any modification to the source will be reflected immediately in the files served by the web server. You will need to click on the web page and install the script again, then reload the chat site for the changes to take effect.

2. `yarn build` will build the project once and exit. The built files will be under the `dist/` directory.

3. `yarn prod` will build a minimized, production-ready userscript and exit.

4. `yarn ext` will build a browser extension. You can then use the `dist/manifest.json` file to load a temporary add-on in Firefox (open `about:debugging` and select `This Firefox` to do it), or to load it as an unpacked extension in Chrome's extensions page in developed mode. The same directory can be used in Chrome to "Pack the extension" which will produce a private key and a signed extension file. For Firefox, a zip file is built under `./web-ext-artifacts` with a shape suitable for submissions to addons.mozilla.org.

## feature flags

What gets built exactly depends on flags you can set.
The default is to build the "safe" subset of the userscript.

Optionally, you can enable a set of features known as "HACKS" by setting an environment variable.

On linux/mac/WSL, add `HACKS=ON` before any of the commands above to do so.
For example: `HACKS=ON yarn prod` will build a production-ready script with hacks enabled.

On windows, use `yarn cross-env HACKS=ON yarn prod` to get the same result.

## code structure

TBD

## details

Also TBD

Our approach to build the extension is rudimentary. The entire script is loaded in the page's space, breaking all concepts of code isolation (needed to mess with Emerald Chat's juicy globals),
and preventing us from using any of the cool extension APIs.

That can be refined later if needs be, but it will involve having well-defined plug points into the page and a message-based API for the extension to pilot those. Oh, and we'll need our own React copy.
