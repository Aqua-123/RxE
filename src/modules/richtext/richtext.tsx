import React from "react";
import { wrapPartitions } from "~src/utils";
import { decodeImage, picture } from "../newsendpics/image-process";
import { wrapLinks } from "./messagelinks";

type Wrap = StringWrapper<JSXSingleton>;

const id = (rest: string) => rest;

export function processImage(text: string, restWrapper: Wrap = id) {
  const image = decodeImage(text);
  if (image !== null) return picture(image);
  return restWrapper(text);
}

function makeMaterialIcon(match: string): JSXContent {
  const className = "material-icons material-icons-inline";
  const title = match.toLocaleLowerCase();
  return <span {...{ className, title }}>{match.slice(2, -1)}</span>;
}

function wrapMaterialIcons(text: string, restWrapper: Wrap = id): JSXContent {
  return wrapPartitions(text, /m:[-_a-z]+:/gi, makeMaterialIcon, restWrapper);
}

function makeLineBreaks({ length }: string): JSXContent {
  return length > 1 ? [<br />, <br />] : <br />;
}

function wrapLineBreaks(text: string, restWrapper: Wrap = id): JSXContent {
  const trimmedText = text.replace(/^[\s\n]+|[\s\n]+$/g, "");
  return wrapPartitions(trimmedText, /\n+/g, makeLineBreaks, restWrapper);
}

export function wrapRich(text: string, restWrapper: Wrap = id): JSXContent {
  return wrapLineBreaks(text, (line) =>
    wrapMaterialIcons(line, (nonIcon) => wrapLinks(nonIcon, restWrapper))
  );
}
