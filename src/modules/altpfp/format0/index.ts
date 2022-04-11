import { log } from "~userscripter";
import {
  memoize,
  imageFromData,
  PassableError,
  readFile,
  loadImage,
  timeout
} from "~src/utils";
import Tape from "~src/tape";
import {
  ImageReader,
  TokenStatistics,
  TokenWriter,
  viewTokenList
} from "./tokenizer";
import TokenReader from "./tokenReader";
import browserWindow from "~src/browserWindow";
import { interpolation, sampleImage } from "../interpolation";

const MAX_SIZE_COMPRESSED = 7500;

const LOG_TOKEN_LIST_UNPACKED = false;
const LOG_TOKEN_LIST_COMPRESSED = false;
const LOG_STATISTICS = false;
const LOG_READ_IMAGE = false;
const LOG_FULLY_SAMPLED_IMAGE = true;
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

export async function compress(file: File, options: SamplingOptions) {
  const url = await timeout(readFile(file), 5000, "Could not read file");
  const image = await timeout(loadImage(url), 5000, "Could not load image");
  if (LOG_READ_IMAGE) browserWindow.open(image.src);
  if (LOG_FULLY_SAMPLED_IMAGE)
    browserWindow.open(
      imageFromData(
        sampleImage(image, {
          interpolator: interpolation.none,
          width: image.width,
          height: image.height
        }),
        image.width,
        image.height
      )
    );
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

export function parse(fluff: string) {
  return fluff;
}
