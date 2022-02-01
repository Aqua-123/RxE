import React from "react";
import { links } from "~src/meta";
import { sanitizeURL } from "../richtext/linkutils";
import * as imgur from "./imgur";

const rxeUrl = sanitizeURL(links.repo_minified);

const IMG_PLACEHOLDER = (version: string) =>
  ` · Pic not working? Get RxE ${version}+: ${rxeUrl}`;

export function emit(image: RitsuChatImage): string {
  const payload = /\w/.test(image.payload)
    ? `${image.payload} `
    : image.payload;
  if (Math.random() < 0.5) return payload + IMG_PLACEHOLDER(image.version);
  return image.payload;
}

export function picture({ url }: RitsuChatImage) {
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
  return imgur.upload(image);
}
