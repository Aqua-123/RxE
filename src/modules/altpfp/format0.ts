/* eslint-disable no-continue */
/* eslint-disable max-classes-per-file */
/* eslint-disable prettier/prettier */
import {
    canvasToImage,
    expect,
    mostFrequent,
    memoize,
    Tape,
    timeout,
    rgbToU8
} from "~src/utils";
import {
    representColour,
    ImageToken,
    SizeSpecifier,
    PalletteSpecifier,
    PalletteSelection,
    OffsetColour,
    viewTokenList,
    parseTape,
    PALLETTE_LENGTH,
    MAX_OFFSET,
    PALLETTE_SELECTION_LENGTH
} from "./format0tokens";
import { sampleImage } from "./interpolation";

function imageFromData(image: RGB[] | Map<number, RGB>, width: number, height: number, backgroundColour?: RGB): string {
    const imageData = Array.from(image.entries())
    return canvasToImage((canvas, context) => {
        canvas.width = width;
        canvas.height = height;
        if (backgroundColour)
            context.fillStyle = representColour(backgroundColour);
        context.fillRect(0, 0, width, height);
        imageData.forEach(([offset, colour]) => {
            context.fillStyle = representColour(colour);
            context.fillRect(offset % width, ~~(offset / height), 1, 1);
        });
    });
}

const LOG_SAMPLED_IMAGE = true;

export async function compress(url: string, options: SamplingOptions) {
    const { width, height } = options;
    const image = new Image();
    await timeout(expect(image, "load", (img) => { img.src = url }), 5000);
    const sampledImage = sampleImage(image, options);
    if (sampledImage.length === 0) throw new Error("Error sampling image");
    if (LOG_SAMPLED_IMAGE)
        console.log("Sampled image: ", imageFromData(sampledImage, options.width, options.height));
    const imageData = Uint8Array.from(sampledImage.map(rgbToU8));
    const pallette = mostFrequent<number, Uint8Array>(imageData).slice(0, PALLETTE_LENGTH);
    const backgroundColour = pallette[0];
    let nextPixel = 0;
    const tokens: ImageToken[] = [new SizeSpecifier(width, height), new PalletteSpecifier(pallette)];
    for (let i = 0; i < imageData.length;) {
        const offset = i - nextPixel;
        if (offset === 0) {
            const palletteSelection = PalletteSelection.tryMake(
                imageData.slice(i, i + PALLETTE_SELECTION_LENGTH),
                pallette
            );
            if (palletteSelection) {
                tokens.push(palletteSelection);
                i += PALLETTE_SELECTION_LENGTH;
                nextPixel = i;
                continue;
            }
        }
        const colour = imageData[i];
        i += 1
        if (offset < MAX_OFFSET && colour !== backgroundColour) {
            tokens.push(new OffsetColour(offset, colour));
            nextPixel = i;
        }
    }
    viewTokenList(tokens);
    const compressed = tokens.map((token) => token.serialize()).join('');
    if (compressed.length > 2048) {
        console.warn(`Attempted to produce string: ${compressed}`);
        throw new Error("Resolution too big");
    }
    return compressed;
}

export const unpack = memoize((compressed) => {
    const tape = new Tape(compressed);
    const size = SizeSpecifier.fromTape(tape);
    if (!size) {
        tape.warnExpected('Expected size specifier');
        return null;
    }
    const palletteSpecifier = PalletteSpecifier.fromTape(tape);
    if (!palletteSpecifier) {
        tape.warnExpected('Expected pallette specifier', PALLETTE_LENGTH);
        return null;
    }
    const pallette = palletteSpecifier.completeRGBPallette;
    const backgroundColour = pallette[0];
    const tokens = parseTape(tape);
    if (tokens === null) return null;
    viewTokenList([size, palletteSpecifier, ...tokens]);
    const image = new Map<number, RGB>();
    let nextPixel = 0;
    tokens.forEach((token) => {
        if (token instanceof PalletteSelection) {
            const colours = token.reify(pallette);
            for (; colours.length > 0; nextPixel += 1)
                image.set(nextPixel, colours.shift()!);
        }
        else if (token instanceof OffsetColour) {
            nextPixel += token.offset;
            image.set(nextPixel, token.getRGB())
            nextPixel += 1;
        }
    });
    return imageFromData(image, size.width, size.height, backgroundColour);
});