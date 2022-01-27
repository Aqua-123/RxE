/* eslint-disable prettier/prettier */
import * as richBio from "./richbio";
import * as richPost from "./richpost";
import { loadCSS } from "~src/utils";
import { wrapRich } from "./richtext";

export function init() {
    // my backtick key wasn't working
    loadCSS(
        "a.ritsu-message-anchor { text-decoration: underline; }\n" +
        ".material-icons-inline { font-size: inherit }\n" +
        ".material-icons { user-select: none; }"
    );
    const mpProcess = Message.prototype.process;
    Message.prototype.process = function process(text: string) {
        const processOld = mpProcess.bind(this);
        if (text.includes("youtu.be") || text.includes("youtube.com"))
            return processOld(text);
        return wrapRich(text, processOld);
    };
    richBio.init();
    richPost.init();
}
