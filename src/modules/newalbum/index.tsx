import { P, Preferences } from "~src/preferences";
import { extractBioImage } from "../altpfp/bio-image";
import { imgurPNG, IMGUR_URL_REGEXP } from "../newsendpics/imgur";
import { albumFunctionality } from "./components";

export function initPictureAlbum() {
  albumFunctionality();
  PictureAlbum.prototype.componentDidMount = function Component() {
    const pAlbum = Preferences.get(P.imgurPfpAlbum);
    const pictures = pAlbum.map((pic) => {
      const url = pic.length === 7 ? imgurPNG(pic) : imgurPNG(pic.substring(1));
      return { url } as EmeraldPictureDetailed;
    });
    this.setState({ pictures, loaded: true });
  };
}

export function updatePicToAlbum(picString: string) {
  let url = extractBioImage(picString);
  const test = picString.match(IMGUR_URL_REGEXP());
  if (url?.length !== 7 && test) url = `i${test[1]}`;
  const album = Preferences.get(P.imgurPfpAlbum);
  if (!album || !url || album.includes(url)) return;
  Preferences.set(P.imgurPfpAlbum, [...album, url]);
  UserProfileReact?.load(App.user.id);
}
