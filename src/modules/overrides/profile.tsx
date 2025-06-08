import React from "react";
import ReactDOM from "react-dom";
import { Spinner } from "~src/components/Spinner";
import { stripBiDi, getTimeAgo } from "~src/utils";
/**
 * Apply overrides to the profile and related objects.
 * */
export function profileOverrides() {
  UserViewGenerator.generate = function uvg(e) {
    e.event.preventDefault();
    e.user.display_name = stripBiDi(e.user.display_name);
    const t = e.event.clientX;
    const n = e.event.clientY;
    const r = React.createElement(UserView, {
      data: {
        x: t,
        y: n,
        user: e.user
      }
    });
    ReactDOM.render(r, document.getElementById("ui-hatch-3"));
    if (UserViewReact) UserViewReact.switch(e.user);
  };
  Flair.prototype.render = function render() {
    const {
      data: { flair, string: name },
      onClick
    } = this.props;
    return React.createElement(
      "span",
      {
        className: "user-flair",
        style: flair ?? { color: "" },
        onClick
      },
      name
    );
  };

  UserProfile.prototype.top = function top() {
    return (
      <div className="user-profile-top">
        {this.profile_settings()}
        <div className="user-profile-top-left">
          <div className="user-profile-picture-wrapper">
            {this.profile_picture()}
            {this.online_icon()}
          </div>
        </div>
        <div className="user-profile-top-right">
          <div className="user-profile-header">
            <Flair
              data={{
                string: this.state.data.user.display_name,
                flair: this.state.data.user.flair
              }}
            />
          </div>
          <div className="user-profile-sub">
            #{this.state.data.user.username}
          </div>
          {this.profile_buttons()}
          {/* last seen */}
          <div
            className="user-profile-last-seen"
            style={{
              fontSize: "12px",
              color: "#888",
              marginTop: "8px",
              marginBottom: "8px",
              fontStyle: "italic",
              opacity: 0.8
            }}
          >
            Last seen {getTimeAgo(this.state.data.user.last_logged_in_at)}
          </div>
          <div className="user-profile-tabs">{this.tabs()}</div>
        </div>
      </div>
    );
  };
  UserProfile.prototype.render = function render() {
    const content = this.state.data
      ? [this.top(), this.bottom()]
      : [React.createElement(Spinner)];
    return React.createElement(
      "div",
      { className: "ui-menu-container" },
      React.createElement("div", {
        onMouseDown: this.close.bind(this),
        className: "animated fadeIn ui-bg"
      }),
      React.createElement(
        "div",
        { className: "animated zoomIn user-profile-menu" },
        ...content
      )
    );
  };

  CommentSettings.prototype.authorized = function authorized() {
    const comment = this.props.parent;
    const { micropost_data: micropostData, comment_data: commmentData } =
      comment.state;
    const { wall, current_user: thisUser } = micropostData;
    return (
      thisUser.mod ||
      thisUser.master ||
      (wall != null && commmentData?.user?.id === thisUser.id)
    );
  };
}
