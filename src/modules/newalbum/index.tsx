import React from "react";
import { Spinner } from "~src/components/Spinner";
import { P, Preferences } from "~src/preferences";
import { extractBioImage } from "../altpfp/bio-image";
import { imgurPNG, IMGUR_URL_REGEXP } from "../newsendpics/imgur";
import { albumFunctionality } from "./components";

export function initPictureAlbum() {
  albumFunctionality();
  const paRender = PictureAlbum.prototype.render;
  PictureAlbum.prototype.componentDidMount = function Component() {
    const pAlbum = Preferences.get(P.imgurPfpAlbum);
    if (!this.state.album) {
      this.setState({ pictures_count: pAlbum.length });
    }
    const pictures = pAlbum.map((pic) => {
      let url;
      if (pic.length === 7) url = imgurPNG(pic);
      else url = imgurPNG(pic.substring(1));
      return { url } as EmeraldPictureDetailed;
    });
    this.setState({ pictures, loaded: true });
  };
  PictureAlbum.prototype.render = function render() {
    if (!this.state.loaded) {
      return <Spinner />;
    }
    return paRender.call(this);
  };

  PictureAlbum.prototype.load_pictures =
    PictureAlbum.prototype.componentDidMount;

  PictureAlbum.prototype.load_more_button = function loadMoreButton() {
    return null;
  };

  const paSetState = PictureAlbum.prototype.setState;
  PictureAlbum.prototype.setState = function setState(state) {
    paSetState.call(this, state as any);
  };
}

export function updatePicToAlbum(picString: string) {
  const { id } = App.user;
  let url = extractBioImage(picString);
  const test = picString.match(IMGUR_URL_REGEXP());
  if (!url && !test) return;
  if (!url && test) url = `i${test[1]}`;
  if (!url) return;
  const album = Preferences.get(P.imgurPfpAlbum);
  if (!album || album.includes(url)) return;
  Preferences.set(P.imgurPfpAlbum, [...album, url]);
  UserProfileReact?.load(id);
}
