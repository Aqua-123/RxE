/* eslint-disable prettier/prettier */
import { colourClosestMatch, colourDifference, imageFromData, median, getFrequencies, sorters, percent, choosePairs, pairwise, sortWith, extractBoth, colourEqualTo } from "~src/utils";
import { b64toU8, b64toU8Array, u8toB64 } from "~src/bitutils";
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
    MAX_BACKGROUND_APPROXIMATION,
    OffsetColourLong,
    OffsetColourAbstract,
    PaletteSelectionShort
} from "./format0tokens";
import { colourSpaces, sampleImage } from "./interpolation";

export class Tokenizer {
    protected static readBufferToken(
        pixels: PixelReader,
        metadata: ImageMetadata
    ): ImageContentToken | null {
        const palette = metadata.palette.completePalette;
        if (pixels.findNext((colour) => !colourEqualTo(palette[0])(colour)) === null) {
            pixels.finish();
            return null;
        }
        if (pixels.offset < OffsetColourLong.maxOffset) {
            // if (pixels.offset < OffsetColour.maxOffset) {
            const peek = pixels.peekOne();
            if (peek && colourDifference(peek, palette[0]) < MAX_BACKGROUND_APPROXIMATION) {
                pixels.skip();
                return null;
            }
            pixels.backtrack();
        }
        else return OffsetColourLong.fromPixelBuffer(pixels);
        // else return OffsetColour.fromPixelBuffer(pixels);
        return (
            PaletteSelection.fromPixelBuffer(pixels, metadata)
            ?? PaletteSelectionShort.fromPixelBuffer(pixels, metadata)
            ?? (
                // OffsetColour.fromPixelBuffer(pixels)
                pixels.offset >= OffsetColour.maxOffset ?
                    OffsetColourLong.fromPixelBuffer(pixels) :
                    OffsetColour.fromPixelBuffer(pixels)
            )
        );
    }

    static serializeTokens(tokens: ImageToken[]) {
        console.time('serializeTokens()')
        const tokensSerialized = tokens.map((token) => token.serialize()).join("");
        console.timeEnd('serializeTokens()')
        return tokensSerialized;
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
        console.time('readImage()')
        const size = new SizeSpecifier(options.width, options.height);
        const { width, height } = size;
        Object.assign(options, { width, height });
        const sampledImage = sampleImage(image, options).map(colourSpaces.colour512.map);
        if (sampledImage.length === 0) throw new Error("Error sampling image");
        const serializedPixels: string[] = sampledImage.map(colourSpaces.colour512.serialize)
            .map((colour) => colour.map(u8toB64).join(""));
        const paletteRGB = Tokenizer.selectPalette(serializedPixels);
        const palette = PaletteSpecifier.fromRGB(paletteRGB);
        const readImage = {
            pixels: PixelReader.fromImage(sampledImage),
            metadata: { size, palette } as ImageMetadata
        };
        console.timeEnd('readImage()');
        return readImage;
    }

    static selectPalette(image: string[]): RGB[] {
        const colourSpace = colourSpaces.colour512;
        const palette: RGB[] = [];
        let frequencies = getFrequencies(image).map(([colour, frequency]) => [colour, frequency, 1] as [string, number, number]);
        while (palette.length < PaletteSpecifier.expectedLength
            && frequencies.length > 0) {
            const newColour = Array.from(b64toU8Array(frequencies.shift()![0])!);
            palette.push(colourSpace.deserialize(newColour as any)!);
            frequencies = frequencies.map(([colour, frequency]) => {
                const rgb = colourSpace.deserialize(Array.from(b64toU8Array(colour)!) as ReturnType<typeof colourSpace.serialize>)!;
                const distance = palette.map((c) => colourDifference(c, rgb))
                    .reduce((a, b) => a + b, 0) / palette.length;
                return [colour, frequency, distance];
            })
            sortWith(frequencies,
                extractBoth(([_, freq, dist]) => freq * dist, sorters.numeric),
                'desc',
                true
            );
            // sortBy(frequencies, '1', sorters.numeric, 'desc', true);
        }
        return palette;
    }

    static writeImage(tokens: ImageContentToken[], metadata: ImageMetadata): string {
        const { size, palette } = metadata;
        const backgroundColour = palette.completePalette[0];
        const buffer = new PixelPlacer(metadata.size.dataSize, backgroundColour);
        tokens.forEach((token) => token.toPixelBuffer(buffer, metadata));
        const image = buffer.toImage();
        return imageFromData(image, size.width, size.height, backgroundColour, 4);
    }

    static fromPixels(
        pixels: PixelReader,
        metadata: ImageMetadata
    ): ImageContentToken[] {
        console.time('fromPixels()')
        const tokens: Array<ImageContentToken | null> = [];
        while (!pixels.done()) tokens.push(this.readBufferToken(pixels, metadata));
        const tokensPure = tokens.filter((token) => !!token) as ImageContentToken[];
        console.timeEnd('fromPixels()')
        this.tokenStatistics(tokensPure, metadata);
        return tokensPure;
    }

    static tokenStatistics(tokens: ImageContentToken[], metadata: ImageMetadata) {
        const offsetColours = tokens.filter((token) =>
            token instanceof OffsetColour
            || token instanceof OffsetColourLong) as OffsetColourAbstract[];

        const offsetColourLongs = offsetColours.filter((token) => token instanceof OffsetColourLong);
        const offsetColourSmalls = offsetColours.filter((token) => token instanceof OffsetColour);
        const zeroOffsets = offsetColours.filter((token) => token.offset === 0);
        const maxOffsets = offsetColourSmalls.filter((token) => token.offset === OffsetColour.maxOffset);
        const maxOffsetLongs = offsetColourLongs.filter((token) => token.offset === OffsetColourLong.maxOffset);

        const tokenRatio = offsetColours.length / tokens.length;
        const offsetRatio = offsetColourSmalls.length / offsetColours.length;
        const zeroRatio = zeroOffsets.length / offsetColours.length;
        const maxRatio = maxOffsets.length / offsetColourSmalls.length;
        const maxRatioLong = maxOffsetLongs.length / offsetColourLongs.length;
        const palette = metadata.palette.completePalette;
        const medianPaletteRange = median(choosePairs(palette).map(pairwise(colourDifference)));

        console.log(`size is: ${metadata.size.representation()}`);
        console.log(`palette is: ${metadata.palette.representation()}`);

        const warning = `${percent(tokenRatio)} of tokens are of type OffsetColour`;
        if (tokenRatio > .5) console.warn(warning);
        else console.info(warning);

        console.info(`${percent(offsetRatio)} and ${percent(1 - offsetRatio)} \
of OffsetColour tokens are of subtype OFFSET and OFFSET_LONG`);

        const zeroWarning = `${percent(zeroRatio)} of OffsetColour tokens have an offset of zero`;
        if (zeroRatio > .5) console.warn(zeroWarning);
        else console.info(zeroWarning);

        console.info(`${percent(maxRatio)} and ${percent(maxRatioLong)} of OFFSET and OFFSET_LONG tokens \
have their maximum respective offset`);

        console.info(`palette colours have a median distance of ${percent(medianPaletteRange)} from one another`);

        const colourDistances = offsetColours.map((offsetColour) => colourClosestMatch(palette, offsetColour.getRGB())[1]);
        const medianDistance = median(colourDistances);
        console.info(`OffsetColour tokens have a median distance of ${percent(medianDistance)} from the palette`);

        const backgroundPalettes =
            tokens.filter((token) => token instanceof PaletteSelection && token.paletteIndices.every(index => index === 0));
        const bgPaletteRatio = backgroundPalettes.length / tokens.length
        const bgPaletteWarning = `${percent(bgPaletteRatio)} of tokens are background PaletteSelection tokens`;
        if (bgPaletteRatio > 0.05) console.warn(bgPaletteWarning)
        else console.info(bgPaletteWarning);

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
            }
            else if (OffsetColourLong.matchHeader(header)) {
                const offsetColour = OffsetColourLong.fromTape(tape);
                if (offsetColour) tokens.push(offsetColour);
                else return null;
            }
            else if (PaletteSelection.matchHeader(header)) {
                const paletteSelection = PaletteSelection.fromTape(tape);
                if (paletteSelection) tokens.push(paletteSelection);
                else return null;
            }
            else if (PaletteSelectionShort.matchHeader(header)) {
                const paletteSelection = PaletteSelectionShort.fromTape(tape);
                if (paletteSelection) tokens.push(paletteSelection);
                else return null;
            }
            else return tape.warnExpected(`unknown header type: 0b${header.toString(2)}`);
        }
        return tokens;
    }
}
