import React from "react";

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

export function pictureModerationOverride() {
  PictureModeration.prototype.update = function pmUpdate() {
    setInterval(() => {
      if (!document.body.classList.contains("picModMounted")) return;
      this.fetch();
    }, 15000);
  };

  PictureModeration.prototype.fetch = function pmFetch() {
    $.ajax({
      type: "GET",
      url: "/picture_moderations",
      dataType: "json",
      success: function fetchSuccess(this: PictureModeration, e: any) {
        const state = {
          picture_moderations: e
        };
        this.setState(state);
        setModIconCount(e.length);
      }.bind(this)
    });
  };

  const cdm = PictureModeration.prototype.componentDidMount;
  PictureModeration.prototype.componentDidMount = function newCDM() {
    cdm?.call(this);
    document.body.classList.add("picModMounted");
    this.update();
  };

  PictureModeration.prototype.componentWillUnmount = function pmCWU() {
    document.body.classList.remove("picModMounted");
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
