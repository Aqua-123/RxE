import { memoize, imageFromData } from "~src/utils";
import Tape from "~src/tape";
import { Tokenizer } from "./format0tokenizer";
import browserWindow from "~src/browserWindow";

const MAX_SIZE_COMPRESSED = 8192;

const LOG_TOKEN_LIST = false;
const LOG_SAMPLED_IMAGE = false;
const LOG_TOKENIZED_IMAGE = false;
const LOG_SERIALIZED_IMAGE = false;

function assertLengthLimit(compressed: string) {
  if (compressed.length <= MAX_SIZE_COMPRESSED) return;
  const { length } = compressed;
  console.warn(`attempted to produce string (${length}): ${{ compressed }}`);
  throw new Error(
    `Resolution too big (result would be ${length} characters long)`
  );
}

export const unpack = memoize((compressed) => {
  const tape = new Tape(compressed);
  const metadata = Tokenizer.parseMetadata(tape);
  if (!metadata) return null;
  const tokens = Tokenizer.parseContent(tape);
  if (tokens === null) return null;
  if (LOG_TOKEN_LIST)
    Tokenizer.viewTokenList([metadata.size, metadata.palette, ...tokens]);
  return Tokenizer.writeImage(tokens, metadata);
});

export async function compress(image: Image, options: SamplingOptions) {
  const { pixels, metadata } = Tokenizer.readImage(image, options);
  const { width, height } = metadata.size;
  if (LOG_SAMPLED_IMAGE)
    browserWindow.open(imageFromData(pixels.toImage(), width, height));
  const metadataTokens = [metadata.size, metadata.palette];
  const contentTokens = Tokenizer.fromPixels(pixels, metadata);
  const tokens = [...metadataTokens, ...contentTokens];
  if (LOG_TOKEN_LIST) Tokenizer.viewTokenList(tokens);
  if (LOG_TOKENIZED_IMAGE)
    browserWindow.open(Tokenizer.writeImage(contentTokens, metadata));
  const compressed = Tokenizer.serializeTokens(tokens);
  if (LOG_SERIALIZED_IMAGE) {
    const unpacked = unpack(compressed);
    if (unpacked) browserWindow.open(unpacked);
  }
  assertLengthLimit(compressed);
  return compressed;
}
