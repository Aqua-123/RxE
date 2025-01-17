import { regexpcc } from "~src/utils";

export const getNonAscii = (text: string) =>
  Array.from(text.matchAll(/[^-._a-zA-Z0-9~]/g)).map((match) => match[0]);

const characterDetail = (character: string) =>
  `\n\t · ${JSON.stringify(character)} (U+${character
    .charCodeAt(0)
    .toString(16)
    .padStart(4, "0")
    .toUpperCase()})`;

export const linkConfirmation = (host: string) =>
  `⚠ Are you sure you want to open this link? ⚠
Note that shady sites can guess your location and earmark your browser. \
Beware URLs on safe domains that look like redirects. \
The site you're about to visit is hosted by ${host}.`;

export const nonAsciiAlert = (characters: string[]) =>
  characters.length > 0
    ? `\n⚠ Type this link yourself instead if you don't want to be fooled. ⚠
The following characters in the link look suspicious:
${characters.map(characterDetail)}`
    : "";

export function sanitizeURL(message: string) {
  return message
    .replace(/(\S)\.([a-z][a-z])/gi, "$1%2E$2")
    .replace(/https?:\/\//gi, "");
}

export const desanitizeURL = (href: string) =>
  href
    .replace(/%2E/gi, ".")
    .replace(/\s?\(\s?(\.|dot)\s?\)\s?/g, ".")
    .replace(/\.\u200b/g, ".");

export const parseURL = (href: string) =>
  /^https?:\/\//.test(href) ? href : `https://${href}`;

export const dot = regexpcc(
  "(?:",
  ["%2E", "dot", /\./.source, / ?\( ?(?:\.|dot) ?\) ?/.source].join("|"),
  ")",
  ""
).source;
export const urlProtocol = /(https?:\/\/)?/.source;
const urlChar = /[-a-z0-9@:%_+[\]~#?&=]/.source;

export const validateEmail = (email: string) =>
  email.match(/^[^\s@]+@[^\s@]+(\.|(%2E))\u200b?[^\s@]+$/gi);

export const urlFull = () =>
  regexpcc(
    urlProtocol,
    `(${dot}|${urlChar}){2,256}`,
    `${dot}[a-z]{2,}`,
    `\\b(\\/(${dot}|${urlChar}|\\/)*)?`,
    "gi"
  );
export const urlOneSlash = () => /\//g;
export const urlTwoDots = () => /[^.]+?\.[^.]+?\.[^.]+?/g;
export const urlCommonDomains = () =>
  /\.com|\.org|\.net|\.co\.uk|\.eu|\.us|\.gov|\.io/;
export const urlBlacklist = () => [
  /emeraldchat/gi,
  /grabify/gi,
  /ip-puller/gi,
  /hackingvision/gi,
  /iplogger/gi,
  /bit\.ly/gi, // IP-logger in Premium version
  /blasze/gi,
  /ps3CFW/gi,
  /powercut/gi,
  /whatstheirip/gi,
  /\.gift/gi
];

export const urlBlacklistShorteners = () => [
  /(^|https?:\/\/)\w{3}\.\w{2}(\/|$)/gi
];

export const urlImageHostWhitelist = () => [
  /(^|https?:\/\/)(i\.)?ibb\.co(\/|$)/gi
];

export const urlImageDirectLinks = () => [
  /\bi\.ibb\.co\/[a-z0-9]+\/[^\s.]+\.[a-z0-9]+\b/gi,
  /\bi\.redd\.it\/[a-z0-9]+\.[a-z0-9]+\b/gi,
  /\bi\.imgur\.com\/[a-z0-9]+\.[a-z0-9]+\b/gi
];

export const urlImageDirectLinkAny = () =>
  regexpcc(
    ...urlImageDirectLinks()
      .map((re) => `(${re.source})`)
      .join("|"),
    "gi"
  );
