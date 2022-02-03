/* eslint-disable max-classes-per-file */
import {
  colourClosestMatch,
  colourDifference,
  imageFromData,
  median,
  getFrequencies,
  sorters,
  percent,
  choosePairs,
  pairwise,
  sortWith,
  extractBoth
} from "~src/utils";
import { b64toU8Array, u8toB64 } from "~src/bitutils";
import { PixelPlacer, PixelReader } from "~src/pixelBuffer";
import {
  ImageToken,
  ImageMetadata,
  SizeSpecifier,
  PaletteSpecifier,
  ImageContentToken,
  PaletteSelection,
  OffsetColour,
  OffsetColourLong,
  OffsetColourAbstract,
  BackgroundSelection
} from "./tokens";
import { colourSpaces, sampleImage } from "../interpolation";
import { PALETTE_DIST_WEIGHT } from "./config";

// eslint-disable-next-line no-shadow
function warnIf(warn: boolean, ...args: any[]) {
  if (warn) console.warn(...args);
  else console.info(...args);
}

export function viewTokenList(tokens: ImageToken[]) {
  return console.log(
    "tokens:\n",
    tokens
      .map((token) =>
        token instanceof ImageToken
          ? `${token.representation()}: '${token.serialize()}'`
          : token
      )
      .join("\n")
  );
}

export class TokenWriter {
  static serializeTokens(tokens: ImageToken[]) {
    console.time("serializeTokens()");
    const tokensSerialized = tokens.map((token) => token.serialize()).join("");
    console.timeEnd("serializeTokens()");
    return tokensSerialized;
  }

  static writeImage(
    tokens: ImageContentToken[],
    metadata: ImageMetadata
  ): string {
    const { size, palette } = metadata;
    const backgroundColour = palette.completePalette[0];
    const buffer = new PixelPlacer(metadata.size.pixels, backgroundColour);
    tokens.forEach((token) => token.toPixelBuffer(buffer, metadata));
    const image = buffer.toImage();
    return imageFromData(image, size.width, size.height, backgroundColour, 4);
  }
}

export class ImageReader {
  static readImage(image: Image, options: SamplingOptions) {
    console.time("readImage()");
    const size = new SizeSpecifier(options.width, options.height);
    const { width, height } = size;
    Object.assign(options, { width, height });
    const sampledImage = sampleImage(image, options).map(
      colourSpaces.colour512.map
    );
    if (sampledImage.length === 0) throw new Error("Error sampling image");
    const serializedPixels: string[] = sampledImage
      .map(colourSpaces.colour512.serialize)
      .map((colour) => colour.map(u8toB64).join(""));
    const paletteRGB = this.selectPalette(serializedPixels);
    const palette = PaletteSpecifier.fromRGB(paletteRGB);
    const readImage = {
      pixels: PixelReader.fromImage(sampledImage),
      metadata: { size, palette } as ImageMetadata
    };
    console.timeEnd("readImage()");
    return readImage;
  }

  protected static selectPalette(image: string[]): RGB[] {
    const colourSpace = colourSpaces.colour512;
    const palette: RGB[] = [];
    let frequencies = getFrequencies(image).map(
      ([colour, frequency]) =>
        [colour, frequency, 1] as [string, number, number]
    );
    while (
      palette.length < PaletteSpecifier.paletteLength &&
      frequencies.length > 0
    ) {
      const newColour = Array.from(b64toU8Array(frequencies.shift()![0])!);
      palette.push(colourSpace.deserialize(newColour as any)!);
      frequencies = frequencies.map(([colour, frequency]) => {
        const rgb = colourSpace.deserialize(
          Array.from(b64toU8Array(colour)!) as ReturnType<
            typeof colourSpace.serialize
          >
        )!;
        const distances = palette.map((c) => colourDifference(c, rgb));
        // const distance = sum(distances) / palette.length;
        const distance = Math.min(...distances);
        return [colour, frequency, distance];
      });
      sortWith(
        frequencies,
        extractBoth(
          ([_, freq, dist]) => freq * dist ** PALETTE_DIST_WEIGHT(),
          sorters.numeric
        ),
        "desc",
        true
      );
      // sortBy(frequencies, '1', sorters.numeric, 'desc', true);
    }
    return palette;
  }
}

export class TokenStatistics {
  static logStatistics(tokens: ImageContentToken[], metadata: ImageMetadata) {
    const {
      offsetColours,
      streamSelections,
      paletteSelections,
      offsetColourLongs,
      offsetColourSmalls,
      zeroOffsets,
      maxOffsets,
      maxOffsetLongs,
      maxLengths
    } = this.tokenCategories(tokens);

    const offsetTokenRatio = offsetColours.length / tokens.length;
    const streamTokenRatio = streamSelections.length / tokens.length;
    const paletteSelectRatio = paletteSelections.length / tokens.length;
    // const offsetRatio = offsetColourSmalls.length / offsetColours.length;
    const zeroRatio = zeroOffsets.length / offsetColours.length;
    const maxRatio = maxOffsets.length / offsetColourSmalls.length;
    const maxRatioLong = maxOffsetLongs.length / offsetColourLongs.length;
    const maxLenRatio = maxLengths.length / streamSelections.length;
    const palette = metadata.palette.completePalette;
    const medianPaletteRange = median(
      choosePairs(palette).map(pairwise(colourDifference))
    );

    console.log("===== Metadata =====");

    const { width, height } = metadata.size;

    console.log(`\tsize: ${width} x ${height}`);
    console.log(`\tpalette: ${metadata.palette.representation()}`);

    console.log("===== Token distribution =====");

    warnIf(
      offsetTokenRatio > 0.5,
      `\t${percent(offsetTokenRatio)} of tokens are of type OffsetColour`
    );

    warnIf(
      streamTokenRatio < 0.1,
      `\t${percent(
        streamTokenRatio
      )} of tokens are of type BackgroundSelectionStream`
    );

    warnIf(
      paletteSelectRatio > 0.5,
      `\t${percent(paletteSelectRatio)} of tokens are of type PaletteSelection`
    );

    /* console.info(`\t${percent(offsetRatio)} and ${percent(1 - offsetRatio)} \
of OffsetColour tokens are of subtype OFFSET and OFFSET_LONG`); */

    console.log("===== Offsets =====");

    warnIf(
      zeroRatio > 0.5,
      `\t${percent(zeroRatio)} of OffsetColour tokens have an offset of zero`
    );

    warnIf(
      maxRatio > 0.8 || maxRatioLong > 0.8,
      `\t${percent(maxRatio)} and ${percent(maxRatioLong)} \
of OFFSET (/LONG) tokens have their maximum offset`
    );

    warnIf(
      maxLenRatio > 0.8,
      `\t{percent(maxLenRatio)} of BackgroundSelectionStream tokens \
have their maximum length`
    );

    console.log("===== Colours =====");

    console.info(
      `\tpalette colours have a median distance of ${percent(
        medianPaletteRange
      )} from one another`
    );

    const colourDistances = offsetColours.map(
      (offsetColour) => colourClosestMatch(palette, offsetColour.getRGB())[1]
    );
    const medianDistance = median(colourDistances);
    console.info(
      `\tOffsetColour tokens have a median distance of ${percent(
        medianDistance
      )} from the palette`
    );

    const backgroundPalettes = tokens.filter(
      (token) =>
        token instanceof PaletteSelection &&
        token.paletteIndices.every((index) => index === 0)
    );
    const bgPaletteRatio = backgroundPalettes.length / tokens.length;
    warnIf(
      bgPaletteRatio > 0.05,
      `\t${percent(bgPaletteRatio)} of tokens \
are background PaletteSelection tokens`
    );
  }

  protected static tokenCategories(tokens: ImageContentToken[]) {
    const offsetColours = tokens.filter(
      (token) =>
        token instanceof OffsetColour || token instanceof OffsetColourLong
    ) as OffsetColourAbstract[];

    const streamSelections = tokens.filter(
      (token) => token instanceof BackgroundSelection
    ) as BackgroundSelection[];

    const paletteSelections = tokens.filter(
      (token) => token instanceof PaletteSelection
    );

    const offsetColourLongs = offsetColours.filter(
      (token) => token instanceof OffsetColourLong
    );

    const offsetColourSmalls = offsetColours.filter(
      (token) => token instanceof OffsetColour
    );

    const zeroOffsets = offsetColours.filter((token) => token.offset === 0);

    const maxOffsets = offsetColourSmalls.filter(
      (token) => token.offset === OffsetColour.maxOffset
    );

    const maxOffsetLongs = offsetColourLongs.filter(
      (token) => token.offset === OffsetColourLong.maxOffset
    );

    const maxLengths = streamSelections.filter(
      (token) => token.length === BackgroundSelection.maxLength
    );

    return {
      offsetColours,
      streamSelections,
      paletteSelections,
      offsetColourLongs,
      offsetColourSmalls,
      zeroOffsets,
      maxOffsets,
      maxOffsetLongs,
      maxLengths
    };
  }
}
