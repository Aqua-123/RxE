import { parseImage, FORMATS } from "../altpfp/formats";
import { setBioImage } from "../altpfp/bio-image";
import { P, Preferences } from "~src/preferences";

export function albumFunctionality() {
  PictureAlbum.prototype.set_display_picture = function sdp(picture) {
    const { url } = picture;
    const { user } = App;
    const parsed = parseImage(url, FORMATS.IMGUR);
    if (!parsed) return;
    setBioImage(user, parsed);
    MenuReactMicro.close();
    this.forceUpdate();
    UserProfileReact?.load(user.id);
  };

  PictureAlbum.prototype.delete_picture = function deletePic(picture) {
    const { user } = App;
    const url = parseImage(picture.url, FORMATS.IMGUR);
    const album = Preferences.get(P.imgurPfpAlbum);
    if (url === null) return;
    if (!album.includes(url)) return;
    const newalbum = [...album];
    newalbum.splice(newalbum.indexOf(url), 1);
    Preferences.set(P.imgurPfpAlbum, newalbum);
    MenuReactMicro.close();
    UserProfileReact?.load(user.id);
  };
}
