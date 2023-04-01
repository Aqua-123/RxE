/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from "react";

export function spamModOverride() {
  SpamModerationUnit.prototype.render = function smuRender() {
    const { data } = this.props;
    let time = jQuery.timeago(new Date(data.latest_message));
    if (time !== "Now") {
      time += " ago";
    }

    return (
      <div
        className="dashboard-button animated"
        style={{
          paddingTop: "30px",
          paddingBottom: "30px",
          minHeight: "330px",
          height: "max-content"
        }}
      >
        <div className="room-component-message-left">
          <img
            onMouseDown={(e) =>
              /* @ts-ignore */
              UserViewGenerator.generate({ event: e, user: data })
            }
            src={data.display_picture}
            alt=""
            className="room-component-message-avatar"
          />
        </div>
        <div className="spam-user-info">
          <p style={{ paddingBottom: "10px" }}>{data.display_name}</p>
          <p>Username: {data.username}</p>
          <p>Gold: {data.gold ? "Yes" : "No"}</p>
          <p>Content: {data.content}</p>
          <p>Last message: {time}</p>
          <p>Message count: {data.message_count}</p>
          <p>Ratio of messages: {data.ratio_of_messages}</p>
          <p>IPs used: {data.ips_used}</p>
          <p>Sample IP: {data.ip}</p>
        </div>
      </div>
    );
  };
}
