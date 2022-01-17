/* eslint-disable prettier/prettier */
/* eslint-disable max-classes-per-file */
import {
    b64toU8,
    bitSplit,
    clamp,
    Tape,
    u8toB64,
    rgbToU8,
    u8toRGB,
    b64toU8Array,
    GroupedBits,
    u8ArrayToB64
} from "~src/utils";

const { ceil } = Math;

export const MAX_SIZE = 64;

export const SIZE_STEP = MAX_SIZE / 8;

export const DIGIT_SIZE = 6;

export const PALLETTE_BITS = 3;
export const PALLETTE_LENGTH = 2 ** PALLETTE_BITS;
export const BIT_HEADER_BITS = 1;
export const BIT_HEADER = {
    PALLETTE_SELECTION: 0b0,
    OFFSET: 0b1
};

const BIT_HEADER_MASK = (2 ** DIGIT_SIZE) - (2 ** (DIGIT_SIZE - BIT_HEADER_BITS));

export const MATCH_BIT_HEADER = (digit: number) =>
    Object.keys(BIT_HEADER)
        .find((key) => (digit & BIT_HEADER_MASK) === BIT_HEADER[key] << (DIGIT_SIZE - BIT_HEADER_BITS))


export const PAYLOAD_BITS = {
    PALLETTE_SELECTION: 2 * DIGIT_SIZE - 1,
    OFFSET: DIGIT_SIZE - 1
};

export const PALLETTE_SELECTION_LENGTH = ~~(PAYLOAD_BITS.PALLETTE_SELECTION / PALLETTE_BITS);

export const TOKEN_DIGITS = {
    PALLETTE_SELECTION: ceil((BIT_HEADER_BITS + PAYLOAD_BITS.PALLETTE_SELECTION) / DIGIT_SIZE),
    OFFSET: ceil((BIT_HEADER_BITS + PAYLOAD_BITS.OFFSET) / DIGIT_SIZE)
};

export const MAX_OFFSET = 2 ** PAYLOAD_BITS.OFFSET - 1;

// tokenization might slow perf
// but debugging is easier
// DX > UX
export abstract class ImageToken {
    abstract serialize(): string;

    abstract representation(): string;

    protected get name(): string {
        return this.constructor.name;
    }
}
export class SizeSpecifier extends ImageToken {
    readonly width: number;

    readonly height: number;

    constructor(width: number, height: number) {
        super();
        this.width = SizeSpecifier.clampSize(width);
        this.height = SizeSpecifier.clampSize(height);
    }

    static clampSize(dimension: number): number {
        return clamp(ceil(dimension / SIZE_STEP) * SIZE_STEP, SIZE_STEP, MAX_SIZE);
    }

    static parseSize(u3: number): number {
        return (u3 + 1) * SIZE_STEP;
    }

    static compressSize(dimension: number) {
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

    static fromTape(tape: Tape): SizeSpecifier | null {
        const digit = b64toU8(tape.read());
        if (digit === null) return null;
        const [width, height] = bitSplit(digit, 2, DIGIT_SIZE);
        return new SizeSpecifier(
            SizeSpecifier.parseSize(width),
            SizeSpecifier.parseSize(height)
        );
    }
}
function validColour(colour: RGB): boolean {
    return !colour.some((component) => component < 0 || component > 255);
}
export function representColour(colour: RGB): string {
    return `rgb(${colour.join(", ")})`;
}
export class PalletteSpecifier extends ImageToken {
    constructor(readonly colours: number[] | Uint8Array) {
        super();
        if (colours.length === 0) throw new Error("No colours supplied");
        if (colours.length > PALLETTE_LENGTH)
            throw new Error("Too many colours supplied");
        if (colours.some((colour) => colour >= 64))
            throw new RangeError("Colours out of bounds");
    }

    representation() {
        const { name, colours } = this;
        return `${name}([${Array.from(colours)
            .map(u8toRGB)
            .map(representColour)
            .join(", ")}])`;
    }

    get completePallette(): number[] {
        const remaining = PALLETTE_LENGTH - this.colours.length;
        return [
            ...this.colours,
            ...Uint8Array.from({ length: remaining }, () => this.colours.slice(-1)[0])
        ];
    }

    get completeRGBPallette(): RGB[] {
        return this.completePallette.map(u8toRGB);
    }

    serialize() {
        return this.completePallette.map(u8toB64).join("");
    }

    static fromTape(tape: Tape): PalletteSpecifier | null {
        const section = tape.read(PALLETTE_LENGTH);
        if (!section || section.length !== PALLETTE_LENGTH) {
            tape.advance(PALLETTE_LENGTH - (section?.length ?? 0));
            return null;
        }
        const colours = b64toU8Array(section);
        if (!colours) return null;
        return new PalletteSpecifier(colours);
    }

    static fromRGB(colours: RGB[]) {
        if (colours.some((colour) => !validColour(colour)))
            throw new Error("Invalid colour");
        return new PalletteSpecifier(Uint8Array.from(colours.map(rgbToU8)));
    }
}
export class PalletteSelection extends ImageToken {
    constructor(readonly palletteIndices: number[] | Uint8Array) {
        super();
        if (palletteIndices.length !== PALLETTE_SELECTION_LENGTH)
            throw new Error(
                `Pallette selection size does not match ${PALLETTE_SELECTION_LENGTH} expected colours: ${palletteIndices}`
            );
        if (palletteIndices.some((index) => index < 0 || index > PALLETTE_LENGTH))
            throw new Error(`Invalid pallette indicies: ${palletteIndices}`);
    }

    representation() {
        return `${this.name}([${this.palletteIndices.join(", ")}])`;
    }

    serialize() {
        const palletteBits = new GroupedBits(DIGIT_SIZE);
        palletteBits.pushNumber(BIT_HEADER.PALLETTE_SELECTION, BIT_HEADER_BITS);
        palletteBits.pushNumbers(Array.from(this.palletteIndices), PALLETTE_BITS);
        return u8ArrayToB64(palletteBits.topUp().numbers);
    }

    static tryMake(
        colours: number[] | Uint8Array,
        pallette: number[]
    ): PalletteSelection | null {
        if (pallette.length > PALLETTE_LENGTH) throw new Error("Pallette too long");
        if (colours.length < PALLETTE_SELECTION_LENGTH) return null;
        const selection = Array.from(colours.slice(0, PALLETTE_SELECTION_LENGTH));
        const indices = selection.map((colour) => pallette.indexOf(colour));
        if (indices.includes(-1)) return null;
        return new PalletteSelection(indices);
    }

    static fromTape(tape: Tape): PalletteSelection | null {
        const tapeChars = tape.read(TOKEN_DIGITS.PALLETTE_SELECTION);
        if (!tapeChars || tapeChars.length < TOKEN_DIGITS.PALLETTE_SELECTION)
            return null;
        const tapeDigits = b64toU8Array(tapeChars);
        if (!tapeDigits) return null;
        const palletteBits = new GroupedBits(PALLETTE_BITS);
        palletteBits.pushNumbers(Array.from(tapeDigits), DIGIT_SIZE);
        if (
            palletteBits.shiftBits(BIT_HEADER_BITS)! !== BIT_HEADER.PALLETTE_SELECTION
        )
            throw new Error("Bytes read do not start with pallette selection header");
        return new PalletteSelection(palletteBits.trim().numbers);
    }

    reify(pallette: RGB[]): RGB[] {
        if (pallette.length < PALLETTE_LENGTH)
            throw new Error("Received incomplete pallette");
        return Array.from(this.palletteIndices).map((index) => pallette[index]);
    }
}
export class OffsetColour extends ImageToken {
    constructor(readonly offset: number, readonly colour: number) {
        super();
        if (offset > MAX_OFFSET)
            throw new Error(`Offset ${offset} too big to encode`);
    }

    representation() {
        return `${this.name}(${this.offset}, ${representColour(
            u8toRGB(this.colour)
        )})`;
    }

    serialize() {
        const offsetBits = new GroupedBits(DIGIT_SIZE);
        offsetBits.pushNumber(BIT_HEADER.OFFSET, BIT_HEADER_BITS);
        offsetBits.pushNumber(this.offset, PAYLOAD_BITS.OFFSET);
        return u8ArrayToB64(offsetBits.topUp().numbers) + u8toB64(this.colour);
    }

    static fromTape(tape: Tape): OffsetColour | null {
        const offsetChars = tape.read(TOKEN_DIGITS.OFFSET);
        if (!offsetChars || offsetChars.length < TOKEN_DIGITS.OFFSET) {
            tape.advance(1);
            return null;
        }
        const offsetDigits = b64toU8Array(offsetChars);
        if (!offsetDigits) {
            tape.advance(1);
            return null;
        }
        const offsetBits = new GroupedBits(DIGIT_SIZE);
        offsetBits.pushNumbers(Array.from(offsetDigits), DIGIT_SIZE);
        // Assertion that function only starts if offset byte is already detected
        // otherwise the read failure state is ambiguous
        if (offsetBits.shiftBits(BIT_HEADER_BITS) !== BIT_HEADER.OFFSET)
            throw new Error("Bytes read do not start with offset header");
        const offset = offsetBits.toNumber();
        const colour = b64toU8(tape.read());
        if (!colour) return null;
        return new OffsetColour(offset, colour);
    }

    getRGB(): RGB {
        return u8toRGB(this.colour);
    }
}
export function viewTokenList(tokens: ImageToken[]) {
    return console.log(
        "tokens",
        tokens
            .map((token) => `${token.representation()}: '${token.serialize()}'`)
            .join("\n")
    );
}
export function parseTape(tape: Tape): ImageToken[] | null {
    const tokens = [];
    while (!tape.outOfBounds()) {
        const header = b64toU8(tape.peek()!);
        if (header === null) {
            tape.warnExpected(`Expected valid b64 digit`, 1, false);
            return null;
        }
        switch (MATCH_BIT_HEADER(header)) {
            case "OFFSET": {
                const offsetColour = OffsetColour.fromTape(tape);
                if (!offsetColour) {
                    tape.warnExpected(
                        "Expected OffsetColour token",
                        TOKEN_DIGITS.OFFSET + 1
                    );
                    return null;
                }
                tokens.push(offsetColour);
                break;
            }
            case "PALLETTE_SELECTION": {
                const palletteSelection = PalletteSelection.fromTape(tape);
                if (!palletteSelection) {
                    tape.warnExpected(
                        "Expected PalletteSelection token",
                        TOKEN_DIGITS.PALLETTE_SELECTION
                    );
                    return null;
                }
                tokens.push(palletteSelection);
                break;
            }
            case undefined:
                tape.warnExpected(`Could not infer header type: 0b${header.toString(2)}`);
                return null
            default:
                tape.warnExpected(`Unknown header type: 0b${header.toString(2)}`);
                return null;
        }
    }
    return tokens;
}
