import React from "react";
import { wrapPartitions } from "~src/utils";
import { wrapLinks } from "./messagelinks";

function makeMaterialIcon(match: string) {
  const className = "material-icons material-icons-inline";
  const title = match.toLocaleLowerCase();
  return <span {...{ className, title }}>{match.slice(2, -1)}</span>;
}

function wrapMaterialIcons<T>(text: string, restWrapper: StringWrapper<T>) {
  return wrapPartitions(text, /m:[-_a-z]+:/gi, makeMaterialIcon, restWrapper);
}

function makeLineBreaks({ length }: string) {
  return length > 1 ? [<br />, <br />] : <br />;
}

function wrapLineBreaks<T>(text: string, restWrapper: StringWrapper<T>) {
  const trimmedText = text.replace(/^[\s\n]+|[\s\n]+$/g, "");
  return wrapPartitions(trimmedText, /\n+/g, makeLineBreaks, restWrapper);
}

export function wrapRich<T>(text: string, restWrapper: StringWrapper<T>) {
  return wrapLineBreaks(text, (line) =>
    wrapMaterialIcons(line, (nonIcon) => wrapLinks(nonIcon, restWrapper))
  );
}
