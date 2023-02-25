import React from "react";
import css from "./style.scss";
import { loadCSS } from "~src/utils";
import { upload } from "~src/modules/chat/chat-image/image-process";
import { imageFromURL } from "../chat-image/imgur";
import { P } from "~src/preferences";

const shouldSend = (
  event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
) => {
  if (event.key !== "Enter" || event.shiftKey) return false;
  return true;
};

async function processPaste(item: DataTransferItem) {
  if (item.kind !== "file") return;
  const file = item.getAsFile();
  // eslint-disable-next-line no-alert
  if (!file || !confirm("Are you sure you want to upload this image in chat?"))
    return;
  // convert file to base64
  if (
    App.user.gold &&
    !P.legacyImages &&
    RoomClient?.state.mode !== "channel"
  ) {
    const base64 = String(
      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      })
    );
    RoomClient?.send_picture(base64);
  } else {
    const uploadedimage = await upload(file);
    const image = imageFromURL(uploadedimage.url, true);
    if (image) RoomClient?.sendRitsuPicture?.(image);
  }
}
function onPaste(event: ClipboardEvent) {
  if (!event.clipboardData) return;
  const { items } = event.clipboardData;
  Array.from(items).forEach((item) => {
    processPaste(item);
  });
}
export function multiLineOverride() {
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
    } else if (actionRecall) textarea.val(this.state.last_message!);

    if (text.length === 0 || !text.includes("\n"))
      textarea.css("height", "34px");
    // Dynamically changes the height of the textarea
    // ps dont remove it straw :)
    const textArea = textarea.get(0) as HTMLTextAreaElement;
    textArea.style.height = `${textArea.scrollHeight}px`;

    document.onpaste = onPaste;
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
    const text = encodeURIComponent(`${inputElement.val()}`);

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
      url: `/comments_create?id=${micropostId}&content=${text}`,
      dataType: "json",
      success: prependComment.bind(this)
    });
  };

  function prependMicropost(this: Microposts, post: EmeraldMicropost) {
    const data = this.state.data || { microposts: [] };
    this.setState({
      data: { microposts: [post.micropost.id, ...data.microposts] }
    });
  }

  Microposts.prototype.micropost_input = function micropostInput(event) {
    const inputElement = event.target;
    if (inputElement instanceof HTMLInputElement) return;

    const inputElementJQ = $(event.target);
    const text = encodeURIComponent(`${inputElementJQ.val()}`);

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
      url: `/microposts_create?id=${wallId}&content=${text}`,
      dataType: "json",
      success: prependMicropost.bind(this)
    });
  };

  Microposts.prototype.render = function render() {
    const microposts = this.state.data ? this.state.data.microposts : [];
    const micropostElement = React.createElement(
      "div",
      { className: "user-microposts" },
      microposts.map((id) =>
        React.createElement(Micropost, {
          key: id,
          data: { id }
        })
      )
    );
    const inputElement = React.createElement(
      "div",
      { className: "user-micropost-input-background" },
      React.createElement("textarea", {
        className: "user-micropost-input",
        onKeyDown: this.micropost_input.bind(this),
        id: "micropost-input",
        placeholder: "Say Something..."
      })
    );
    return React.createElement(
      "span",
      { key: this.props.data.wall_id },
      inputElement,
      micropostElement
    );
  };
  function writeComment(this: any) {
    if (!this.state.reply) return null;
    return React.createElement(
      "div",
      { className: "animated zoomIn user-comment-input-background" },
      React.createElement("textarea", {
        className: "user-comment-input",
        onKeyDown: this.comment_input.bind(this),
        id: "comment-input",
        placeholder: "Comment..."
      })
    );
  }
  Micropost.prototype.write_comment = writeComment;
  (Comment.prototype as any as __Comment).write_comment = writeComment;
}
