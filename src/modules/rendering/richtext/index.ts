import * as richBio from "./richbio";
import * as richPost from "./richpost";
import { loadCSS } from "~src/utils";
import { processImage, wrapRich } from "./richtext";
import { desanitizeURL } from "./linkutils";
import css from "./style.scss";

export function init() {
  loadCSS(css);
  const mpProcess = Message.prototype.process;
  Message.prototype.process = function process(text: string) {
    const processOld = mpProcess.bind(this);
    if (text.includes("youtu.be") || text.includes("youtube.com"))
      return processOld(text);
    return processImage(desanitizeURL(text), (nonImage) =>
      wrapRich(nonImage, processOld)
    );
  };
  richBio.init();
  richPost.init();
}
