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
    .replace(/([a-z])\.([a-z][a-z])/gi, "$1%2E$2")
    .replace(/https?:\/\//, "");
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

// const dot2 = /(\.|(%2E))\u200b?/;
// https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
/*
export const validateEmail = (email: string) =>
  email.match(
    regexpcc(
      `^(([^<>()[]${dot2},;:s@"]+(${dot2}`,
      `[^<>()[]${dot2},;:s@"]+)*)|(".+"))@`,
      `(([[0-9]{1,3}${dot2}[0-9]{1,3}${dot2}`,
      `[0-9]{1,3}${dot2}[0-9]{1,3}])|(([a-zA-Z-0-9]+`,
      `${dot2})+[a-zA-Z]{2,}))$`,
      "gi"
    )
  );
);
*/
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

export const urlImageHosts = () => [
  /(^|https?:\/\/)ibb\.co(\/|$)/gi,
  /(^|https?:\/\/)i\.redd\.it(\/|$)/gi
];
export const isUrlImageHost = (url: string) =>
  urlImageHosts().some((regex) => regex.test(url));

export const isYoutube = (url: string) => {
  const regex =
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
  return regex.test(url);
};

export const youtubeID = (url: string) => {
  const regex =
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;
  const match = regex.exec(url);
  if (match) return match[6];
  return null;
};
export const isSpotify = (url: string) => {
  const regex =
    /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/))(.*)$/;
  return regex.test(url);
};

export const isTwitch = (url: string) => {
  const regex = /^(https?:\/\/)?(www\.)?(twitch\.tv\/)/;
  return regex.test(url);
};

export function returnInnerHtml(url: string) {
  // TODO: Cleanup and dump in the css file
  if (isYoutube(url) && youtubeID(url)) {
    // create embed for youtube instead of iframe 6th capture group
    const id = youtubeID(url);
    return `<div class="embed-responsive embed-responsive-16by9 embed">
      <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe>
    </div>`;
  }
  if (isUrlImageHost(url)) {
    return `<img src="${url}" class="img-fluid embed">`;
  }
  // create spotify player embed using iframe and spotify api
  /*
  if (isSpotify(url)) {
    const id = `${url.split("/")[3]}/${url.split("/")[4]}`;
    return `<iframe class="embed spotify" src="https://open.spotify.com/embed/${id}" allowfullscreen></iframe>`;
  }
  // twitch embed
  if (isTwitch(url)) {
    return `<iframe src="${url}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>`;
  }
  */
  return "";
}

export function maybeEmbed(text: string) {
  if (
    isYoutube(text) ||
    // isSpotify(text) ||
    // isTwitch(text) ||
    isUrlImageHost(text)
  ) {
    return true;
  }
  return false;
}
