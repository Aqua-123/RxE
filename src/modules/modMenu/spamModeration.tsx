/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from "react";

function spamModUnits(
  spamModList: spamModData[],
  reportLogList: reportLogData[]
) {
  let reportIds: number[] = [];
  if (reportLogList) reportIds = reportLogList.map((item) => item.id);
  return spamModList.map((e) => (
    <SpamModerationUnit
      key={`spam_moderation_${e.id}_${e.content}`}
      has_report={reportIds.includes(e.id)}
      data={e}
    />
  ));
}

export function spamModOverride() {
  SpamModeration.prototype.fetch_reports = function smFR() {
    $.ajax({
      type: "GET",
      url: "/report_logs_moderation",
      dataType: "json",
      success: function (this: SpamModeration, e: reportLogData[]) {
        const state = {
          report_logs: e
        };
        this.setState(state);
      }.bind(this)
    });
  };

  SpamModeration.prototype.componentDidMount = function smCDM() {
    this.fetch_data();
    this.fetch_reports();
  };

  SpamModeration.prototype.render = function smFR() {
    const spamModerationState = this.state.spam_moderations;
    const reportLogState = this.state.report_logs;

    return (
      <div className="dashboard-background">
        <div className="dashboard-container">
          <div className="meet-cards-container video-moderation">
            {spamModUnits(spamModerationState, reportLogState)}
          </div>
        </div>
      </div>
    );
  };

  SpamModerationUnit.prototype.render = function smuRender() {
    const { data } = this.props;
    const hasReport = this.props.has_report;
    let time = jQuery.timeago(new Date(data.latest_message));
    if (time !== "Now") {
      time += " ago";
    }
    return (
      <div
        className="dashboard-button animated"
        style={{
          paddingTop: "30px",
          minHeight: "330px",
          border: hasReport ? "4px solid red" : ""
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
          <p>Name: {data.display_name}</p>
          <p>Username: {data.username}</p>
          <p>Gold: {data.gold ? "Yes" : "No"}</p>
          <p>Content: {data.content}</p>
          <p>Last message: {time}</p>
          <p>Message count: {data.message_count}</p>
        </div>
      </div>
    );
  };
}
