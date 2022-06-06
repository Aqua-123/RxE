import React from "react";
import { Spinner } from "~src/components/Spinner";

/**
 * Apply overrides to the profile and related objects.
 * */
export function profileOverrides() {
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
}