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

    return (
      <div className="dashboard-button animated" style={{ paddingTop: "30px" }}>
        <div className="room-component-message-left">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <img
            onMouseDown={openProfilePopup}
            src={data.display_picture}
            alt=""
            className="room-component-message-avatar"
          />
        </div>
        <p>{data.display_name + (data.gold ? "(G)" : "")}</p>
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
            className="grid-item"
            alt=""
            src={data.images[this.state.imageId]}
            onMouseDown={() => openPicture(data.images[this.state.imageId])}
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
          {this.state.imageId + 1} out of {data.images.length}
        </div>
        <button
          className="ui-button-match-mega gold-button"
          type="button"
          onClick={this.delete}
        >
          Delete
        </button>
      </div>
    );
  };
}
