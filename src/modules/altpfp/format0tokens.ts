/* eslint-disable prettier/prettier */
/* eslint-disable max-classes-per-file */
import {
    clamp,
    representColour,
    allOf,
    validColour,
    colourClosestMatch,
    groups,
    mapValues,
    choosePairs
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
import { colourSpaces } from "./interpolation";
import { PixelPlacer, PixelReader } from "./pixelBuffer";

const { ceil } = Math;

export const DIGIT_SIZE = 6;

export const IMAGE_SIZE_MAX = 64;
export const IMAGE_SIZE_STEP = IMAGE_SIZE_MAX / (1 << 3);
export const PALETTE_BITS = 4;
export const PALETTE_LENGTH = 1 << PALETTE_BITS;

const BIT_HEADER = {
    PALETTE_SELECTION: "00",
    PALETTE_SELECTION_SHORT: "01",
    /* OFFSET: "10",
    OFFSET_LONG: "11", */
    OFFSET: "1"
}

const TOKEN_DIGITS = {
    OFFSET: 1,
    // OFFSET_LONG: 2,
    PALETTE_SELECTION_SHORT: 1,
    PALETTE_SELECTION: 3
};

export const BIT_HEADER_BINARY =
    mapValues(BIT_HEADER, (_, string) => parseInt(string, 2));

export const BIT_HEADER_BITS =
    mapValues(BIT_HEADER, (_, string) => string.length);

export const PAYLOAD_BITS =
    mapValues(TOKEN_DIGITS, (key, digits) => digits * DIGIT_SIZE - BIT_HEADER_BITS[key]);

export const MAX_VALUE = mapValues(PAYLOAD_BITS, (_, bits) => (1 << bits) - 1);

const BIT_HEADER_MASK = (key: keyof typeof BIT_HEADER_BITS) =>
    (1 << DIGIT_SIZE) - (1 << (DIGIT_SIZE - BIT_HEADER_BITS[key]));

export const MATCH_BIT_HEADER = (digit: number) =>
    Object.keys(BIT_HEADER_BINARY)
        .find((key) => (digit & BIT_HEADER_MASK(key)) === BIT_HEADER_BINARY[key] << (DIGIT_SIZE - BIT_HEADER_BITS[key]))

{
    console.log("BIT_HEADER_BINARY", BIT_HEADER_BINARY);
    console.log("BIT_HEADER_BITS", BIT_HEADER_BITS);
    console.log("PAYLOAD_BITS", PAYLOAD_BITS);
    console.log("MAX_VALUE", MAX_VALUE);
    const conflict = choosePairs(Object.entries(BIT_HEADER))
        .find(([[_1, header1], [_2, header2]]) => header1.startsWith(header2) || header2.startsWith(header1));
    if (conflict !== undefined)
        throw new Error(`The following header types overlap: ${conflict[0][0]} and ${conflict[1][0]}`);
}

const PALETTE_SELECTION_LENGTH = (type: keyof typeof BIT_HEADER) =>
    ~~(PAYLOAD_BITS[type] / PALETTE_BITS);

export const MAX_PALETTE_APPROXIMATION = 0.05;
export const MAX_BACKGROUND_APPROXIMATION = 0.05;

export interface ImageMetadata {
    size: SizeSpecifier,
    palette: PaletteSpecifier
}

const colourSpace = colourSpaces.colour64;
const paletteColourSpace = colourSpaces.colour512;

type ColourRepr = ReturnType<typeof colourSpace.serialize>;
type PaletteColourRepr = ReturnType<typeof paletteColourSpace.serialize>;


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
        return clamp(ceil(dimension / IMAGE_SIZE_STEP) * IMAGE_SIZE_STEP, IMAGE_SIZE_STEP, IMAGE_SIZE_MAX);
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

    static fromTape(tape: Tape): SizeSpecifier | null {
        return this.readTape(tape) ??
            tape.warnExpected('expected size specifier');
    }
}

export class PaletteSpecifier extends ImageToken {
    static expectedLength: number = PALETTE_LENGTH;

    static expectedDigits: number = PALETTE_LENGTH * paletteColourSpace.digits;

    static colourSpace = paletteColourSpace;

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
        return u8ArrayToB64(this.completePalette.map(PaletteSpecifier.colourSpace.serialize).flat());
    }

    protected static readTape(tape: Tape): PaletteSpecifier | null {
        const section = tape.readExactly(PaletteSpecifier.expectedDigits);
        if (!section) return null;
        const encoded = allOf(section.split('').map(b64toU8));
        if (!encoded) return null;
        const grouped = groups(encoded, PaletteSpecifier.colourSpace.digits) as PaletteColourRepr[];
        const colours: RGB[] | null = allOf<RGB>(grouped.map(PaletteSpecifier.colourSpace.deserialize));
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

abstract class PaletteSelectionAbstract extends ImageContentToken {
    abstract renderFrom(palette: RGB[]): RGB[]
}

function makePaletteSelectionClass(type: keyof typeof BIT_HEADER) {
    return class PaletteSelectionClass extends PaletteSelectionAbstract {
        static expectedLength = PALETTE_SELECTION_LENGTH(type);

        static expectedDigits = TOKEN_DIGITS[type];

        static matchHeader(u8: number) {
            return MATCH_BIT_HEADER(u8) === type;
        }

        constructor(readonly paletteIndices: number[] | Uint8Array) {
            super();
            if (paletteIndices.length !== PaletteSelectionClass.expectedLength)
                throw new Error(
                    `Palette selection size does not match ${PaletteSelectionClass.expectedLength} expected colours: ${paletteIndices}`
                );
            if (paletteIndices.some((index) => index < 0 || index > PaletteSpecifier.expectedLength))
                throw new Error(`Invalid palette indicies: ${paletteIndices}`);
        }

        // eslint-disable-next-line class-methods-use-this
        get name() {
            return type === "PALETTE_SELECTION_SHORT" ? "PaletteSelectionShort" : "PaletteSelection";
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
            if (palette.length > PaletteSpecifier.expectedLength) throw new Error("Palette too long");
            if (colours.length < PaletteSelectionClass.expectedLength) return null;
            const selection = Array.from(colours.slice(0, PaletteSelectionClass.expectedLength));
            const indices = allOf(
                selection.map((colour) => colourClosestMatch(palette, colour))
                    .map(([index, difference]) => difference > MAX_PALETTE_APPROXIMATION ? null : index)
            );
            if (!indices) return null;
            return new PaletteSelectionClass(indices);
        }

        static fromTape(tape: Tape): PaletteSelectionClass | null {
            const paletteSelection = this.readTape(tape);
            if (paletteSelection == null) return tape.warnExpected(
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
                throw new Error(`Bytes read (${header?.toString(2)}) do not start with palette selection header`);
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

        static fromPixelBuffer(buffer: PixelReader, metadata: ImageMetadata): PaletteSelectionClass | null {
            if (buffer.offset > 0) return null;
            if (!buffer.preview(PaletteSelectionClass.expectedLength)) return null;
            const palette = metadata.palette.completePalette;
            const paletteSelection = PaletteSelectionClass.tryMake(buffer.lastPreview(), palette);
            buffer.consumeIf(paletteSelection !== null);
            return paletteSelection;
        }
    }
}

export const PaletteSelection = makePaletteSelectionClass("PALETTE_SELECTION");

export const PaletteSelectionShort = makePaletteSelectionClass("PALETTE_SELECTION_SHORT");

export abstract class OffsetColourAbstract extends ImageContentToken {
    abstract getRGB(): RGB;

    readonly offset: number = NaN;
}

function makeOffsetColourClass(type: keyof typeof BIT_HEADER) {
    return class OffsetColourClass extends OffsetColourAbstract {
        static expectedDigits: number = TOKEN_DIGITS[type] + colourSpace.digits;

        static maxOffset: number = MAX_VALUE[type];

        static matchHeader(u8: number) {
            return MATCH_BIT_HEADER(u8) === type;
        }

        readonly colour: RGB;

        constructor(readonly offset: number, colour: RGB) {
            super();
            if (offset < 0) throw new RangeError("Offset can't be negative");
            if (offset > MAX_VALUE[type]) throw new Error(`Offset ${offset} too big to encode`);
            this.colour = colourSpace.map(colour);
        }

        // eslint-disable-next-line class-methods-use-this
        get name() {
            return type === "OFFSET" ? "OffsetColour" : "OffsetColourLong";
        }

        representation() {
            return `${this.name}(${this.offset}, ${representColour(
                this.colour
            )})`;
        }

        serialize() {
            const offsetBits = new GroupedBits(DIGIT_SIZE);
            offsetBits.pushNumber(BIT_HEADER_BINARY[type], BIT_HEADER_BITS[type]);
            offsetBits.pushNumber(this.offset, PAYLOAD_BITS[type]);
            offsetBits.topUp();
            const serialized = u8ArrayToB64([...offsetBits.numbers, ...colourSpace.serialize(this.colour)]);
            if (serialized.length !== OffsetColourClass.expectedDigits)
                throw new Error(`Expected token serialization of length ${OffsetColourClass.expectedDigits}, got "${serialized}"`);
            return serialized;
        }

        static fromTape(tape: Tape): OffsetColourClass | null {
            const offsetColour = this.readTape(tape);
            if (!offsetColour) tape.warnExpected("expected OffsetColour token", OffsetColourClass.expectedDigits);
            return offsetColour;
        }

        protected static readTape(tape: Tape): OffsetColourClass | null {
            const offsetChars = tape.readExactly(TOKEN_DIGITS[type]);
            if (!offsetChars) { tape.advance(colourSpace.digits); return null; }
            const offsetDigits = b64toU8Array(offsetChars);
            if (!offsetDigits) { tape.advance(colourSpace.digits); return null; }
            const offsetBits = new GroupedBits(DIGIT_SIZE);
            offsetBits.pushNumbers(Array.from(offsetDigits), DIGIT_SIZE);
            // Assertion that function only starts if offset byte is already detected
            // otherwise the read failure state is ambiguous
            const header = offsetBits.shiftBits(BIT_HEADER_BITS[type])
            if (header !== BIT_HEADER_BINARY[type])
                throw new Error(`Bytes read (${header?.toString(2)}) do not start with offset header`);
            const offset = offsetBits.toNumber();
            const colourChars = tape.read(colourSpace.digits);
            if (colourChars === null) return null;
            const colourU8s = b64toU8Array(colourChars);
            if (colourU8s === null || colourU8s.length !== colourSpace.digits) return null;
            const colour = colourSpace.deserialize(Array.from(colourU8s) as ColourRepr);
            if (colour === null) return null;
            return new OffsetColourClass(offset, colour);
        }

        getRGB(): RGB {
            return this.colour;
        }

        toPixelBuffer(buffer: PixelPlacer, _metadata: ImageMetadata) {
            const success = buffer.skip(this.offset);
            if (success) buffer.placeOne(this.getRGB());
            return success;
        }

        static fromPixelBuffer(buffer: PixelReader): OffsetColourClass | null {
            if (!buffer.peekOne()) return null;
            const offsetColour = new OffsetColourClass(buffer.offset, buffer.lastPreview()[0]);
            buffer.consume();
            return offsetColour;
        }
    }
}

export const OffsetColour = makeOffsetColourClass("OFFSET");

// export const OffsetColourLong = makeOffsetColourClass("OFFSET_LONG");
export const OffsetColourLong = OffsetColour;
