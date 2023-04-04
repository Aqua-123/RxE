/* eslint-disable react/no-this-in-sfc */
import React from "react";
import styles from "./style.scss";
import { loadCSS } from "~src/utils";
import { hideUser } from "./ws";
import { Preferences, P } from "~src/preferences";
import { spamModOverride } from "./spamModeration";
import { BanForm } from "./banForm";

export function setModIconCount(count: number) {
  const countOverlay = document.querySelector(
    ".notification-count-overlay"
  ) as HTMLElement;
  if (countOverlay) countOverlay.textContent = String(count);
  if (count > 0) {
    countOverlay.style.display = "inline";
  } else {
    countOverlay.style.display = "none";
  }
}

function stateUpdate(this: PictureModeration, id: Number) {
  const newListOfPics = this.state.picture_moderations.filter(
    (t) => t.id !== id
  );
  const state = {
    picture_moderations: newListOfPics
  };
  setModIconCount(newListOfPics.length);
  this.setState(state);
}

const reasons = [
  { value: "spam", label: "Multiple spam attempts in chat" },
  {
    value: "harassment",
    label: "Harassment, threats and/or abuse towards an user or group of users"
  },
  {
    value: "csa",
    label: "Distribution/Promotion of illegal content involving CP/CSA"
  },
  {
    value: "inappropriate_content",
    label: "Distribution/Promotion of illegal/explicit content"
  },
  {
    value: "sexual_harassment",
    label: "Sexually explicit remarks towards an user or group of users"
  },
  { value: "other", label: "Other" }
];

export function modFunctionInit() {
  loadCSS(styles);
  spamModOverride();
  if (Preferences.get(P.hideFromGc) && App.user.mod) hideUser();
  ModPanel.prototype.issue_ban_menu = function issueMenu() {
    return <BanForm reasons={reasons} />;
  };
  PictureModeration.prototype.approve = function pmApprove(id: Number) {
    $.ajax({
      type: "POST",
      url: `/picture_moderations/${id}/approve`,
      dataType: "json",
      success: stateUpdate.bind(this, id)
    });
  };
  PictureModeration.prototype.delete = function pmDelete(id: Number) {
    $.ajax({
      type: "DELETE",
      url: `/picture_moderations/${id}`,
      dataType: "json",
      success: stateUpdate.bind(this, id)
    });
  };
  PictureModerationUnit.prototype.render = function pmuRender() {
    const { data } = this.props;
    return React.createElement(
      "div",
      {
        className: "dashboard-button animated",
        style: {
          paddingTop: "30px",
          height: "400px"
        }
      },
      React.createElement("img", {
        src: data.image_url,
        className: "mod-approval-pic"
      }),
      React.createElement("h2", null, `${data.display_name}(${data.username})`),
      React.createElement(
        "button",
        {
          className: "ui-button-match-mega gold-button",
          onClick: this.approve,
          type: "button"
        },
        "Approve"
      ),
      React.createElement(
        "button",
        {
          className: "ui-button-match-mega red-button",
          onClick: this.delete,
          type: "button"
        },
        "Reject"
      )
    );
  };
}
