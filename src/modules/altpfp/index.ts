/* eslint-disable prettier/prettier */
import { b64toU8, bitsplit, memoize } from "~src/utils";

interface ImageFormat {
    unpack(compressed: string): string | null;
    compress(png64: string): string;
}

type ImageFormatType = "0";

function extractBioImage(s: string) {
    return s.match(/pfp:([A-Za-z0-9+/=]+)/)?.[1];
}

function canvasToPng(
    callback: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void
): string {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    callback(canvas, context!);
    return canvas.toDataURL();
}

function b64HexColor(s: string) {
    if (s.length === 0) throw new Error("");
    const u8 = b64toU8(s);
    if (u8 === null) return null;
    const code = bitsplit(u8, 3, 6)
        .map((u2) => (u2 * 5).toString(16))
        .join("");
    return `#${code}`;
}

const imageFormats: Record<ImageFormatType, ImageFormat> = {
    "0": {
        compress(_png64) {
            throw new Error("Not implemented");
        },
        unpack: memoize((compressed) => {
            const sizeSpecifier = b64toU8(compressed[0]) ?? 0;
            const sizeScaling = (size: number) => Math.max(1, size * 8); // up to 512 × 512
            const [width, height] = bitsplit(sizeSpecifier, 2, 6).map(sizeScaling);
            const backgroundColor = b64HexColor(compressed[1]);
            if (backgroundColor === null) return null;
            return canvasToPng((canvas, context) => {
                canvas.width = width;
                canvas.height = height;
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, width, height);
            });
        })
    }
};

/*
function compressImage(png64: string, format: string) {
    if (!(format in imageFormats)) return null;
    return imageFormats[format].compress(png64);
} 
*/

function unpackImage(compressed: string) {
    const format = compressed[0];
    if (!(format in imageFormats)) return null;
    return imageFormats[format as ImageFormatType].unpack(compressed.slice(1));
}


export function init() {
    const roomReceived = Room.prototype.received;
    Room.prototype.received = function received(messageData) {
        const imageCompressed = extractBioImage(messageData.user.bio);
        if (imageCompressed) {
            const imageUnpacked = unpackImage(imageCompressed);
            if (imageUnpacked) messageData.user.display_picture = imageUnpacked;
            // eslint-disable-next-line no-console
            else console.error(`Could not unpack image: ${imageCompressed}`);
            // eslint-disable-next-line no-console
            console.info(`Loaded custom image (${imageCompressed}) as (${imageUnpacked})`);
        }
        roomReceived.call(this, messageData);
    }
}