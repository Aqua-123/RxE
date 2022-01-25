/* eslint-disable prettier/prettier */
import React from "react";
import { wrapPartitions } from "~src/utils";

export function wrapMaterialIcons<T>(text: string, restWrapper: StringWrapper<T>, inheritFontSize = false) {
    return wrapPartitions(text, /m:[-_a-z]+:/gi, (match) => {
        console.log(match);
        // todo: move style to class
        return (
            <span
                className="material-icons"
                style={inheritFontSize ? { fontSize: "inherit" } : {}}
            >{match.slice(2, -1)}</span>
        )
    }, restWrapper);
}

export function init() {
    const mpProcess = Message.prototype.process;
    Message.prototype.process = function process(text) {
        return wrapMaterialIcons(text, mpProcess.bind(this));
    };
}
