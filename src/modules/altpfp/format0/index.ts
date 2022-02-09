import { log } from "~userscripter";
import { memoize, imageFromData, PassableError } from "~src/utils";
import Tape from "~src/tape";
import {
  ImageReader,
  TokenStatistics,
  TokenWriter,
  viewTokenList
} from "./tokenizer";
import TokenReader from "./tokenReader";
import browserWindow from "~src/browserWindow";

const MAX_SIZE_COMPRESSED = 7500;

const LOG_TOKEN_LIST_UNPACKED = false;
const LOG_TOKEN_LIST_COMPRESSED = false;
const LOG_STATISTICS = true;
const LOG_SAMPLED_IMAGE = false;
const LOG_TOKENIZED_IMAGE = false;
const LOG_SERIALIZED_IMAGE = false;

function assertLengthLimit(compressed: string) {
  if (compressed.length <= MAX_SIZE_COMPRESSED) return;
  const { length } = compressed;
  log.warning(`attempted to produce string (${length}): ${compressed}`);
  throw new PassableError(
    `Resolution too big (result would be ${length} characters long)`
  );
}

export const unpack = memoize((compressed) => {
  const tape = new Tape(compressed);
  const metadata = TokenReader.parseMetadata(tape);
  if (!metadata) return null;
  const tokens = TokenReader.parseContent(tape);
  if (tokens === null) return null;
  if (LOG_TOKEN_LIST_UNPACKED)
    viewTokenList([metadata.size, metadata.palette, ...tokens]);
  return TokenWriter.writeImage(tokens, metadata);
});

export async function compress(image: Image, options: SamplingOptions) {
  const { pixels, metadata } = ImageReader.readImage(image, options);
  const { width, height } = metadata.size;
  if (LOG_SAMPLED_IMAGE)
    browserWindow.open(imageFromData(pixels.toImage(), width, height));
  const metadataTokens = [metadata.size, metadata.palette];
  const contentTokens = TokenReader.toTokens(pixels, metadata);
  if (LOG_STATISTICS) TokenStatistics.logStatistics(contentTokens, metadata);
  const tokens = [...metadataTokens, ...contentTokens];
  if (LOG_TOKEN_LIST_COMPRESSED) viewTokenList(tokens);
  if (LOG_TOKENIZED_IMAGE)
    browserWindow.open(TokenWriter.writeImage(contentTokens, metadata));
  const compressed = TokenWriter.serializeTokens(tokens);
  if (LOG_SERIALIZED_IMAGE) {
    const unpacked = unpack(compressed);
    if (unpacked) browserWindow.open(unpacked);
  }
  assertLengthLimit(compressed);
  return compressed;
}