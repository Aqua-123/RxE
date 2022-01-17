/* eslint-disable prettier/prettier */
import { getImageData } from "~src/utils";

const { ceil, round } = Math;

export const interpolation: Record<InterpolationType, ImageInterpolator> = {
    none: (accessor, [x, y]) => accessor(round(x), round(y))
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
