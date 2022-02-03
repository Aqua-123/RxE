/* eslint-disable prettier/prettier */
import { clamp, getImageData, hexToRGB, toNearestStep } from "~src/utils";
import { bitsRegroup, rgbToU8, u8toRGB } from "~src/bitutils";
import { DIGIT_SIZE } from "./format0/config";
import { P, Preferences } from "~src/preferences";

const { round } = Math;

export const interpolation: Record<InterpolationType, ImageInterpolator> = {
  none: (accessor, [x, y]) => accessor(round(x), round(y))
};

const COMPONENT_BITS: Record<ColourSpaceType, number> = {
  colour64: 2,
  colour512: 3
};

export const colourSpaces = {
  colour64: {
    map(colour: RGB) {
      const max = (1 << COMPONENT_BITS.colour64) - 1;
      const step = 255 / max;
      return colour.map(
        (comp) => toNearestStep(comp, step, 0, max) * step
      ) as RGB;
    },
    deserialize(u8s) {
      return u8toRGB(u8s[0]);
    },
    serialize(colour: RGB) {
      return [rgbToU8(colour)];
    },
    digits: 1
  } as ColourSpace<[number]>,
  colour512: {
    map(colour: RGB) {
      const max = (1 << COMPONENT_BITS.colour512) - 1;
      const step = 255 / max;
      return colour.map((comp) =>
        clamp(round(toNearestStep(comp, step, 0, max) * step), 0, 255)
      ) as RGB;
    },
    deserialize(u8s) {
      if (!u8s) return null;
      const max = (1 << COMPONENT_BITS.colour512) - 1;
      const step = 255 / max;
      return bitsRegroup(Array.from(u8s), DIGIT_SIZE, COMPONENT_BITS.colour512)
        .slice(0, 3)
        .map((component) =>
          clamp(round(component * step), 0, 255)
        ) as RGB | null;
    },
    serialize(colour: RGB) {
      const max = (1 << COMPONENT_BITS.colour512) - 1;
      const step = 255 / max;
      const components = colour.map((comp) =>
        toNearestStep(comp, step, 0, max)
      );
      return bitsRegroup(components, COMPONENT_BITS.colour512, DIGIT_SIZE);
    },
    digits: 2
  } as ColourSpace<[number, number]>
};

function imageAccessor(image: Image): ImageAccessor {
  const { width } = image;
  const imageData = getImageData(image);
  const canvasColour = hexToRGB(Preferences.get(P.altpfpBackground)) ?? [
    255, 255, 255
  ];
  return (x, y) => {
    const index = 4 * (y * width + x);
    const data: number[] = Array.prototype.slice.call(
      imageData.data,
      index,
      index + 3
    );
    const alpha = imageData.data[index + 3] / 255;
    if (data.length !== 3) {
      // eslint-disable-next-line no-console
      console.warn(
        `Failed getting image data for index ${index} (data[${imageData.data.length}])`,
        data
      );
      return null;
    }
    data.forEach((comp, i) => {
      data[i] = alpha * comp + (1 - alpha) * canvasColour[i];
    });
    return data as RGB;
  };
}

export function sampleImage(
  image: Image,
  { interpolator, width, height }: SamplingOptions
): RGB[] {
  const sampledImage: RGB[] = Array.from({ length: width * height });
  const accessor = imageAccessor(image);
  // fitting a rectangle into another rectangle
  const scale = Math.min(image.height / height, image.width / width);
  const [sampledWidth, sampledHeight] = [scale * width, scale * height];
  const x0 = (image.width - sampledWidth) / 2;
  const y0 = (image.height - sampledHeight) / 2;
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const rgb = interpolator(
        accessor,
        [x0 + x * scale, y0 + y * scale],
        [0, 0]
      );
      // todo: add more details to message
      // eslint-disable-next-line no-console
      if (rgb === null) console.warn(`Interpolation failed at ${x}, ${y}`);
      sampledImage[y * width + x] = rgb ?? [0, 0, 0];
    }
  }
  return sampledImage;
}
