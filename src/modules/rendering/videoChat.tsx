/* eslint-disable jsx-a11y/media-has-caption */
import React from "react";

export function fixLocalVideo() {
  RightComponentVideo.prototype.render = function rcvRender() {
    return (
      <div className="room-component-video-container " id="match-video">
        <div
          className="room-component-video room-component-video-partner"
          id="remoteVideos"
        />
        <div className="room-component-video room-component-video-local">
          <video id="localVideo" playsInline autoPlay />
        </div>
      </div>
    );
  };
}
export function fixRemoteVideo() {
  const videoElements = document.querySelectorAll("video");
  videoElements.forEach((element) => {
    if (element.id && element.id.includes("incoming")) {
      element.setAttribute("playsInline", "true");
      element.setAttribute("autoPlay", "true");
    }
  });
}
