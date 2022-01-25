/* eslint-disable prettier/prettier */
import React from "react";
import { P, Preferences } from "~src/preferences";
import { wrapStringPartitions } from "~src/utils";

const nameNormalized = () =>
    App.user.display_name.replace(/[^\w\s]/g, "").trim();

const makeMention = (string: string) =>
    string ? <Flair data={{ string, flair: App.user.flair }} /> : null;

export function init() {
    const mpProcess = Message.prototype.process;
    Message.prototype.process = function process(message: string) {
        console.log("Begin process highlightmentions")
        const processOld = mpProcess.bind(this);
        const hasEmbed =
            message.includes("youtu.be") || message.includes("youtube.com");
        const name = nameNormalized();
        if (!name || hasEmbed || !Preferences.get(P.highlightMentions)) {
            console.log("Mentions not processed")
            return processOld(message);
        }
        console.log("Mentions processed")
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
