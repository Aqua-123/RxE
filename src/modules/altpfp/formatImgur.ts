import { imgurPNG, upload } from "../newsendpics/imgur";

export const formatImgur: ImageFormat = {
  unpack(compressed) {
    return imgurPNG(compressed);
  },
  async compress(image) {
    const imgurImage = await upload(image);
    return imgurImage.id;
  }
};

export default formatImgur;
