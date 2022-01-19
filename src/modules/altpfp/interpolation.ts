/* eslint-disable prettier/prettier */
import { clamp, getImageData, toNearestStep } from "~src/utils";
import { b64toRGB, b64toU8Array, bitsRegroup, rgbToB64, u8ArrayToB64 } from "~src/bitutils";
import { DIGIT_SIZE } from "./format0tokens";

const { ceil, round } = Math;

export const interpolation: Record<InterpolationType, ImageInterpolator> = {
    none: (accessor, [x, y]) => accessor(round(x), round(y))
};

const COMPONENT_BITS: Record<ColourSpaceType, number> = {
    "colour64": 2,
    "colour512": 3
}

export const colourSpaces: Record<ColourSpaceType, ColourSpace<string>> = {
    colour64: {
        map(colour: RGB) {
            const max = (1 << COMPONENT_BITS.colour64) - 1;
            const step = 255 / max;
            return colour.map((comp) => toNearestStep(comp, step, 0, max) * step) as RGB;
        },
        deserialize(base64: string) {
            return b64toRGB(base64);
        },
        serialize(colour: RGB) {
            return rgbToB64(colour);
        },
        digits: 1
    },
    colour512: {
        map(colour: RGB) {
            const max = (1 << COMPONENT_BITS.colour512) - 1;
            const step = 255 / max;
            return colour.map((comp) => clamp(round(toNearestStep(comp, step, 0, max) * step), 0, 255)) as RGB;
        },
        deserialize(base64: string) {
            const max = (1 << COMPONENT_BITS.colour512) - 1;
            const step = 255 / max;
            const u8s = b64toU8Array(base64);
            if (!u8s) return null;
            return bitsRegroup(
                Array.from(u8s), DIGIT_SIZE, COMPONENT_BITS.colour512
            ).slice(0, 3).map((component) => clamp(round(component * step), 0, 255)) as RGB | null;
        },
        serialize(colour: RGB) {
            const max = (1 << COMPONENT_BITS.colour512) - 1;
            const step = 255 / max;
            const components = colour.map((comp) => toNearestStep(comp, step, 0, max));
            return u8ArrayToB64(bitsRegroup(components, COMPONENT_BITS.colour512, DIGIT_SIZE));
        },
        digits: 2
    }
};

function imageAccessor(image: Image): ImageAccessor {
    const { width } = image;
    const imageData = getImageData(image);
    return (x, y) => {
        const index = 4 * (y * width + x);
        const data: number[] = Array.prototype.slice.call(
            imageData.data,
            index,
            index + 3
        );
        if (data.length !== 3) {
            // eslint-disable-next-line no-console
            console.warn(`Failed getting image data for index ${index}`, data);
            return null;
        }
        return data as RGB;
    };
}

export function sampleImage(
    image: Image,
    { interpolator, width, height }: SamplingOptions
): RGB[] {
    const sampledImage: RGB[] = Array.from({ length: width * height });
    const accessor = imageAccessor(image);
    for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
            const rgba = interpolator(
                accessor,
                [x / width * image.width, y / width * image.width],
                [ceil(image.width / width), ceil(image.height / height)]
            );
            // todo: add more details to message
            // eslint-disable-next-line no-console
            if (rgba === null || rgba === undefined) console.warn(`Interpolation failed at ${x}, ${y}`);
            sampledImage[y * width + x] = rgba ?? [0, 0, 0];
        }
    }
    return sampledImage;
}
