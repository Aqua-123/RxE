import React from "react";
import { Spinner } from "~src/components/Spinner";

export function initPictureAlbum() {
  const paRender = PictureAlbum.prototype.render;
  PictureAlbum.prototype.render = function render() {
    if (!this.state.loaded) {
      return <Spinner />;
    }
    return paRender.call(this);
  };

  // Fix "load more" link in profile pictures
  PictureAlbum.prototype.load_pictures = function loadPictures() {
    if (!this.state.album) {
      this.setState({ pictures_count: this.state.pictures.length });
    }
    const load = 7;
    $.ajax({
      type: "GET",
      url: `/pictures_load_more?id=${this.state.album.id}&loaded=${this.state.pictures.length}&load_count=${load}`,
      dataType: "json",
      success: function success(
        this: PictureAlbum,
        e: { pictures: EmeraldPicture[] }
      ) {
        const pictures = this.state.pictures.concat(e.pictures);
        this.setState({
          pictures
        });
      }.bind(this)
    });
  };

  // TODO: Pref check this -- not sure auto-load is what everyone wants

  PictureAlbum.prototype.load_more_button = function loadMoreButton() {
    if (this.state.pictures_count > this.state.pictures.length) {
      return <Spinner />;
    }
    return null;
  };

  const paSetState = PictureAlbum.prototype.setState;
  PictureAlbum.prototype.setState = function setState(state) {
    if (
      state &&
      "pictures" in state &&
      this.state.pictures?.length !== state?.pictures?.length
    ) {
      setTimeout(() => this.load_pictures());
    }
    paSetState.call(this, state as any);
  };
}
