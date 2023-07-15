/* eslint-disable react/no-this-in-sfc */
import React from "react";
import ReactDOM from "react-dom";
import { getUserData } from "../utils";

export function videoModerationOverride() {
  VideoModerationUnit.prototype.render = function vmuRender() {
    const { data } = this.props;
    const openPicture = function () {
      const element = React.createElement(Picture, {
        data: {
          src: data.image_url
        }
      });
      ReactDOM.render(element, document.getElementById("ui-hatch-2"));
    };
    return (
      <div
        className="dashboard-button animated"
        style={{ height: "410px", paddingTop: "30px" }}
      >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <img alt="" src={data.image_url} onMouseDown={openPicture} />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={async (e) => {
            let user;
            if (!this.state) {
              const userData = await getUserData(data.user_id);
              user = userData.user;
            } else user = this.state.user;
            this.setState({ user });
            UserViewGenerator.generate({ event: e, user });
          }}
        >
          <h2 style={{ whiteSpace: "normal" }}>{data.display_name}</h2>
          <h2 style={{ whiteSpace: "normal" }}>#{data.username}</h2>
        </div>
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
