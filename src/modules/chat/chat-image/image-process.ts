import React from "react";
import { links } from "~src/meta";
import { sanitizeURL } from "~src/modules/rendering/richtext/linkutils";
import * as imgur from "./imgur";
import { ratelimitInfo as ratelimit } from "./ratelimit";

const rxeUrl = sanitizeURL(links.repo);

const PAYLOAD_DESC = () =>
  imgur.HIDE_IMGUR_LINK() ? "Can't see it" : "See just a link";

const IMG_PLACEHOLDER = (version: string, payload: string) =>
  `${payload} · ${PAYLOAD_DESC()}? Get RxE ${version}+: ${rxeUrl}`;

export function emit(image: RitsuChatImage): string {
  const payload = /\w/.test(image.payload)
    ? `Image: ${image.payload}`
    : `[Image${image.payload}]`;
  if (Math.random() < 0.5) return IMG_PLACEHOLDER(image.version, payload);
  return payload;
}

export function picture({ url }: { url: string }): JSXSingleton {
  return React.createElement(MessagePicture, {
    picture: { url }
  });
}

export function display(
  { url }: RitsuChatImage,
  user: EmeraldUser = App.user
): MessageData {
  return {
    user,
    messages: [],
    picture: { url }
  };
}

/**
 * Accepts a message and attempts to return an encoded image URL.
 */
export function decodeImage(encoded: string): RitsuChatImage | null {
  return imgur.decodeImage(encoded);
}

export async function upload(image: File): Promise<RitsuChatImage> {
  return imgur.uploadChatImage(image);
}

export const uploadInfo = {
  ratelimit,
  destination: imgur.destinationInfo,
  lowKarma:
    "Warning: Due to low karma, images sent by you may be hidden from other users."
};
