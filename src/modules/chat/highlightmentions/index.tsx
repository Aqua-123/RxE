import React from "react";
import { P, Preferences } from "~src/preferences";
import { wrapStringPartitions } from "~src/utils";

const nameNormalized = () =>
  App.user?.display_name?.replace(/[^\w\s]/g, "")?.trim();

const makeMention = (string: string) =>
  string ? <Flair data={{ string, flair: App.user.flair }} /> : null;

export function init() {
  const mpProcess = Message.prototype.process;
  Message.prototype.process = function process(message: string) {
    const processOld = mpProcess.bind(this);
    const name = nameNormalized();
    if (!name || !Preferences.get(P.highlightMentions))
      return processOld(message);
    const messageContent = wrapStringPartitions(
      message,
      name,
      makeMention,
      (rest) =>
        wrapStringPartitions(
          rest,
          App.user.display_name,
          makeMention,
          processOld
        )
    );
    // return React.createElement("span", null, ...messageContent);
    return messageContent;
  };
}
