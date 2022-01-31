import React from "react";
import { onClickOrKeyUp } from "~src/utils";
import { wrapRich } from "./richtext";

export function init() {
  Micropost.prototype.content = function content() {
    const { data, compact } = this.state;
    if (!data) return null;
    const { content: text } = data.micropost;
    const maxWords = 36;
    const words = text.split(/ +/g);
    if (words.length > maxWords && compact) {
      const compacted = words.slice(0, maxWords).join(" ");
      return (
        <span>
          {wrapRich(compacted, (rest) => rest)}
          {" ..."}
          <span
            className="user-micropost-text-button"
            {...onClickOrKeyUp(() => this.more())}
          >
            {" More"}
          </span>
        </span>
      );
    }
    return (
      <div style={{ width: "100%" }}>
        {wrapRich(text, this.youtube_process)}
      </div>
    );
  };
}
