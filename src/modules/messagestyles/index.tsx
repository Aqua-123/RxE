/* eslint-disable prettier/prettier */
import React from "react";
import { wrapPartitions } from "~src/utils";

export function init() {
    const mpProcess = Message.prototype.process;
    Message.prototype.process = function process(text) {
        return wrapPartitions(text, /m:[-_a-z]+:/gi, (match) => {
            console.log(match);
            return (
                <span className="material-icons">{match.slice(2, -1)}</span>
            )
        }, mpProcess.bind(this));
    };
}
