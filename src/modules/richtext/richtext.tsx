/* eslint-disable prettier/prettier */
import React from "react";
import { wrapPartitions } from "~src/utils";
import { wrapLinks } from "./messagelinks";

function wrapMaterialIcons<T>(text: string, restWrapper: StringWrapper<T>) {
    return wrapPartitions(text, /m:[-_a-z]+:/gi, (match) =>
    // todo: move style to class
    (
        <span
            className="material-icons material-icons-inline"
            title={match.toLocaleLowerCase()}
        >{match.slice(2, -1)}</span>
    ), restWrapper);
}

function wrapLineBreaks<T>(text: string, restWrapper: StringWrapper<T>) {
    return wrapPartitions(text, /\n+/g,
        ({ length }) =>
            length > 1
                ? [<br />, <br />]
                : <br />,
        restWrapper);
}

export function wrapRich<T>(text: string, restWrapper: StringWrapper<T>) {
    return wrapLineBreaks(text, (line) =>
        wrapMaterialIcons(
            line, (nonIcon) => wrapLinks(nonIcon, restWrapper)
        )
    );
}
