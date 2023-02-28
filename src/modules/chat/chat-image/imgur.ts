import React from "react";
import { ListPreferenceMap } from "~src/listprefcache";
import { P, Preferences } from "~src/preferences";
import {
  decodeInvisible as decode,
  encodeInvisible as encode
} from "~src/utils";
import { dot, sanitizeURL } from "~src/modules/rendering/richtext/linkutils";
import { newUpload as recordUpload } from "./ratelimit";

export const HIDE_IMGUR_LINK: () => boolean = () =>
  Preferences.get(P.hideImageFallback);

export const IMGUR_ENDPOINT = "https://api.imgur.com/3/image/";

const IMGUR_HEADER_ENCODED = encode("rxe-imgur:");
// note that the header is encoded seperately and then concatenated.
// this is not identical to concatenating and then encoding.
const IMGUR_ENCODED_REGEXP = () => new RegExp(`${IMGUR_HEADER_ENCODED}(\\S*)`);
// hint: don't add the global flag if you want capture groups, silly
export const IMGUR_URL_REGEXP = () =>
  new RegExp(`imgur${dot}com/([a-z0-9]+)`, "i");

export const imgurPNG = (id: string) => `https://i.imgur.com/${id}.png`;

export const headers = () => ({
  Authorization: `Client-ID ${
    Preferences.get(P.imgurAPIKey) || "b8f69bdcc4d1373"
  }`
});

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

export async function upload(image: File): Promise<ImgurImage> {
  const payload = new FormData();
  payload.append("image", image);
  const response = await fetch(IMGUR_ENDPOINT, {
    method: "POST",
    headers: headers(),
    body: payload
  });
  if (!response.ok) throw new Error(response.statusText);
  const { data }: ImgurResponse = await response.json();
  const { id, deletehash: hash } = data;
  ListPreferenceMap.addItem({ key: id, item: hash }, P.imgurDeleteHashes);
  recordUpload();
  return {
    id,
    payload: encodeImage(id)
  };
}

export async function uploadChatImage(image: File): Promise<RitsuChatImage> {
  return toChatImage(await upload(image));
}

export async function deleteImage(deleteHash: string): Promise<void> {
  const response = await fetch(`${IMGUR_ENDPOINT}${deleteHash}`, {
    method: "DELETE",
    headers: headers()
  });
  if (!response.ok) throw new Error(response.statusText);
}

export function idFromURL(text: string): string | null {
  const url = text.match(IMGUR_URL_REGEXP());
  return url ? url[1] : null;
}

export function imageFromURL(
  text: string,
  reencode = true
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
  const image = imageFromURL(encoded, false);
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
