import formatImgur from "./formatImgur";

export const FORMATS: Record<string, ImageFormatType> = {
  IMGUR: "i"
};

export function formatName(format: string): string {
  switch (format) {
    case FORMATS.IMGUR:
      return "imgur";
    default:
      return "unknown";
  }
}

export const imageFormats: Record<ImageFormatType, ImageFormat> = {
  i: formatImgur
};

export async function compressImage(
  image: File,
  format: ImageFormatType,
  options: SamplingOptions
): Promise<string> {
  if (!(format in imageFormats))
    throw new Error(`Format '${format}' not implemented`);
  // Timer would include image loading now
  // console.time("image-compression");
  const compressed = imageFormats[format]
    .compress(image, options)
    .then((data) => format + data);
  // console.timeEnd("image-compression");
  return compressed;
}

export function parseImage(
  fluff: string,
  format: ImageFormatType
): string | null {
  if (!(format in imageFormats))
    throw new Error(`Format '${format}' not implemented`);
  const compressed = imageFormats[format].parse(fluff);
  if (compressed === null) return null;
  return format + compressed;
}

export function unpackImage(compressed: string): string | null {
  const format = compressed[0];
  if (!(format in imageFormats)) {
    console.error(
      `could not unpack image: ${compressed} (unknown format '${format}')`
    );
    return null;
  }
  return imageFormats[format as ImageFormatType].unpack(compressed.slice(1));
}
