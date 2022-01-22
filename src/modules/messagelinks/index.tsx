import React from "react";
import { loadCSS, wrapPartitions } from "~src/utils";

const linkConfirmation = (host: string) =>
    `⚠ Are you sure you want to open this link? ⚠
Note that shady sites can guess your location and earmark your browser. \
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


const urlSchema = /^https?:\/\//;

const desanitizeURL = (href: string) =>
    href.replace(/%2E/gi, '.').replace(/\s?\(\s?(\.|dot)\s?\)\s?/g, '.')

const parseURL = (href: string) =>
    urlSchema.test(href) ? href : `https://${href}`;

class MessageAnchor extends React.Component<{ href: string }> {
    render() {
        const { href } = this.props;
        const url = parseURL(href);
        try {
            const urlObj = new URL(url);
            const unusualCharacters = getNonAscii(urlObj.host);
            const blocked = unusualCharacters.length > 0;
            const confirmation =
                linkConfirmation(urlObj.host)
                + nonAsciiAlert(unusualCharacters);
            return <a className="ritsu-message-anchor"
                href={blocked ? '#' : urlObj.href}
                target="_blank"
                onClick={(event) => {
                    if (!confirm(confirmation) || blocked) {
                        event.nativeEvent.preventDefault();
                        return false;
                    }
                }}>{url}</a>
        }
        catch (e) {
            console.error(e);
            return href;
        }
    }
}

const urlFull = /(https?:\/\/)?([-a-z0-9@:%_\+.~#?&=]|\s?\(\s?(\.|dot)\s?\)\s?){2,256}(\s?\(\s?(\.|dot)\s?\)|\.|\%2E)\s?[a-z]{2,}\b(\/([-a-z0-9@:%_\+.~#?&/=]|\s?\(\s?(\.|dot)\s?\)\s?)*)?/gi;
const urlOneSlash = /\//g;
const urlTwoDots = /\..+?\./g;
const urlCommonDomains = /\.com|\.org|\.net|\.co\.uk|\.eu|\.us|\.gov/;
const extraTests = [urlOneSlash, urlTwoDots, urlCommonDomains];
const urlEmeraldRequest = /emeraldchat.{1,3}com/gi;
const extraFilters = [urlEmeraldRequest];

export function init() {
    loadCSS('a.ritsu-message-anchor { text-decoration: underline; }')
    const mpProcess = Message.prototype.process;
    Message.prototype.process = function process(text: string) {
        const processOld = mpProcess.bind(this);
        if (text.includes("youtu.be") || text.includes("youtube.com"))
            return processOld(text);
        return wrapPartitions(text, urlFull, (urlMatch) => {
            const url = desanitizeURL(urlMatch);
            if (extraTests.some(test => test.test(url))
                && extraFilters.every(test => !test.test(url)))
                return <MessageAnchor href={url} />;
            return urlMatch || null;
        }, processOld)
    }
}