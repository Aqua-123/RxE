import React from "react";
import { onClickOrKeyUp } from "~src/utils";
import { wrapRich } from "./richtext";

function postContent(text: string, compact: boolean, more: () => void) {
  const maxWords = 36;
  const words = text.split(/ +/g);
  if (words.length > maxWords && compact) {
    const compacted = words.slice(0, maxWords).join(" ");
    return (
      <span>
        {wrapRich(compacted)}
        {" ..."}
        <span className="user-micropost-text-button" {...onClickOrKeyUp(more)}>
          {" More"}
        </span>
      </span>
    );
  }
  return wrapRich(text, Micropost.prototype.youtube_process);
}

function content(this: any) {
  const { data, compact } = this.state;
  if (!data) return null;
  const { content: text } = data.micropost;
  return (
    <div style={{ width: "100%" }}>
      {postContent(text, compact, () => this.more())}
    </div>
  );
}
export function init() {
  Micropost.prototype.content = content;
  (Comment.prototype as any as __Comment).content = content;
}
