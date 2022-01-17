/* eslint-disable prettier/prettier */
import {
    b64HexColor,
    b64toU8,
    bitSplit,
    canvasToImage,
    clamp,
    expect,
    mostFrequent,
    memoize,
    rgbToB64,
    Tape,
    timeout,
    bitJoin,
    u8toB64
} from "~src/utils";
import { sampleImage, SamplingOptions } from "./interpolation";

const { ceil } = Math;

const MIN_SIZE = 8;

const MAX_SIZE = 64;

const SIZE_STEP = MAX_SIZE / 8;

function readSize(tape: Tape) {
    const sizeSpecifier = b64toU8(tape.read()) ?? 0;
    const sizeScaling = (size: number) => Math.max(1, (1 + size) * SIZE_STEP);
    const [width, height] = bitSplit(sizeSpecifier, 2, 6).map(sizeScaling);
    return { width, height };
}

function clampSize(dimension: number) {
    if (dimension === MIN_SIZE) return MIN_SIZE;
    return clamp(ceil(dimension / SIZE_STEP) * SIZE_STEP, MIN_SIZE, MAX_SIZE);
}

function encodeSize(width: number, height: number): string {
    const [w, h] = [clampSize(width), clampSize(height)].map(size => size === MIN_SIZE ? 0 : ceil(size / SIZE_STEP - 1));
    console.log("w", w, "h", h);
    return u8toB64((w << 3) + h);
}

// (not flexible)
const PALLETTE_BITS = 1;
const PALLETTE_LENGTH = 2 ** PALLETTE_BITS;
const MAX_OFFSET = 2 ** 5 - 1;

export async function compress(url: string, samplingOptions: SamplingOptions) {
    const { width, height } = samplingOptions;
    [samplingOptions.width, samplingOptions.height] = [width, height].map(clampSize);
    console.log(samplingOptions);
    const image = new Image();
    await timeout(expect(image, "load", (img) => { img.src = url }), 5000);
    const sampledImage = sampleImage(image, samplingOptions);
    const imageData = sampledImage.map(rgbToB64);
    /* 
    console.log("Sampled image: ", canvasToImage((canvas, context) => {
        canvas.width = samplingOptions.width;
        canvas.height = samplingOptions.height;
        imageData.map(b64HexColor).forEach((color, index) => {
            if (color === undefined) console.warn('colour is udnfeineddsd')
            context.fillStyle = color!;
            context.fillRect(index % height, ~~(index / height), 1, 1);
        });
    }));
    */
    // Check so we can assume that getModus won't return null.
    if (imageData.length === 0) throw new Error("Error sampling image");
    const pallette = mostFrequent(imageData).slice(0, PALLETTE_LENGTH);
    while (pallette.length < PALLETTE_LENGTH)
        pallette.push(...pallette.slice(-1));
    const backgroundColour = pallette[0];
    let nextPixel = 0;
    let compressed = encodeSize(width, height) + pallette.join("");
    for (let i = 0; i < imageData.length;) {
        const previewInBounds = (i + 5 * PALLETTE_BITS) <= imageData.length;
        const preview = previewInBounds && imageData.slice(i, i + 5 * PALLETTE_BITS);
        const palletteIndices = preview
            ? preview.map((candidate) => pallette.indexOf(candidate)) : null;
        const offset = i - nextPixel;
        const colour = imageData[i];
        // console.log(palletteIndices);
        if (offset < MAX_OFFSET
            && palletteIndices?.every((index) => index > -1)) {
            compressed += u8toB64(bitJoin(palletteIndices, PALLETTE_BITS));
            i += 5 * PALLETTE_BITS;
            nextPixel = i;
        }
        else if (offset < MAX_OFFSET && colour === backgroundColour) {
            // skip background colour
            i += 1;
        }
        else {
            // console.log(offset);
            compressed += u8toB64(0b100000 | offset) + colour;
            i += 1;
            nextPixel = i;
        }
    }

    if (compressed.length > 950) { console.warn(`Attempted to produce string: ${compressed}`); throw new Error("Resolution too big"); }
    return compressed;
}
export const unpack = memoize((compressed) => {
    const tape = new Tape(compressed);
    const size = readSize(tape);
    if (!size) return null;
    const { width, height } = size;
    const pallette: string[] = [];
    for (let i = 0; i < PALLETTE_LENGTH; i += 1) {
        const colour = b64HexColor(tape.read());
        if (colour === null) {
            tape.warnExpected('Expected valid colour in pallette specification');
            return null;
        }
        if (colour !== pallette[i - 1] && pallette.slice(-2).includes(colour)) {
            tape.warnExpected('Expected new colour in pallete specification');
            return null;
        }
        pallette.push(colour);
    }
    const backgroundColour = pallette[0];
    const image = new Map<number, string>();
    let nextPixel = 0;
    while (!tape.outOfBounds()) {
        const next = b64toU8(tape.read());
        if (next === null) {
            tape.warnExpected('Expected valid b64 digit');
            break;
        }
        if (next & 0b100000) {
            const colour = b64HexColor(tape.read());
            if (colour === null) {
                tape.warnExpected('Expected valid colour following offset')
                break;
            }
            nextPixel += next - 0b100000;
            image.set(nextPixel, colour);
        }
        else {
            const colours = bitSplit(next >> (5 % PALLETTE_BITS), ~~(5 / PALLETTE_BITS))
                .map((palletteIndex) => pallette[palletteIndex]);
            // eslint-disable-next-line no-loop-func
            colours.forEach((colour, index) => image.set(nextPixel + index, colour));
            nextPixel += colours.length;
        }
    }
    return canvasToImage((canvas, context) => {
        canvas.width = width;
        canvas.height = height;
        context.fillStyle = backgroundColour;
        context.fillRect(0, 0, width, height);
        const entries = Array.from(image.entries());
        entries.forEach(([offset, colour]) => {
            context.fillStyle = colour;
            context.fillRect(offset % width, ~~(offset / height), 1, 1);
        });
    });
});
