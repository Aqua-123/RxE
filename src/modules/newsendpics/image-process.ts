import React from "react";
import { urlFull } from "../richtext/linkutils";
import * as imgur from "./imgur";

const IMG_PLACEHOLDER = (version: string) =>
  `Use Ritsu x Emerald ${version} or newer to see an image instead of this placeholder.`;

export function emit(image: RitsuChatImage): string {
  const payload = urlFull().test(image.payload)
    ? ` (${image.payload})`
    : image.payload;
  return IMG_PLACEHOLDER(image.version) + payload;
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
