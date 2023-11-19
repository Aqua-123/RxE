/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import ReactDOM from "react-dom";

export function videoModerationOverride() {
  VideoModerationUnit.prototype.render = function vmuRender() {
    const { data } = this.props;

    const openPicture = (imageUrl: string) => {
      const element = <Picture data={{ src: imageUrl }} />;
      ReactDOM.render(element, document.getElementById("ui-hatch-2"));
    };

    const openProfilePopup = (event: React.MouseEvent) => {
      // @ts-ignore
      UserViewGenerator.generate({ event, user: data });
    };

    const userThumbnail = data.thumbnail_picture || data.display_picture;
    const currentMod = data.video_moderations[this.state.imageId];
    const isTagged = currentMod.tag_matched ? "tagged" : "";

    const moderationImageClass = `grid-item ${isTagged}`;

    const isGoldUser = data.gold ? "(G)" : "";

    return (
      <div className="dashboard-button animated" style={{ paddingTop: "30px" }}>
        <div className="room-component-message-left">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <img
            onMouseDown={openProfilePopup}
            src={userThumbnail}
            alt=""
            className="room-component-message-avatar"
          />
        </div>
        <p>
          {data.display_name} {isGoldUser}
        </p>
        <div className="images-container">
          <div
            className="grid-item arrow"
            style={{ marginLeft: "-15px" }}
            title="Previous"
            onClick={this.previous}
          >
            <span className="material-icons">arrow_back</span>
          </div>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <img
            className={moderationImageClass}
            src={currentMod.image}
            onClick={() => openPicture(currentMod.image)}
            alt=""
          />
          <div
            className="grid-item arrow"
            style={{ marginRight: "-20px" }}
            title="Next"
            onClick={this.next}
          >
            <span className="material-icons">arrow_forward</span>
          </div>
        </div>
        <div>
          {this.state.imageId + 1} out of {data.video_moderations.length}
        </div>
        <button
          className="ui-button-match-mega primary-button tag-button"
          type="button"
          onClick={() => this.updateTag(currentMod.id, !currentMod.tagged)}
        >
          {currentMod.tagged ? "Remove" : "Add"} Tag
        </button>
        <button
          className="ui-button-match-mega gold-button"
          onClick={this.delete}
          type="button"
        >
          Delete
        </button>
      </div>
    );
  };
}
