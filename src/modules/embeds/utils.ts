import { urlImageHosts } from "../richtext/linkutils";

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
    /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/|playlist\/))(.*)$/;
  return regex.test(url);
};

export const spotifyID = (url: string) => {
  const regex =
    /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/|playlist\/))([a-zA-Z0-9]+)(.*)$/;
  const match = regex.exec(url);
  if (match) return match[1] + match[3];
  return null;
};

export function returnInnerHtml(url: string) {
  if (isYoutube(url) && youtubeID(url)) {
    return `<div class="ritsu-youtube-embed embed">
      <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${youtubeID(
        url
      )}" allowfullscreen></iframe>
    </div>`;
  }
  if (isUrlImageHost(url)) {
    return `<img src="${url}" class="img-fluid embed">`;
  }
  if (isSpotify(url) && spotifyID(url)) {
    let height = 80;
    if (spotifyID(url)?.includes("playlist")) {
      height = 380;
    }
    return ` <div class="ritsu-spotify-embed spotify embed">
    <iframe src="https://open.spotify.com/embed/${spotifyID(
      url
    )}?utm_source=generator" height="${height} !important" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
    </div>`;
  }
  return "";
}

export function maybeEmbed(text: string) {
  if (isYoutube(text) || isUrlImageHost(text)) {
    return true;
  }
  return false;
}
