/* eslint-disable prettier/prettier */
import React from "react";
import { P, Preferences } from "~src/preferences";
import { wrapStringPartitions } from "~src/utils";

const nameNormalized = () =>
    App.user.display_name.replace(/[^\w\s]/g, "").trim();

const makeMention = (mention: string) =>
    mention ? <b style={App.user.flair}>{mention}</b> : null;

export function init() {
    const mpProcess = Message.prototype.process;
    Message.prototype.process = function process(message: string) {
        const processOld = mpProcess.bind(this);
        const hasEmbed =
            message.includes("youtu.be") || message.includes("youtube.com");
        const name = nameNormalized();
        if (!name || hasEmbed || !Preferences.get(P.highlightMentions))
            return processOld(message);
        const messageContent = wrapStringPartitions(
            message,
            name,
            makeMention,
            processOld
        );
        // return React.createElement("span", null, ...messageContent);
        return messageContent;
    };
}
