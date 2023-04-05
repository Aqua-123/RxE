/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable camelcase */
import React from "react";

function reportLogUnits(
  spamModList: spamModData[],
  reportLogList: reportLogData[]
) {
  let spamIds: number[] = [];
  if (spamModList) spamIds = spamModList.map((item) => item.id);
  return reportLogList.map((e) => (
    <ReportLogModerationUnit
      key={`spam_moderation_${e.id}`}
      has_report={spamIds.includes(e.id)}
      data={e}
    />
  ));
}
export function reportModOverride() {
  ReportLogModeration.prototype.fetch_spam = function rlmFR() {
    $.ajax({
      type: "GET",
      url: "/spam_moderation",
      dataType: "json",
      success: function (this: ReportLogModeration, e: spamModData[]) {
        const state = {
          spam_moderations: e
        };
        this.setState(state);
      }.bind(this)
    });
  };

  ReportLogModeration.prototype.componentDidMount = function rlmCDM() {
    this.fetch_data();
    this.fetch_spam();
  };

  ReportLogModeration.prototype.render = function rlmFR() {
    const spamModerationState = this.state.spam_moderations;
    const reportLogState = this.state.reeport_logs;

    return (
      <div className="dashboard-background">
        <div className="dashboard-container">
          <div className="meet-cards-container video-moderation">
            {reportLogUnits(spamModerationState, reportLogState)}
          </div>
        </div>
      </div>
    );
  };

  ReportLogModerationUnit.prototype.render = function rlmu() {
    const { data } = this.props;
    const hasReport = this.props.has_report;
    return (
      <div
        className="dashboard-button animated"
        style={{
          paddingTop: "30px",
          cursor: "auto",
          border: hasReport ? "4px solid red" : ""
        }}
      >
        <div className="room-component-message-left">
          <img
            alt=""
            onMouseDown={(e) =>
              /* @ts-ignore */
              UserViewGenerator.generate({ event: e, user: data })
            }
            src={data.display_picture}
            className="room-component-message-avatar"
          />
        </div>
        <div className="spam-user-info">
          <p>Username: {data.username}</p>
          <p>Users Reporting count: {data.people_reporting}</p>
        </div>
      </div>
    );
  };
}
