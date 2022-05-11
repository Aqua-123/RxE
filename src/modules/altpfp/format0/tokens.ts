/* eslint-disable max-classes-per-file */
import {
  clamp,
  representColour as repr,
  allOf,
  validColour,
  colourClosestMatch,
  groupBy,
  mapValues,
  choosePairs,
  colourDifference,
  assertValidColour
} from "~src/utils";
import {
  GroupedBits,
  b64toU8,
  bitSplit,
  b64toU8Array,
  // u8toB64i as u8toB64,
  // u8ArrayToB64i as u8ArrayToB64,
  u8toB64,
  u8ArrayToB64
} from "~src/bitutils";
import Tape from "~src/tape";
import { colourSpaces } from "../interpolation";
import { PixelPlacer, PixelReader } from "~src/pixelBuffer";
import {
  BIT_HEADER,
  TOKEN_DIGITS,
  DIGIT_SIZE,
  PALETTE_BITS,
  IMAGE_SIZE_STEP,
  IMAGE_SIZE_MAX,
  PALETTE_LENGTH,
  MAX_APPROXIMATION,
  LOG_ENCODING_INFO
} from "./config";

const { ceil } = Math;

export const BIT_HEADER_BINARY = mapValues(BIT_HEADER, (_, string) =>
  parseInt(string, 2)
);

export const BIT_HEADER_BITS = mapValues(
  BIT_HEADER,
  (_, string) => string.length
);

export const PAYLOAD_BITS = mapValues(
  TOKEN_DIGITS,
  (key, digits) => digits * DIGIT_SIZE - BIT_HEADER_BITS[key]
);

export const MAX_VALUE = mapValues(PAYLOAD_BITS, (_, bits) => (1 << bits) - 1);

const BIT_HEADER_MASK = (key: keyof typeof BIT_HEADER_BITS) =>
  (1 << DIGIT_SIZE) - (1 << (DIGIT_SIZE - BIT_HEADER_BITS[key]));

export const MATCH_BIT_HEADER = (digit: number) =>
  Object.keys(BIT_HEADER_BINARY).find(
    (key) =>
      (digit & BIT_HEADER_MASK(key)) ===
      BIT_HEADER_BINARY[key] << (DIGIT_SIZE - BIT_HEADER_BITS[key])
  );

{
  if (LOG_ENCODING_INFO) {
    console.log("BIT_HEADER_BINARY", BIT_HEADER_BINARY);
    console.log("BIT_HEADER_BITS", BIT_HEADER_BITS);
    console.log("PAYLOAD_BITS", PAYLOAD_BITS);
    console.log("MAX_VALUE", MAX_VALUE);
  }
  const conflict = choosePairs(Object.entries(BIT_HEADER)).find(
    ([[_1, header1], [_2, header2]]) =>
      header1.startsWith(header2) || header2.startsWith(header1)
  );
  if (conflict !== undefined)
    throw new Error(
      `The following header types overlap: ${conflict[0][0]} and ${conflict[1][0]}`
    );
}

const PALETTE_SELECTION_LENGTH = (type: keyof typeof BIT_HEADER) =>
  ~~(PAYLOAD_BITS[type] / PALETTE_BITS);

export interface ImageMetadata {
  size: SizeSpecifier;
  palette: PaletteSpecifier;
}

const colourSpace = colourSpaces.colour64;
const paletteColourSpace = colourSpaces.colour512;

type ColourRepr = ReturnType<typeof colourSpace.serialize>;
type PaletteColourRepr = ReturnType<typeof paletteColourSpace.serialize>;

/**
 * Note: Argument order matters!
 */
export function colourAssignableTo(colour: RGB, paletteColour: RGB): boolean {
  assertValidColour(colour);
  assertValidColour(paletteColour);
  const colourCoerced = colourSpace.map(colour);
  const difference2 = colourDifference(colour, paletteColour);
  const difference = colourDifference(colourCoerced, paletteColour);
  return Math.min(difference, difference2) <= MAX_APPROXIMATION();
}

function _findInPalette(colour: RGB, palette: RGB[]) {
  assertValidColour(colour);
  const [index, difference, paletteColour] = colourClosestMatch(
    palette,
    colour
  );
  return difference > MAX_APPROXIMATION()
    ? null
    : ([index, paletteColour] as [number, RGB]);
}

// AKA: Noo I'm not that colour
// -coerces to that colour later-
export function findInPalette(colour: RGB, palette: RGB[]) {
  return (
    _findInPalette(colour, palette) ??
    _findInPalette(colourSpace.map(colour), palette)
  );
}

// tokenization might slow perf
// but debugging is easier
// also more flexible woo
// DX > UX

export abstract class ImageToken {
  /**
   * Returns a dense serialization of the token.
   */
  abstract serialize(): string;

  /**
   * Returns a human-readable serialization of the token.
   */
  abstract representation(): string;

  protected get name(): string {
    return this.constructor.name;
  }
}

export abstract class ImageContentToken extends ImageToken {
  /**
   * Attempts to render this token's pixels into the given pixel buffer.
   */
  abstract toPixelBuffer(pixels: PixelPlacer, metadata: ImageMetadata): boolean;
}

export class SizeSpecifier extends ImageToken {
  readonly width: number;

  readonly height: number;

  get pixels() {
    return this.width * this.height;
  }

  toString() {
    return `${this.width}, ${this.height}`;
  }

  constructor(width: number, height: number) {
    super();
    this.width = SizeSpecifier.clampSize(width);
    this.height = SizeSpecifier.clampSize(height);
  }

  // todo: i smell decomposition

  protected static clampSize(dimension: number): number {
    return clamp(
      ceil(dimension / IMAGE_SIZE_STEP) * IMAGE_SIZE_STEP,
      IMAGE_SIZE_STEP,
      IMAGE_SIZE_MAX
    );
  }

  protected static parseSize(u3: number): number {
    return (u3 + 1) * IMAGE_SIZE_STEP;
  }

  protected static compressSize(dimension: number) {
    return dimension / IMAGE_SIZE_STEP - 1;
  }

  representation() {
    return `${this.name}(${this.width}, ${this.height})`;
  }

  serialize() {
    const width = SizeSpecifier.compressSize(this.width);
    const height = SizeSpecifier.compressSize(this.height);
    console.assert(
      width < 8 && height < 8,
      "width or height of SizeSpecifier token exceed 3 bits"
    );
    return u8toB64((width << 3) + height);
  }

  protected static readTape(tape: Tape): SizeSpecifier | null {
    const digit = b64toU8(tape.read());
    if (digit === null) return null;
    const [width, height] = bitSplit(digit, 2, DIGIT_SIZE);
    return new SizeSpecifier(
      SizeSpecifier.parseSize(width),
      SizeSpecifier.parseSize(height)
    );
  }

  /**
   * Attempts to deserialize a token of this type read from the tape.
   */
  static fromTape(tape: Tape): SizeSpecifier | null {
    return this.readTape(tape) ?? tape.warnExpected("expected size specifier");
  }
}

export class PaletteSpecifier extends ImageToken {
  /**
   * Expected number of colours in the palette.
   */
  static paletteLength: number = PALETTE_LENGTH;

  /**
   * Expected length of token when serializaed.
   */
  static expectedDigits: number = PALETTE_LENGTH * paletteColourSpace.digits;

  /**
   * Colour precision used by colours in the palette.
   */
  static colourSpace = paletteColourSpace;

  readonly completePalette: RGB[];

  constructor(readonly colours: RGB[]) {
    super();
    if (colours.length === 0) throw new Error("No colours supplied");
    if (colours.length > PaletteSpecifier.paletteLength)
      throw new Error("Too many colours supplied");
    if (colours.some((colour) => !validColour(colour)))
      throw new RangeError("Invalid colour");
    const remaining = PALETTE_LENGTH - this.colours.length;
    this.completePalette = [
      ...this.colours,
      ...Array.from({ length: remaining }, () => this.colours.slice(-1)[0])
    ];
  }

  representation() {
    const { name, colours } = this;
    return `${name}([${Array.from(colours).map(repr).join(", ")}])`;
  }

  serialize() {
    return u8ArrayToB64(
      this.completePalette.map(PaletteSpecifier.colourSpace.serialize).flat()
    );
  }

  protected static readTape(tape: Tape): PaletteSpecifier | null {
    const section = tape.readExactly(PaletteSpecifier.expectedDigits);
    if (!section) return null;
    const encoded = allOf(section.split("").map(b64toU8));
    if (!encoded) return null;
    const grouped = groupBy(
      encoded,
      PaletteSpecifier.colourSpace.digits
    ) as PaletteColourRepr[];
    const colours: RGB[] | null = allOf<RGB>(
      grouped.map(PaletteSpecifier.colourSpace.deserialize)
    );
    if (!colours) return null;
    return new PaletteSpecifier(colours);
  }

  /**
   * Attempts to deserialize a token of this type read from the tape.
   */
  static fromTape(tape: Tape): PaletteSpecifier | null {
    return (
      this.readTape(tape) ??
      tape.warnExpected(
        "expected palette specifier",
        PaletteSpecifier.expectedDigits
      )
    );
  }

  /**
   * Creates a PaletteSpecifier token from a given colour palette.
   */
  static fromRGB(colours: RGB[]): PaletteSpecifier {
    return new PaletteSpecifier(colours);
  }
}

abstract class PaletteSelectionAbstract extends ImageContentToken {
  /**
   * Returns the sequence of colours represented by the token given a colour palette.
   */
  abstract renderFrom(palette: RGB[]): RGB[];
}

function makePaletteSelectionClass(type: keyof typeof BIT_HEADER) {
  return class PaletteSelectionClass extends PaletteSelectionAbstract {
    /**
     * Number of colours represented by a token of this class.
     */
    static expectedColours = PALETTE_SELECTION_LENGTH(type);

    /**
     * Expeted length of this token when serialized.
     */
    static expectedDigits = TOKEN_DIGITS[type];

    /**
     * Checks whether the given numeric bit header is that of this token's serialization.
     */
    static matchHeader(u8: number) {
      return MATCH_BIT_HEADER(u8) === type;
    }

    constructor(readonly paletteIndices: number[] | Uint8Array) {
      super();
      if (paletteIndices.length !== PaletteSelectionClass.expectedColours)
        throw new Error(
          `Palette selection size does not match ${PaletteSelectionClass.expectedColours} expected colours: ${paletteIndices}`
        );
      if (
        paletteIndices.some(
          (index) => index < 0 || index > PaletteSpecifier.paletteLength
        )
      )
        throw new Error(`Invalid palette indicies: ${paletteIndices}`);
    }

    // eslint-disable-next-line class-methods-use-this
    get name() {
      return type === "PALETTE_SELECTION"
        ? "PaletteSelection"
        : "PaletteSelectionShort";
    }

    representation() {
      return `${this.name}([${this.paletteIndices.join(", ")}])`;
    }

    serialize() {
      const paletteBits = new GroupedBits(DIGIT_SIZE);
      paletteBits.pushNumber(BIT_HEADER_BINARY[type], BIT_HEADER_BITS[type]);
      paletteBits.pushNumbers(Array.from(this.paletteIndices), PALETTE_BITS);
      return u8ArrayToB64(paletteBits.topUp().numbers);
    }

    static tryMake(
      colours: RGB[],
      palette: RGB[]
    ): PaletteSelectionClass | null {
      if (palette.length > PaletteSpecifier.paletteLength)
        throw new Error("Palette too long");
      if (colours.length < PaletteSelectionClass.expectedColours) return null;
      const selection = Array.from(
        colours.slice(0, PaletteSelectionClass.expectedColours)
      );
      const indices = allOf(
        selection.map((colour) => findInPalette(colour, palette)?.[0])
      );
      if (!indices) return null;
      return new PaletteSelectionClass(indices);
    }

    /**
     * Attempts to deserialize a token of this type read from the tape.
     */
    static fromTape(tape: Tape): PaletteSelectionClass | null {
      const paletteSelection = this.readTape(tape);
      if (paletteSelection == null)
        return tape.warnExpected(
          "expected PaletteSelection token",
          PaletteSelectionClass.expectedDigits
        );
      return paletteSelection;
    }

    protected static readTape(tape: Tape): PaletteSelectionClass | null {
      const tapeChars = tape.readExactly(PaletteSelectionClass.expectedDigits);
      if (tapeChars === undefined) return null;
      const tapeDigits = b64toU8Array(tapeChars);
      if (tapeDigits === null) return null;
      const paletteBits = new GroupedBits(PALETTE_BITS);
      paletteBits.pushNumbers(Array.from(tapeDigits), DIGIT_SIZE);
      const header = paletteBits.shiftBits(BIT_HEADER_BITS[type]);
      if (header !== BIT_HEADER_BINARY[type])
        throw new Error(
          `Bytes read (${header?.toString(
            2
          )}) do not start with palette selection header`
        );
      return new PaletteSelectionClass(paletteBits.trim().numbers);
    }

    renderFrom(palette: RGB[]): RGB[] {
      if (palette.length < PALETTE_LENGTH)
        throw new Error("Received incomplete palette");
      return Array.from(this.paletteIndices).map((index) => palette[index]);
    }

    toPixelBuffer(buffer: PixelPlacer, metadata: ImageMetadata) {
      return buffer.place(this.renderFrom(metadata.palette.completePalette));
    }

    /**
     * Attempts to create an instance of this token represent the buffer's next pixels.
     */
    static fromPixelBuffer(
      buffer: PixelReader,
      metadata: ImageMetadata,
      fromSkipped = false
    ): PaletteSelectionClass | null {
      const { expectedColours: expectedLength } = PaletteSelectionClass;
      const pixelsAvailable = fromSkipped
        ? buffer.offset >= expectedLength
        : buffer.offset === 0;
      if (!pixelsAvailable) return null;
      const pixels = fromSkipped
        ? buffer.skipped.slice(0, expectedLength)
        : buffer.preview(expectedLength);
      if (!pixels) return null;
      const palette = metadata.palette.completePalette;
      const paletteSelection = PaletteSelectionClass.tryMake(pixels, palette);
      if (!fromSkipped) buffer.consumeIf(paletteSelection !== null);
      else if (paletteSelection !== null) buffer.consumeSkipped(expectedLength);
      return paletteSelection;
    }
  };
}

export const PaletteSelection = makePaletteSelectionClass("PALETTE_SELECTION");

/* export const PaletteSelectionShort = makePaletteSelectionClass(
  "PALETTE_SELECTION_SHORT"
); */

export class BackgroundSelection extends ImageContentToken {
  static expectedDigits = TOKEN_DIGITS.BACKGROUND_SELECTION_STREAM;

  static maxLength =
    1 << (PAYLOAD_BITS.BACKGROUND_SELECTION_STREAM - PALETTE_BITS);

  constructor(readonly paletteIndex: number, readonly length: number) {
    super();
    if (paletteIndex > PALETTE_LENGTH) throw new Error("Invalid palette index");
    if (length <= 0) throw new Error("Length must be positive");
    if (length > BackgroundSelection.maxLength)
      throw new Error("Length too big");
  }

  /**
   * Checks whether the given numeric bit header is that of this token's serialization.
   */
  static matchHeader(u8: number) {
    return MATCH_BIT_HEADER(u8) === "BACKGROUND_SELECTION_STREAM";
  }

  representation() {
    return `${this.name}(${this.paletteIndex}, ${this.length})`;
  }

  serialize() {
    const bits = new GroupedBits(DIGIT_SIZE);
    bits.pushNumber(
      BIT_HEADER_BINARY.BACKGROUND_SELECTION_STREAM,
      BIT_HEADER_BITS.BACKGROUND_SELECTION_STREAM
    );
    bits.pushNumber(this.paletteIndex, PALETTE_BITS);
    bits.pushNumber(
      this.length - 1,
      PAYLOAD_BITS.BACKGROUND_SELECTION_STREAM - PALETTE_BITS
    );
    return u8ArrayToB64(bits.topUp().numbers);
  }

  renderFrom(palette: RGB[]): RGB[] {
    if (palette.length < PALETTE_LENGTH)
      throw new Error("Received incomplete palette");
    return Array.from<RGB>({ length: this.length }).fill(
      palette[this.paletteIndex]
    );
  }

  /**
   * Attempts to deserialize a token of this type read from the tape.
   */
  static fromTape(tape: Tape): BackgroundSelection | null {
    const token = this.readTape(tape);
    if (token === null)
      tape.warnExpected(
        "expected BackgroundSelectionStream token",
        BackgroundSelection.expectedDigits
      );
    return token;
  }

  protected static readTape(tape: Tape): BackgroundSelection | null {
    const tapeChars = tape.readExactly(BackgroundSelection.expectedDigits);
    if (tapeChars === undefined) return null;
    const tapeDigits = b64toU8Array(tapeChars);
    if (tapeDigits === null) return null;
    const bits = new GroupedBits(DIGIT_SIZE, Array.from(tapeDigits));
    const header = bits.shiftBits(BIT_HEADER_BITS.BACKGROUND_SELECTION_STREAM);
    if (header !== BIT_HEADER_BINARY.BACKGROUND_SELECTION_STREAM)
      throw new Error(
        `Bytes read (${header?.toString(
          2
        )}) do not start with background selection header`
      );
    const paletteIndex = bits.shiftBits(PALETTE_BITS);
    const length = bits.shiftBits(
      PAYLOAD_BITS.BACKGROUND_SELECTION_STREAM - PALETTE_BITS
    );
    if (paletteIndex === undefined || length === undefined) return null;
    return new BackgroundSelection(paletteIndex, length + 1);
  }

  toPixelBuffer(pixels: PixelPlacer, metadata: ImageMetadata) {
    pixels.backgroundColour =
      metadata.palette.completePalette[this.paletteIndex];
    return pixels.skip(this.length);
  }

  /**
   * Attempts to create an instance of this token represent the buffer's next pixels.
   */
  static fromPixelBuffer(
    buffer: PixelReader,
    metadata: ImageMetadata,
    force: boolean = false
  ): BackgroundSelection | null {
    if (buffer.done()) throw new Error("Buffer is exhausted");
    const { offset, backgroundColour: background, skipped } = buffer;
    const { completePalette } = metadata.palette;
    if (offset < (force ? 1 : PaletteSelection.expectedColours)) return null;
    const skippedLast = skipped[skipped.length - 1];
    if (!colourAssignableTo(skippedLast, background)) skipped.pop();
    // Checks be priceless
    if (skipped.some((colour) => !colourAssignableTo(colour, background))) {
      buffer.debug();
      throw new Error("Cannot create stream over non-bg colour");
    }
    const paletteMatch = findInPalette(background, completePalette)!;
    buffer.consumeSkipped(skipped.length);
    return new BackgroundSelection(paletteMatch[0], skipped.length);
  }
}

export abstract class OffsetColourAbstract extends ImageContentToken {
  abstract getRGB(): RGB;

  readonly offset: number = NaN;
}

function makeOffsetColourClass(type: keyof typeof BIT_HEADER) {
  return class OffsetColourClass extends OffsetColourAbstract {
    static expectedDigits: number = TOKEN_DIGITS[type] + colourSpace.digits;

    static maxOffset: number = MAX_VALUE[type];

    /**
     * Checks whether the given numeric bit header is that of this token's serialization.
     */
    static matchHeader(u8: number) {
      return MATCH_BIT_HEADER(u8) === type;
    }

    /**
     * The colour represented by this token.
     */
    readonly colour: RGB;

    /**
     * The number of pixels after which this token's colour is to appear.
     */
    readonly offset: number;

    constructor(offset: number, colour: RGB) {
      super();
      if (offset < 0) throw new RangeError("Offset can't be negative");
      if (offset > MAX_VALUE[type])
        throw new Error(`Offset ${offset} too big to encode`);
      this.colour = colourSpace.map(colour);
      this.offset = offset;
    }

    // eslint-disable-next-line class-methods-use-this
    get name() {
      return type === "OFFSET" ? "OffsetColour" : "OffsetColourLong";
    }

    representation() {
      return `${this.name}(${this.offset}, ${repr(this.colour)})`;
    }

    serialize() {
      const offsetBits = new GroupedBits(DIGIT_SIZE);
      offsetBits.pushNumber(BIT_HEADER_BINARY[type], BIT_HEADER_BITS[type]);
      offsetBits.pushNumber(this.offset, PAYLOAD_BITS[type]);
      offsetBits.topUp();
      const serialized = u8ArrayToB64([
        ...offsetBits.numbers,
        ...colourSpace.serialize(this.colour)
      ]);
      if (serialized.length !== OffsetColourClass.expectedDigits)
        throw new Error(
          `Expected token serialization of length ${OffsetColourClass.expectedDigits}, got "${serialized}"`
        );
      return serialized;
    }

    /**
     * Attempts to deserialize a token of this type read from the tape.
     */
    static fromTape(tape: Tape): OffsetColourClass | null {
      const offsetColour = this.readTape(tape);
      if (!offsetColour)
        tape.warnExpected(
          "expected OffsetColour token",
          OffsetColourClass.expectedDigits
        );
      return offsetColour;
    }

    protected static readTape(tape: Tape): OffsetColourClass | null {
      const offsetChars = tape.readExactly(TOKEN_DIGITS[type]);
      if (!offsetChars) {
        tape.advance(colourSpace.digits);
        return null;
      }
      const offsetDigits = b64toU8Array(offsetChars);
      if (!offsetDigits) {
        tape.advance(colourSpace.digits);
        return null;
      }
      const offsetBits = new GroupedBits(DIGIT_SIZE);
      offsetBits.pushNumbers(Array.from(offsetDigits), DIGIT_SIZE);
      // Assertion that function only starts if offset byte is already detected
      // otherwise the read failure state is ambiguous
      const header = offsetBits.shiftBits(BIT_HEADER_BITS[type]);
      if (header !== BIT_HEADER_BINARY[type])
        throw new Error(
          `Bytes read (${header?.toString(2)}) do not start with offset header`
        );
      const offset = offsetBits.toNumber();
      const colourChars = tape.read(colourSpace.digits);
      if (colourChars === null) return null;
      const colourU8s = b64toU8Array(colourChars);
      if (colourU8s === null || colourU8s.length !== colourSpace.digits)
        return null;
      const colour = colourSpace.deserialize(
        Array.from(colourU8s) as ColourRepr
      );
      if (colour === null) return null;
      return new OffsetColourClass(offset, colour);
    }

    /**
     * Retrieves this token's represented colour.
     */
    getRGB(): RGB {
      return this.colour;
    }

    toPixelBuffer(buffer: PixelPlacer, _metadata: ImageMetadata) {
      const success = buffer.skip(this.offset);
      if (success) buffer.placeOne(this.getRGB());
      return success;
    }

    /**
     * Attempts to create an instance of this token represent the buffer's next pixels.
     */
    static fromPixelBuffer(
      buffer: PixelReader,
      useSkipped = false
    ): OffsetColourClass | null {
      const pixel = useSkipped ? buffer.skipped.slice(-1)[0] : buffer.getNext();
      const offset = useSkipped ? buffer.offset - 1 : buffer.offset;
      if (offset < 0) throw new Error("Can't use last skipped pixel");
      const offsetColour = new OffsetColourClass(offset, pixel!);
      if (!useSkipped) buffer.consumeCount(1);
      else buffer.consumeSkipped(1);
      return offsetColour;
    }
  };
}

export const OffsetColour = makeOffsetColourClass("OFFSET");

// export const OffsetColourLong = makeOffsetColourClass("OFFSET_LONG");
export const OffsetColourLong = OffsetColour;
