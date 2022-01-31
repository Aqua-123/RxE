import React from "react";
import { regexpcc, wrapPartitions } from "~src/utils";

const linkConfirmation = (host: string) =>
  `⚠ Are you sure you want to open this link? ⚠
Note that shady sites can guess your location and earmark your browser. \
Beware URLs on safe domains that look like redirects. \
The site you're about to visit is hosted by ${host}.`;

const getNonAscii = (text: string) =>
  Array.from(text.matchAll(/[^-._a-zA-Z0-9~]/g)).map((match) => match[0]);

const characterDetail = (character: string) =>
  `\n\t · ${JSON.stringify(character)} (U+${character
    .charCodeAt(0)
    .toString(16)
    .padStart(4, "0")
    .toUpperCase()})`;

const nonAsciiAlert = (characters: string[]) =>
  characters.length > 0
    ? `\n⚠ Type this link yourself instead if you don't want to be fooled. ⚠
The following characters in the link look suspicious:
${characters.map(characterDetail)}`
    : "";

const urlSchema = /^https?:\/\//;

const desanitizeURL = (href: string) =>
  href
    .replace(/%2E/gi, ".")
    .replace(/\s?\(\s?(\.|dot)\s?\)\s?/g, ".")
    .replace(/\.\u200b/g, ".");

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
        linkConfirmation(urlObj.host) + nonAsciiAlert(unusualCharacters);
      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
          className="ritsu-message-anchor"
          href={blocked ? "#" : urlObj.href}
          target="_blank"
          onClick={(event) => {
            if (!confirm(confirmation) || blocked)
              event.nativeEvent.preventDefault();
          }}
          rel="noreferrer"
        >
          {url}
        </a>
      );
    } catch (e) {
      console.error(e);
      return href;
    }
  }
}

const urlProtocol = /(https?:\/\/)?/.source;
const dot = /(\s?\(\s?(\.|dot)\s?\)\s?|\.\u200b?|%2E)/.source;
const urlChar = /[-a-z0-9@:%_+[\].~#?&=]/.source;
const urlFull = () =>
  regexpcc(
    urlProtocol,
    `(${dot}|${urlChar}){2,256}`,
    `${dot}[a-z]{2,}`,
    `\\b(\\/(${dot}|${urlChar}|\\/)*)?`,
    "gi"
  );
console.log("urlFull", urlFull());
const urlOneSlash = () => /\//g;
const urlTwoDots = () => /\.[^.]+?\./g;
const urlCommonDomains = () => /\.com|\.org|\.net|\.co\.uk|\.eu|\.us|\.gov/;
const extraTests = () => [urlOneSlash(), urlTwoDots(), urlCommonDomains()];
const urlEmeraldRequest = () => /emeraldchat/gi; // this is not foolproof
const extraFilters = () => [urlEmeraldRequest()];

export function wrapLinks<T>(text: string, restWrapper: StringWrapper<T>) {
  return wrapPartitions(
    text,
    urlFull(),
    (urlMatch) => {
      const url = desanitizeURL(urlMatch);
      if (
        extraTests().some((test) => test.test(url)) &&
        extraFilters().every((test) => !test.test(url))
      )
        return <MessageAnchor href={url} />;
      return urlMatch || null;
    },
    restWrapper
  );
}
