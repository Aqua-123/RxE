import React from "react";
import css from "./style.scss";
import { loadCSS } from "~src/utils";

const shouldSend = (
  event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  if (event.key !== "Enter" || event.shiftKey) return false;
  return true;
};

export function multiLineOverride() {
  // Allowing shift + enter to move to new line
  loadCSS(css);
  Room.prototype.input = function input(event) {
    const textarea = $(event.target) as JQuery<HTMLTextAreaElement>;

    const text = `${textarea.val()}`;
    const actionRecall = event.key === "ArrowUp" && this.state.last_message;

    if (shouldSend(event)) {
      this.send(text);
      this.setState({ last_message: text });
      textarea.val("");
      textarea.css("height", "34px");
    } else if (actionRecall) {
      textarea.val(this.state.last_message!);
    }

    // reset size if no newlines
    if (!text.includes("\n")) {
      textarea.css("height", "34px");
    }

    RoomClient?.scroll();
    if (shouldSend(event) || actionRecall) event.preventDefault();
    if (!shouldSend(event)) App.room.client.typing();
  };

  function prependComment(this: Micropost, commentData: EmeraldComment) {
    const { data } = this.state;

    if (typeof data === "undefined") return;

    data.comments.unshift(commentData.comment.id);

    this.setState({
      data,
      compact: this.state.compact,
      reply: true
    });
  }

  Micropost.prototype.comment_input = function commentInput(event) {
    if (!shouldSend(event)) return;

    const inputElement = $(event.target);
    const text = `${inputElement.val()}`;

    this.setState({
      data: this.state.data,
      reply: false,
      compact: this.state.compact
    });

    inputElement.val("");
    event.preventDefault();
    inputElement.trigger("blur");
    const micropostId = this.state.data?.micropost.id;
    if (typeof micropostId === "undefined") return;

    $.ajax({
      type: "GET",
      url: `/comments_create?id=${micropostId}&content=${encodeURIComponent(
        text
      )}`,
      dataType: "json",
      success: prependComment.bind(this)
    });
  };

  function prependMicropost(this: Microposts, post: EmeraldMicropost) {
    this.setState({
      data: {
        microposts: [post.micropost.id, ...this.state.data.microposts]
      }
    });
  }

  Microposts.prototype.micropost_input = function micropostInput(event) {
    const inputElement = event.target;
    if (inputElement instanceof HTMLInputElement) return;

    const inputElementJQ = $(event.target);
    const text = `${inputElementJQ.val()}`;

    if (!shouldSend(event)) return;
    /* LEGACY */
    /*
      const t = $("#micropost-picture-hatch").attr("data-micropost-picture");
      const n = () =>
        t !== undefined ? ($("#micropost-picture-hatch").html(""), t) : "";
    */

    inputElementJQ.val("");
    inputElementJQ.trigger("blur");
    event.preventDefault();

    const wallId = this.props.data.wall_id;

    $.ajax({
      type: "GET",
      url: `/microposts_create?id=${wallId}&content=${encodeURIComponent(
        text
      )}`,
      dataType: "json",
      success: prependMicropost.bind(this)
    });
  };

  Microposts.prototype.render = function render() {
    let e: number[] = [];
    if (this.state.data) e = this.state.data.microposts;
    return React.createElement(
      "span",
      {
        key: this.props.data.wall_id
      },
      React.createElement(
        "div",
        {
          className: "user-micropost-input-background"
        },
        React.createElement("textarea", {
          className: "user-micropost-input",
          onKeyDown: this.micropost_input.bind(this),
          id: "micropost-input",
          placeholder: "Say Something..."
        })
      ),
      React.createElement(
        "div",
        {
          className: "user-microposts"
        },
        e.map((f) =>
          React.createElement(Micropost, {
            key: f,
            data: {
              id: f
            }
          })
        )
      )
    );
  };
  function writeComment(this: any) {
    return this.state.reply
      ? React.createElement(
          "div",
          {
            className: "animated zoomIn user-comment-input-background"
          },
          React.createElement("textarea", {
            className: "user-comment-input",
            onKeyDown: this.comment_input.bind(this),
            id: "comment-input",
            placeholder: "Comment..."
          })
        )
      : null;
  }
  Micropost.prototype.write_comment = writeComment;
  (Comment.prototype as any as __Comment).write_comment = writeComment;
}
