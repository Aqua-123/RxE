import { cached, colourEqualTo, equalsTo, existing, some } from "~src/utils";
import { b64toU8 } from "~src/bitutils";
import Tape from "~src/tape";
import { PixelReader } from "~src/pixelBuffer";
import {
  ImageMetadata,
  SizeSpecifier,
  PaletteSpecifier,
  ImageContentToken,
  PaletteSelection,
  OffsetColour,
  OffsetColourLong,
  OffsetColourAbstract,
  BackgroundSelection,
  colourAssignableTo,
  findInPalette
} from "./tokens";
import { viewTokenList } from "./tokenizer";

// eslint-disable-next-line no-shadow
enum ColourClass {
  BackgroundColour,
  PaletteColour,
  CustomColour
}

function getColourRelation(
  colour: RGB,
  backgroundColour: RGB,
  palette: RGB[]
): [ColourClass, RGB] {
  const match = findInPalette(colour, palette);
  if (match === null) return [ColourClass.CustomColour, colour];
  const paletteMatch = match[1];
  if (colourEqualTo(paletteMatch)(backgroundColour))
    return [ColourClass.BackgroundColour, backgroundColour];
  return [ColourClass.PaletteColour, paletteMatch];
}

const SKIP = null;

export default class TokenReader {
  protected static readToken(
    pixels: PixelReader,
    metadata: ImageMetadata
  ): ImageContentToken | null {
    if (pixels.done()) throw new Error("Pixel buffer exhausted");
    const { maxLength } = BackgroundSelection;
    const { maxOffset } = OffsetColourLong;
    const { BackgroundColour, CustomColour, PaletteColour } = ColourClass;
    const { offset, backgroundColour: background } = pixels;
    const { completePalette: palette } = metadata.palette;
    const next = pixels.getNext()!;
    const colourInfo = getColourRelation(next, background, palette);
    const [colourClass, bgNew] = colourInfo;

    const offsetToMaxStream = offset - maxLength;
    const offsetToMaxOffset = offset - maxOffset;

    /*
    const ordering = (n: number) => {
      if (n < 0) return "L";
      if (n === 0) return "E";
      return "G";
    };
     console.log(
      `${repr(next)} classified as ${ColourClass[colourClass]}, \
was close to ${repr(bgNew)}`,
      `(${ordering(offsetToMaxStream)}, ${ordering(offsetToMaxOffset)})`
    ); */

    // G, LE
    if (offsetToMaxStream > 0) {
      if (offsetToMaxOffset > 0) {
        pixels.debug();
        throw new Error("Unreachable");
      }
      if (maxLength >= maxOffset) console.warn("strangely, this happened (1)");
      const oneLess = colourClass === BackgroundColour;
      const token = some(OffsetColourLong.fromPixelBuffer(pixels, oneLess));
      if (colourClass === PaletteColour) pixels.backgroundColour = bgNew;
      return token;
    }
    // LE, L
    if (offsetToMaxOffset < 0) {
      if (colourClass === BackgroundColour) return SKIP;
      if (colourClass === CustomColour)
        return some(OffsetColourLong.fromPixelBuffer(pixels));
      return this.backgroundChangeToken(pixels, metadata, bgNew);
    }
    if (maxLength < maxOffset) console.warn("strangely, this happened (2)");
    // L, GE
    if (colourClass === BackgroundColour && offsetToMaxStream < 0) return SKIP;
    // E, GE
    const t = BackgroundSelection.fromPixelBuffer(pixels, metadata, true);
    if (colourClass === PaletteColour) pixels.backgroundColour = bgNew;
    return some(t);
  }

  static backgroundChangeToken(
    pixels: PixelReader,
    metadata: ImageMetadata,
    paletteColour: RGB
  ): ImageContentToken | null {
    // if change when all is done, just switch and start skipping
    // tokenize skipped stream if it makes sense
    const stream = cached(() =>
      BackgroundSelection.fromPixelBuffer(pixels, metadata)
    );
    const { offset } = pixels;
    if (offset === 0 || stream()) {
      pixels.backgroundColour = paletteColour;
      return offset === 0 ? SKIP : some(stream());
    }

    // if too few colours are skipped (= bg),
    // try add more and form PaletteSelection
    const palette = metadata.palette.completePalette;
    const hangingColours = PaletteSelection.expectedColours - pixels.offset;
    if (hangingColours < 0) {
      pixels.debug();
      throw new Error(
        `Expected offset less than PaletteSelection's worth, got ${pixels.offset}`
      );
    }
    const hangingPixels = pixels.preview(hangingColours);
    if (hangingPixels?.every((pixel) => findInPalette(pixel, palette))) {
      // skip nonbg = constraint violation
      pixels.skip();
      const token = PaletteSelection.fromPixelBuffer(pixels, metadata, true);
      // check if constraint violation was remedied
      if (!token) throw new Error("Checks insufficient");
      return token;
    }
    if (hangingPixels) pixels.backtrack();

    // try use skipped pixels if there are any
    const stream2 = BackgroundSelection.fromPixelBuffer(pixels, metadata, true);
    if (stream2) {
      pixels.backgroundColour = paletteColour;
      return stream2;
    }

    // if all else fails, OffsetColour
    return some(OffsetColour.fromPixelBuffer(pixels));
  }

  static toTokens(
    pixels: PixelReader,
    metadata: ImageMetadata
  ): ImageContentToken[] {
    console.time(`fromPixels(${metadata.size.toString()})`);
    const tokens: Array<ImageContentToken> = [];

    while (!pixels.done()) {
      const remaining = pixels.remaining();
      const { offset } = pixels;
      const token = this.readToken(pixels, metadata);
      if (token !== null) tokens.push(token);
      else pixels.skipCount(1);
      const last = pixels.skipped.slice(-1)[0];
      if (pixels.offset && !colourAssignableTo(last, pixels.backgroundColour)) {
        pixels.debug();
        console.log("Last token", token?.representation());
        viewTokenList(existing(tokens).slice(-10));
        throw new Error("Last skipped colour is not background color");
      }
      if (remaining === pixels.remaining() && offset === pixels.offset) {
        console.error("Last token", token?.representation());
        pixels.debug();
        throw new Error("No pixels processed");
      }
    }
    while (this.isFinalTokenUseless(tokens, pixels, metadata)) tokens.pop();
    console.timeEnd(`fromPixels(${metadata.size.toString()})`);
    return tokens;
  }

  protected static isFinalTokenUseless(
    tokens: ImageContentToken[],
    pixels: PixelReader,
    metadata: ImageMetadata
  ): boolean {
    const last = tokens[tokens.length - 1];
    if (last === undefined) return false;
    const backgroundIndex = findInPalette(
      pixels.backgroundColour,
      metadata.palette.completePalette
    )?.[0];
    if (backgroundIndex === null)
      throw new Error(
        `pixels.backgroundColour ${pixels.backgroundColour} strayed from palette`
      );
    if (
      last instanceof BackgroundSelection &&
      last.paletteIndex === backgroundIndex
    )
      return true;
    if (
      last instanceof PaletteSelection &&
      last.paletteIndices.every(equalsTo(backgroundIndex))
    )
      return true;
    if (
      last instanceof OffsetColourAbstract &&
      colourAssignableTo(last.getRGB(), pixels.backgroundColour)
    )
      return true;
    return false;
  }

  static parseMetadata(tape: Tape): ImageMetadata | null {
    const size = SizeSpecifier.fromTape(tape);
    if (!size) return null;
    const palette = PaletteSpecifier.fromTape(tape);
    if (!palette) return null;
    return { size, palette };
  }

  static parseContent(tape: Tape): ImageContentToken[] | null {
    const tokens: ImageContentToken[] = [];
    while (!tape.outOfBounds()) {
      const header = b64toU8(tape.peek()!);
      if (header === null)
        return tape.warnExpected(`expected valid b64 digit`, 1, false);
      if (OffsetColour.matchHeader(header)) {
        const offsetColour = OffsetColour.fromTape(tape);
        if (offsetColour) tokens.push(offsetColour);
        else return null;
      } else if (OffsetColourLong.matchHeader(header)) {
        const offsetColour = OffsetColourLong.fromTape(tape);
        if (offsetColour) tokens.push(offsetColour);
        else return null;
      } else if (PaletteSelection.matchHeader(header)) {
        const paletteSelection = PaletteSelection.fromTape(tape);
        if (paletteSelection) tokens.push(paletteSelection);
        else return null;
      } else if (BackgroundSelection.matchHeader(header)) {
        const stream = BackgroundSelection.fromTape(tape);
        if (stream) tokens.push(stream);
        else return null;
      } else
        return tape.warnExpected(
          `unknown header type: 0b${header.toString(2)}`
        );
    }
    return tokens;
  }
}
