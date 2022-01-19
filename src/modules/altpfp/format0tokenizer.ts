/* eslint-disable prettier/prettier */
import { colourDifference, imageFromData, mostFrequent } from "~src/utils";
import { b64toU8 } from "~src/bitutils";
import Tape from "~src/tape";
import { PixelPlacer, PixelReader } from "./pixelBuffer";
import {
    ImageToken,
    ImageMetadata,
    SizeSpecifier,
    PaletteSpecifier,
    ImageContentToken,
    PaletteSelection,
    OffsetColour,
    MAX_BACKGROUND_APPROXIMATION
} from "./format0tokens";
import { colourSpaces, sampleImage } from "./interpolation";

export class Tokenizer {
    protected static readBufferToken(
        pixels: PixelReader,
        metadata: ImageMetadata
    ): ImageContentToken | null {
        const palette = metadata.palette.completePalette;
        if (pixels.offset < OffsetColour.maxOffset) {
            const peek = pixels.peekOne();
            if (peek && colourDifference(peek, palette[0]) < MAX_BACKGROUND_APPROXIMATION) {
                pixels.skip();
                return null;
            }
            pixels.backtrack();
        }
        else return OffsetColour.fromPixelBuffer(pixels);
        return (
            PaletteSelection.fromPixelBuffer(pixels, metadata) ??
            OffsetColour.fromPixelBuffer(pixels)
        );
    }

    static serializeTokens(tokens: ImageToken[]) {
        return tokens.map((token) => token.serialize()).join("");
    }

    static viewTokenList(tokens: ImageToken[]) {
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

    static readImage(image: Image, options: SamplingOptions) {
        const size = new SizeSpecifier(options.width, options.height);
        const { width, height } = size;
        Object.assign(options, { width, height });
        const sampledImage = sampleImage(image, options).map(colourSpaces.colour512.map);
        if (sampledImage.length === 0) throw new Error("Error sampling image");
        const serializedPixels = sampledImage.map(colourSpaces.colour512.serialize);
        const paletteRGB = mostFrequent(serializedPixels)
            .slice(0, PaletteSpecifier.expectedLength)
            .map(colourSpaces.colour512.deserialize) as RGB[];
        const palette = PaletteSpecifier.fromRGB(paletteRGB);
        return {
            pixels: PixelReader.fromImage(sampledImage),
            metadata: { size, palette } as ImageMetadata
        }
    }

    static writeImage(tokens: ImageContentToken[], metadata: ImageMetadata): string {
        const { size, palette } = metadata;
        const buffer = new PixelPlacer(metadata.size.dataSize);
        tokens.forEach((token) => token.toPixelBuffer(buffer, metadata));
        const image = buffer.toImage();
        return imageFromData(image, size.width, size.height, palette.completePalette[0]);
    }

    static fromPixels(
        pixels: PixelReader,
        metadata: ImageMetadata
    ): ImageContentToken[] {
        const tokens: Array<ImageContentToken | null> = [];
        while (!pixels.done()) tokens.push(this.readBufferToken(pixels, metadata));
        const tokensPure = tokens.filter((token) => !!token) as ImageContentToken[];
        this.tokenStatistics(tokensPure);
        return tokensPure;
    }

    static tokenStatistics(tokens: ImageContentToken[]) {
        const percent = (fraction: number) => `${(fraction * 100).toPrecision(3)}%`;

        const tokenRatio = tokens.filter((token) => token instanceof OffsetColour).length / tokens.length;
        const warning = `${percent(tokenRatio)} of tokens are OffsetColour`;
        const warning2 = `${percent(1 - tokenRatio)} of tokens are PaletteSelection`
        if (tokenRatio > .5) console.warn(warning);
        else if (tokenRatio > .25) console.info(warning);
        else if (tokenRatio < .1) console.warn(warning2);

        const zeroOffsetRatio =
            tokens.filter((token) => token instanceof OffsetColour && token.offset === 0).length / tokens.length;
        if (zeroOffsetRatio > 0.1) console.warn(`${percent(zeroOffsetRatio)} of tokens are zero-offset OffsetColour tokens`);

        const backgroundPalettes =
            tokens.filter((token) => token instanceof PaletteSelection && token.paletteIndices.every(index => index === 0));
        const bgPaletteRatio = backgroundPalettes.length / tokens.length
        if (bgPaletteRatio > 0.05) console.warn(`${percent(bgPaletteRatio)} of tokens are background PaletteSelection tokens`);

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
            } else if (PaletteSelection.matchHeader(header)) {
                const paletteSelection = PaletteSelection.fromTape(tape);
                if (paletteSelection) tokens.push(paletteSelection);
                else return null;
            }
            else return tape.warnExpected(`unknown header type: 0b${header.toString(2)}`);
        }
        return tokens;
    }
}
