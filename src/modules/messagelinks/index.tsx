import React from "react";
import { loadCSS, wrapPartitions } from "~src/utils";

const linkConfirmation = (host: string) =>
    `⚠ Are you sure you want to open this link? ⚠
Note that shady sites can guess your location and earmark your browser.
The site you're about to visit is hosted by ${host}.`;

const getNonAscii = (text: string) =>
    Array.from(text.matchAll(/[^-._a-zA-Z0-9~]/g)).map((match) => match[0])

const characterDetail = (character: string) =>
    `\n\t · ${JSON.stringify(character)} (U+${character.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase()})`;

const nonAsciiAlert = (characters: string[]) =>
    characters.length > 0
        ? `\n⚠ Type this link yourself instead if you don't want to be fooled. ⚠
The following characters in the link look suspicious:
${characters.map(characterDetail)}`
        : "";


class MessageAnchor extends React.Component<{ href: string }> {
    render() {
        try {
            const href = urlSchema.test(this.props.href)
                ? this.props.href
                : `https://${this.props.href}`;
            const url = new URL(href.toLowerCase());
            const unusualCharacters = getNonAscii(url.host);
            const blocked = unusualCharacters.length > 0;
            const confirmation =
                linkConfirmation(url.host)
                + nonAsciiAlert(unusualCharacters);
            return <a className="ritsu-message-anchor"
                href={blocked ? '#' : url.href}
                onClick={(event) => {
                    if (!confirm(confirmation) || blocked) { event.nativeEvent.preventDefault(); return false }
                }}>{this.props.href}</a>
        }
        catch (e) {
            console.error(e);
            return this.props.children;
        }
    }
}

const urlFull = /(https?:\/\/)?[-a-z0-9@:%_\+.~#?&=]{2,256}\.[a-z]{2,}\b(\/[-a-z0-9@:%_\+.~#?&/=]*)?/gi;
const urlOneSlash = /\//g;
const urlTwoDots = /\..+?\./g;
const urlCommonDomains = /\.com|\.org|\.net|\.co\.uk|\.eu|\.us|\.gov/;
const extraTests = [urlOneSlash, urlTwoDots, urlCommonDomains];
const urlEmeraldRequest = /emeraldchat.{1,3}com/gi;
const extraFilters = [urlEmeraldRequest];
const urlSchema = /^https?:\/\//;

export function init() {
    loadCSS('a.ritsu-message-anchor { text-decoration: underline; }')
    const mpProcess = Message.prototype.process;
    Message.prototype.process = function process(text: string) {
        const processOld = mpProcess.bind(this);
        if (text.includes("youtu.be") || text.includes("youtube.com"))
            return processOld(text);
        return wrapPartitions(text, urlFull, (urlMatch) => {
            console.log(urlMatch);
            if (extraTests.some(test => test.test(urlMatch))
                && extraFilters.every(test => !test.test(urlMatch)))
                return <MessageAnchor href={urlMatch} />;
            return urlMatch || null;
        }, processOld)
    }
}