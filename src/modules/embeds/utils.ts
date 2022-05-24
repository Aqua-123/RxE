const regexSpotify =
  /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/|playlist\/))([a-zA-Z0-9]+)(.*)$/;

const regexYoutube =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/;

export const isYoutube = (url: string) => regexYoutube.test(url);
export const isSpotify = (url: string) => regexSpotify.test(url);

export const youtubeID = (url: string) => {
  const match = regexYoutube.exec(url);
  if (match) return match[6];
  return null;
};

export const spotifyID = (url: string) => {
  const match = regexSpotify.exec(url);
  if (match) return match[1] + match[3];
  return null;
};

const youtubeDivString = (url: string) =>
  `<div class="ritsu-youtube-embed embed"> <iframe class="embed-responsive-item" 
  loading="lazy"
  src="https://www.youtube.com/embed/${youtubeID(url)}"
  frameborder="0" allowfullscreen></iframe></div>`;

const spotifyDivString = (url: string, height: number) =>
  `<div class="ritsu-spotify-embed spotify embed"><iframe 
  src="https://open.spotify.com/embed/${spotifyID(url)}?utm_source=generator"
  loading="lazy"
  height="${height} !important" frameBorder="0" allowfullscreen="" 
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
  </iframe></div>`;

const spotifyDivHeight = (url: string) => {
  if (url.includes("playlist")) return 380;
  return 80;
};

export function returnInnerHtml(url: string) {
  if (isYoutube(url) && youtubeID(url)) return youtubeDivString(url);
  if (isSpotify(url) && spotifyID(url))
    return spotifyDivString(url, spotifyDivHeight(url));
  return null;
}

export function maybeEmbed(text: string) {
  if (isYoutube(text) || isSpotify(text)) return true;
  return false;
}

// test urls
// https://www.youtube.com/watch?v=dQw4w9WgXcQ
// https://open.spotify.com/track/5GxUKIEkMXXZo1Tif0IzfC?si=e085dc40e60e4d2a
