/* eslint-disable prettier/prettier */
/* eslint-disable max-classes-per-file */
import {
    clamp,
    representColour,
    allOf,
    validColour,
    colourClosestMatch,
    stringGroups
} from "~src/utils";
import {
    GroupedBits,
    b64toU8,
    bitSplit,
    u8toB64,
    b64toU8Array,
    u8ArrayToB64
} from "~src/bitutils";
import Tape from "~src/tape";
import { colourSpaces } from "./interpolation";
import { PixelPlacer, PixelReader } from "./pixelBuffer";

const { ceil } = Math;

export const MAX_SIZE = 64;

export const SIZE_STEP = MAX_SIZE / 8;

export const DIGIT_SIZE = 6;

export const PALETTE_BITS = 3;
export const PALETTE_LENGTH = 2 ** PALETTE_BITS;
export const BIT_HEADER_BITS = 1;

export const PAYLOAD_BITS = {
    PALETTE_SELECTION: 2 * DIGIT_SIZE - 1,
    OFFSET: DIGIT_SIZE - 1
};

export const MAX_PALETTE_APPROXIMATION = 0.05;
export const MAX_BACKGROUND_APPROXIMATION = 0.05;

export const BIT_HEADER = {
    PALETTE_SELECTION: 0b0,
    OFFSET: 0b1
};

export interface ImageMetadata {
    size: SizeSpecifier,
    palette: PaletteSpecifier
}

const colourSpace = colourSpaces.colour64;
const paletteColourSpace = colourSpaces.colour512;
// const paletteColourSpace = colourSpaces.colour64;


const BIT_HEADER_MASK = (2 ** DIGIT_SIZE) - (2 ** (DIGIT_SIZE - BIT_HEADER_BITS));

export const MATCH_BIT_HEADER = (digit: number) =>
    Object.keys(BIT_HEADER)
        .find((key) => (digit & BIT_HEADER_MASK) === BIT_HEADER[key] << (DIGIT_SIZE - BIT_HEADER_BITS))


export const PALETTE_SELECTION_LENGTH = ~~(PAYLOAD_BITS.PALETTE_SELECTION / PALETTE_BITS);

export const TOKEN_DIGITS = {
    PALETTE_SELECTION: ceil((BIT_HEADER_BITS + PAYLOAD_BITS.PALETTE_SELECTION) / DIGIT_SIZE),
    OFFSET: ceil((BIT_HEADER_BITS + PAYLOAD_BITS.OFFSET) / DIGIT_SIZE)
};

export const MAX_OFFSET = 2 ** PAYLOAD_BITS.OFFSET - 1;

// tokenization might slow perf
// but debugging is easier
// also more flexible woo
// DX > UX

export abstract class ImageToken {
    abstract serialize(): string;

    abstract representation(): string;

    protected get name(): string {
        return this.constructor.name;
    }
}

export abstract class ImageContentToken extends ImageToken {
    abstract toPixelBuffer(pixels: PixelPlacer, metadata: ImageMetadata): boolean;
}

export class SizeSpecifier extends ImageToken {
    readonly width: number;

    readonly height: number;

    get dataSize() { return this.width * this.height; }

    constructor(width: number, height: number) {
        super();
        this.width = SizeSpecifier.clampSize(width);
        this.height = SizeSpecifier.clampSize(height);
    }

    // todo: i smell decomposition

    protected static clampSize(dimension: number): number {
        return clamp(ceil(dimension / SIZE_STEP) * SIZE_STEP, SIZE_STEP, MAX_SIZE);
    }

    protected static parseSize(u3: number): number {
        return (u3 + 1) * SIZE_STEP;
    }

    protected static compressSize(dimension: number) {
        return dimension / SIZE_STEP - 1;
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

    static fromTape(tape: Tape): SizeSpecifier | null {
        return this.readTape(tape) ??
            tape.warnExpected('expected size specifier');
    }
}

export class PaletteSpecifier extends ImageToken {
    static expectedLength: number = PALETTE_LENGTH;

    static expectedDigits: number = PALETTE_LENGTH * paletteColourSpace.digits;

    static colourSpace: ColourSpace<string> = paletteColourSpace;

    constructor(readonly colours: RGB[]) {
        super();
        if (colours.length === 0) throw new Error("No colours supplied");
        if (colours.length > PaletteSpecifier.expectedLength)
            throw new Error("Too many colours supplied");
        if (colours.some((colour) => !validColour(colour)))
            throw new RangeError("Invalid colour");
    }

    representation() {
        const { name, colours } = this;
        return `${name}([${Array.from(colours)
            .map(representColour)
            .join(", ")}])`;
    }

    get completePalette(): RGB[] {
        const remaining = PALETTE_LENGTH - this.colours.length;
        return [
            ...this.colours,
            ...Array.from({ length: remaining }, () => this.colours.slice(-1)[0])
        ];
    }

    serialize() {
        return this.completePalette.map(PaletteSpecifier.colourSpace.serialize).join("");
    }

    protected static readTape(tape: Tape): PaletteSpecifier | null {
        const section = tape.readExactly(PaletteSpecifier.expectedDigits);
        if (!section) return null;
        const matches = stringGroups(section, paletteColourSpace.digits);
        const colours = allOf<RGB>(matches.map(PaletteSpecifier.colourSpace.deserialize));
        if (!colours) return null;
        return new PaletteSpecifier(colours);
    }

    static fromTape(tape: Tape): PaletteSpecifier | null {
        return this.readTape(tape) ??
            tape.warnExpected('expected palette specifier', PaletteSpecifier.expectedDigits);
    }

    static fromRGB(colours: RGB[]): PaletteSpecifier {
        return new PaletteSpecifier(colours);
    }
}

export class PaletteSelection extends ImageContentToken {
    static expectedLength = PALETTE_SELECTION_LENGTH;

    static expectedDigits = TOKEN_DIGITS.PALETTE_SELECTION;

    static matchHeader(u8: number) {
        return MATCH_BIT_HEADER(u8) === "PALETTE_SELECTION";
    }

    constructor(readonly paletteIndices: number[] | Uint8Array) {
        super();
        if (paletteIndices.length !== PaletteSelection.expectedLength)
            throw new Error(
                `Palette selection size does not match ${PaletteSelection.expectedLength} expected colours: ${paletteIndices}`
            );
        if (paletteIndices.some((index) => index < 0 || index > PaletteSpecifier.expectedLength))
            throw new Error(`Invalid palette indicies: ${paletteIndices}`);
    }

    representation() {
        return `${this.name}([${this.paletteIndices.join(", ")}])`;
    }

    serialize() {
        const paletteBits = new GroupedBits(DIGIT_SIZE);
        paletteBits.pushNumber(BIT_HEADER.PALETTE_SELECTION, BIT_HEADER_BITS);
        paletteBits.pushNumbers(Array.from(this.paletteIndices), PALETTE_BITS);
        return u8ArrayToB64(paletteBits.topUp().numbers);
    }

    static tryMake(
        colours: RGB[],
        palette: RGB[]
    ): PaletteSelection | null {
        if (palette.length > PaletteSpecifier.expectedLength) throw new Error("Palette too long");
        if (colours.length < PaletteSelection.expectedLength) return null;
        const selection = Array.from(colours.slice(0, PaletteSelection.expectedLength));
        const indices = allOf(
            selection.map((colour) => colourClosestMatch(palette, colour))
                .map(([index, difference]) => difference > MAX_PALETTE_APPROXIMATION ? null : index)
        );
        if (!indices) return null;
        return new PaletteSelection(indices);
    }

    static fromTape(tape: Tape): PaletteSelection | null {
        const paletteSelection = this.readTape(tape);
        if (paletteSelection == null) return tape.warnExpected(
            "expected PaletteSelection token",
            PaletteSelection.expectedDigits
        );
        return paletteSelection;
    }

    protected static readTape(tape: Tape): PaletteSelection | null {
        const tapeChars = tape.readExactly(PaletteSelection.expectedDigits);
        if (tapeChars === undefined) return null;
        const tapeDigits = b64toU8Array(tapeChars);
        if (tapeDigits === null) return null;
        const paletteBits = new GroupedBits(PALETTE_BITS);
        paletteBits.pushNumbers(Array.from(tapeDigits), DIGIT_SIZE);
        if (
            paletteBits.shiftBits(BIT_HEADER_BITS)! !== BIT_HEADER.PALETTE_SELECTION
        )
            throw new Error("Bytes read do not start with palette selection header");
        return new PaletteSelection(paletteBits.trim().numbers);
    }

    selectFrom(palette: RGB[]): RGB[] {
        if (palette.length < PALETTE_LENGTH)
            throw new Error("Received incomplete palette");
        return Array.from(this.paletteIndices).map((index) => palette[index]);
    }

    toPixelBuffer(buffer: PixelPlacer, metadata: ImageMetadata) {
        return buffer.place(this.selectFrom(metadata.palette.completePalette));
    }

    static fromPixelBuffer(buffer: PixelReader, metadata: ImageMetadata): PaletteSelection | null {
        if (buffer.offset > 0) return null;
        if (!buffer.preview(PaletteSelection.expectedLength)) return null;
        const palette = metadata.palette.completePalette;
        const paletteSelection = PaletteSelection.tryMake(buffer.lastPreview(), palette);
        buffer.consumeIf(paletteSelection !== null);
        return paletteSelection;
    }
}

export class OffsetColour extends ImageContentToken {
    static expectedDigits: number = TOKEN_DIGITS.OFFSET + 1;

    static maxOffset: number = MAX_OFFSET;

    static matchHeader(u8: number) {
        return MATCH_BIT_HEADER(u8) === "OFFSET";
    }

    readonly colour: RGB;

    constructor(readonly offset: number, colour: RGB) {
        super();
        if (offset < 0) throw new RangeError("Offset can't be negative");
        if (offset > OffsetColour.maxOffset) throw new Error(`Offset ${offset} too big to encode`);
        this.colour = colourSpace.map(colour);
    }

    representation() {
        return `${this.name}(${this.offset}, ${representColour(
            this.colour
        )})`;
    }

    serialize() {
        const offsetBits = new GroupedBits(DIGIT_SIZE);
        offsetBits.pushNumber(BIT_HEADER.OFFSET, BIT_HEADER_BITS);
        offsetBits.pushNumber(this.offset, PAYLOAD_BITS.OFFSET);
        return u8ArrayToB64(offsetBits.topUp().numbers) + colourSpace.serialize(this.colour);
    }

    static fromTape(tape: Tape): OffsetColour | null {
        const offsetColour = this.readTape(tape);
        if (!offsetColour) tape.warnExpected("expected OffsetColour token", OffsetColour.expectedDigits);
        return offsetColour;
    }

    protected static readTape(tape: Tape): OffsetColour | null {
        const offsetChars = tape.readExactly(TOKEN_DIGITS.OFFSET);
        if (!offsetChars) { tape.advance(1); return null; }
        const offsetDigits = b64toU8Array(offsetChars);
        if (!offsetDigits) { tape.advance(1); return null; }
        const offsetBits = new GroupedBits(DIGIT_SIZE);
        offsetBits.pushNumbers(Array.from(offsetDigits), DIGIT_SIZE);
        // Assertion that function only starts if offset byte is already detected
        // otherwise the read failure state is ambiguous
        if (offsetBits.shiftBits(BIT_HEADER_BITS) !== BIT_HEADER.OFFSET)
            throw new Error("Bytes read do not start with offset header");
        const offset = offsetBits.toNumber();
        const colourChar = tape.read();
        if (colourChar === null) return null;
        const colour = colourSpace.deserialize(colourChar);
        if (colour === null) return null;
        return new OffsetColour(offset, colour);
    }

    getRGB(): RGB {
        return this.colour;
    }

    toPixelBuffer(buffer: PixelPlacer, _metadata: ImageMetadata) {
        const success = buffer.skip(this.offset);
        if (success) buffer.placeOne(this.getRGB());
        return success;
    }

    static fromPixelBuffer(buffer: PixelReader): OffsetColour | null {
        if (!buffer.peekOne()) return null;
        const offsetColour = new OffsetColour(buffer.offset, buffer.lastPreview()[0]);
        buffer.consume();
        return offsetColour;
    }
}