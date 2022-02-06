import React from "react";
import { ListPreferenceMap } from "~src/listprefcache";
import { P, Preferences } from "~src/preferences";
import {
  decodeInvisible as decode,
  encodeInvisible as encode
} from "~src/utils";
import { dot, sanitizeURL } from "../richtext/linkutils";
import { newUpload as recordUpload } from "./ratelimit";

export const HIDE_IMGUR_LINK: () => boolean = () =>
  Preferences.get(P.hideImageFallback);

export const IMGUR_ENDPOINT = "https://api.imgur.com/3/image/";

const IMGUR_HEADER_ENCODED = encode("rxe-imgur:");
// note that the header is encoded seperately and then concatenated.
// this is not identical to concatenating and then encoding.
const IMGUR_ENCODED_REGEXP = () => new RegExp(`${IMGUR_HEADER_ENCODED}(\\S*)`);
// hint: don't add the global flag if you want capture groups, silly
const IMGUR_URL_REGEXP = () =>
  new RegExp(`i${dot}imgur${dot}com/([a-z0-9]+)${dot}\\w+`, "i");

const imgurPNG = (id: string) => `https://i.imgur.com/${id}.png`;

function toChatImage({ id, payload }: ImgurImage): RitsuChatImage {
  return {
    url: imgurPNG(id),
    payload,
    version: "0.11.0"
  };
}

function encodeImage(id: string): string {
  if (HIDE_IMGUR_LINK()) return `${IMGUR_HEADER_ENCODED}${encode(id)}`;
  // just in case link processing is off
  return sanitizeURL(imgurPNG(id));
}

export async function upload(image: File): Promise<RitsuChatImage> {
  const payload = new FormData();
  payload.append("image", image);
  const response = await fetch(IMGUR_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Client-ID b8f69bdcc4d1373`
    },
    body: payload
  });
  if (!response.ok) throw new Error(response.statusText);
  const { data }: ImgurResponse = await response.json();
  const imgurDeleteHashes = new ListPreferenceMap(P.imgurDeleteHashes, true);
  imgurDeleteHashes.addItem(data.id, data.deletehash);
  imgurDeleteHashes.destroy();
  recordUpload();
  return toChatImage({ id: data.id, payload: encodeImage(data.id) });
}

export function imageFromURL(
  text: string,
  reencode = false
): RitsuChatImage | null {
  const url = text.match(IMGUR_URL_REGEXP());
  return (
    url &&
    toChatImage({
      payload: reencode ? encodeImage(url[1]) : sanitizeURL(url[0]),
      id: url[1]
    })
  );
}

export function decodeImage(encoded: string): RitsuChatImage | null {
  const image = imageFromURL(encoded);
  if (image) return image;
  const payload = encoded.match(IMGUR_ENCODED_REGEXP())?.[1];
  if (payload === undefined) return null;
  const id = decode(payload);
  return toChatImage({ id, payload });
}

export const destinationInfo = [
  `You are uploading your image to `,
  React.createElement("a", { href: "https://imgurinc.com/privacy" }, "Imgur"),
  `. Anyone with the link can save or share it.`
];
