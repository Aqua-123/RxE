import React from "react";
import css from "./style.scss";
import { loadCSS } from "~src/utils";

export function multiLineOverride() {
  // Allowing shift + enter to move to new line
  loadCSS(css);
  Room.prototype.input = function input(keyinp) {
    const value = String($(keyinp.target).val());
    if (keyinp.key === "Enter" && !keyinp.shiftKey) {
      this.send(value);
      this.state.last_message = value;
      $(keyinp.target).val("");
      keyinp.preventDefault();
      return;
    }
    // ALlowing up arrow to have last sent message in the textarea
    if (keyinp.key === "ArrowUp" && this.state.last_message) {
      $(keyinp.target).val(this.state.last_message);
      keyinp.preventDefault();
    }
    App.room.client.typing();
  };

  Micropost.prototype.comment_input = function commentInput(e) {
    const text = String($(e.target).val());
    if (e.key === "Enter" && !e.shiftKey) {
      this.setState({
        data: this.state.data,
        reply: !1,
        compact: this.state.compact
      });
      $(e.target).val("");
      e.preventDefault();
      $(e.target).trigger("blur");
      const micropostId = this.state.data?.micropost.id;
      $.ajax({
        type: "GET",
        url: `/comments_create?id=${micropostId}&content=${encodeURIComponent(
          text
        )}`,
        dataType: "json",
        success: function process(this: any, commentObj: EmeraldComment) {
          const { data } = this.state;
          data?.comments.unshift(commentObj.comment.id);
          const state = {
            data,
            compact: this.state.compact,
            reply: !1
          };
          this.setState(state);
        }.bind(this)
      });
    }
  };

  Microposts.prototype.micropost_input = function micropostInput(e) {
    const text = String($(e.target).val());
    (<HTMLInputElement>e.target).style.height = "inherit";
    (<HTMLInputElement>e.target).style.height = `${
      (<HTMLInputElement>e.target).scrollHeight
    }px`;
    if (e.key === "Enter" && !e.shiftKey) {
      const t = $("#micropost-picture-hatch").attr("data-micropost-picture");
      const n = () =>
        t !== undefined ? ($("#micropost-picture-hatch").html(""), t) : "";
      $(e.target).val("");
      $(e.target).trigger("blur");
      e.preventDefault();
      const wallId = this.props.data.wall_id;
      $.ajax({
        type: "GET",
        url: `/microposts_create?id=${wallId}&content=${encodeURIComponent(
          text
        )}&picture=${n()}`,
        dataType: "json",
        success: function process(this: any, post: EmeraldMicropost) {
          let arr = [];
          arr.push(post.micropost.id);
          arr = arr.concat(this.state.data.microposts);
          this.setState({
            data: {
              microposts: arr
            }
          });
        }.bind(this)
      });
    }
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
  Micropost.prototype.write_comment = function writeComment() {
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
  };
  (Comment.prototype as any as __Comment).write_comment =
    function writeComment() {
      return this.state.reply
        ? React.createElement(
            "div",
            {
              className: "animated zoomIn user-comment-input-background"
            },
            React.createElement("textarea", {
              className: "user-comment-input",
              onKeyDown: this.comment_input.bind(this),
              placeholder: "Commment..."
            })
          )
        : null;
    };
}
