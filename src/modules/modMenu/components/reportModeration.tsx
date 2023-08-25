/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
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
      success: function rmSuccess(this: ReportLogModeration, e: spamModData[]) {
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

    const handleSortClick = function hSC(this: ReportLogModeration) {
      this.setState({
        sort: this.state.sort === "max_count" ? "most_recent" : "max_count"
      });
      this.fetch_data();
    }.bind(this);

    return (
      <div className="dashboard-background">
        <div className="dashboard-container">
          <div className="meet-cards-container video-moderation">
            <div className="video-moderation-controls-container">
              {/* eslint-disable-next-line react/button-has-type */}
              <button
                className="ui-button-match-mega primary-button"
                onClick={handleSortClick}
              >
                Sorted By{" "}
                {this.state.sort === "max_count" ? "Max Count" : "Most Recent"}
              </button>
            </div>
          </div>
          <div className="meet-cards-container report-logs-container">
            {reportLogUnits(spamModerationState, reportLogState)}
          </div>
        </div>
      </div>
    );
  };

  ReportLogModerationUnit.prototype.renderContent = function rC(e) {
    if (e.image) {
      return <img alt="" src={e.image} />;
    }

    if (e.message && typeof e.message === "string") {
      return (
        <p className="messages">
          Messages:
          <br /> {e.message}
        </p>
      );
    }

    return null;
  };

  ReportLogModerationUnit.prototype.render = function rlmu() {
    const { data } = this.props;
    const selectedReportLog = data.report_logs[this.state.selected];
    const hasReport = this.props.has_report;
    const reasonElement = () => {
      const { reason } = selectedReportLog;
      if (!reason) return null;
      return <div className="reason">Reason: {selectedReportLog.reason}</div>;
    };

    return (
      <div
        className="dashboard-button animated"
        style={{ paddingTop: "30px", border: hasReport ? "4px solid red" : "" }}
      >
        <div className="room-component-message-left">
          <img
            onMouseDown={(t) =>
              // @ts-ignore
              UserViewGenerator.generate({ event: t, user: data })
            }
            src={data.display_picture}
            alt=""
            className="room-component-message-avatar"
          />
        </div>
        <div className="info">
          <p>
            {data.display_name}
            <span style={{ color: "gold" }}>{data.gold ? " (G)" : ""}</span>
          </p>
        </div>
        <div className="report-log-container">
          <div
            className="grid-item arrow"
            style={{ marginLeft: "-15px" }}
            title="Previous"
            onClick={this.previous}
          >
            <span className="material-icons">arrow_back</span>
          </div>
          <div className="grid-item weight">
            {reasonElement()}
            <div className="reason">Username: {selectedReportLog.username}</div>
            {this.renderContent(selectedReportLog)}
          </div>
          <div
            className="grid-item arrow"
            style={{ marginRight: "-20px" }}
            title="Next"
            onClick={this.next}
          >
            <span className="material-icons">arrow_forward</span>
          </div>
        </div>
        <div>
          {this.state.selected + 1} out of {data.report_logs.length}
        </div>
      </div>
    );
  };
}
