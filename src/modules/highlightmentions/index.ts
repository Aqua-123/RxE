/* eslint-disable prettier/prettier */
import React from "react";
import { P, Preferences } from "~src/preferences";
import { wrapStringMatches } from "~src/utils";

const nameNormalized = () =>
    App.user.display_name.replace(/[^\w\s]/g, "").trim();

const makeMention = (mention: string) => React.createElement("b", {
    style: { color: App.user.flair.color }
}, mention)

/* eslint-disable prettier/prettier */
export function init() {
    Message.prototype.content = function content() {
        const { picture, messages } = this.props.data;
        if (picture) return React.createElement(MessagePicture, { picture });
        return messages.map((message) => {
            const hasEmbed = message.includes("youtu.be") || message.includes("youtube.com");
            const props = { key: JSON.stringify(message) };
            const name = nameNormalized();
            if (!name || hasEmbed || !Preferences.get(P.highlightMentions))
                return React.createElement("div", props, this.process(message))
            const messageContent = wrapStringMatches(message, name, makeMention);
            return React.createElement("div", props, ...messageContent);
        }
        );
    };
}
