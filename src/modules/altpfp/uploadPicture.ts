/* eslint-disable no-alert */
import { firstSuccessAsync } from "~src/utils";
import { setBioImage } from "./bio-image";
import { interpolation } from "./interpolation";
import { FORMATS, compressImage } from "./formats";

const noFile = () => alert("No file uploaded.");
const notImage = () =>
  alert("File is not an image or its format is not supported.");

export const DRAGNDROP_FORMAT = FORMATS.FORMAT0;

// todo: Move interpolation settings into format
async function trySave(
  image: File,
  user: EmeraldUser,
  format: ImageFormatType
) {
  const sizes = [128, 96, 64, 48];
  const toSize = (size: number) => ({
    interpolator: interpolation.none,
    width: size,
    height: size
  });
  const compressed = await firstSuccessAsync<string>(
    sizes.map((size) => () => compressImage(image, format, toSize(size)))
  );
  console.log(`compressed: ${compressed.length} chars`);
  await setBioImage(user, compressed);
}

export async function uploadPicture(
  file: File | undefined,
  user: EmeraldUser,
  format: ImageFormatType
) {
  if (!file) {
    noFile();
    return;
  }

  if (!file.type.startsWith("image")) {
    notImage();
    return;
  }

  try {
    await trySave(file, user, format);
  } catch (error) {
    if (error instanceof Error) alert(error.message);
  }
}
