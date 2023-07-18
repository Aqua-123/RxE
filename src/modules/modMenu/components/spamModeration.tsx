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
      success: function successFunc(this: SpamModeration, e: reportLogData[]) {
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
    this.setState({ sortByMessageCount: false });
  };

  SpamModeration.prototype.sortMessages = function sortMessagesFunc() {
    const { sortByMessageCount } = this.state;
    if (sortByMessageCount) {
      this.sortMessageCount();
    } else this.sortLastMessage();
  };

  SpamModeration.prototype.toggleSort = function ts() {
    this.sortMessages();
    this.setState({ sortByMessageCount: !this.state.sortByMessageCount });
    this.forceUpdate();
  };

  SpamModeration.prototype.render = function smFR() {
    const spamModerationState = this.state.spam_moderations;
    const reportLogState = this.state.report_logs;
    this.sortMessages = this.sortMessages.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    return (
      <div className="dashboard-background">
        <div className="dashboard-container">
          <div className="meet-cards-container video-moderation">
            <button type="button" onClick={this.toggleSort}>
              {this.state.sortByMessageCount
                ? "Sort by message count"
                : "Sort by last message"}
            </button>
            <br />
            <br />
            {spamModUnits(spamModerationState, reportLogState)}
          </div>
        </div>
      </div>
    );
  };

  SpamModeration.prototype.sortMessageCount = function smSMC() {
    const spamModList = this.state.spam_moderations;
    const sortedSpamList = spamModList.sort(
      (a, b) => b.message_count - a.message_count
    );
    this.setState({ spam_moderations: sortedSpamList });
  };
  SpamModeration.prototype.sortLastMessage = function smSMC() {
    const spamModList = this.state.spam_moderations;
    const sortedSpamList = spamModList.sort((a, b) => {
      const dateA = new Date(a.latest_message).getTime();
      const dateB = new Date(b.latest_message).getTime();
      return dateB - dateA;
    });
    this.setState({ spam_moderations: sortedSpamList });
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
          border: hasReport ? "4px solid red" : "",
          background: data.banned ? "#2f0303" : ""
        }}
      >
        <div className="room-component-message-left">
          <div style={{ border: data.gold ? "4px solid blue !important" : "" }}>
            <div>
              {data.gold ? (
                <img
                  src="https://emeraldchat.com/badges/tick.svg"
                  alt=""
                  style={{
                    zIndex: 1,
                    height: "25px",
                    marginBottom: "-20px",
                    marginRight: "-20px"
                  }}
                />
              ) : undefined}
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
          </div>
        </div>
        <div className="spam-user-info">
          <p>Name: {data.display_name}</p>
          <b style={{ display: "flex" }}>
            Content:
            <p style={{ color: "orange", fontWeight: "bold" }}>
              {` ${data.content}`}
            </p>
          </b>
          <p>Last message: {time}</p>
          <p>Message count: {data.message_count}</p>
        </div>
      </div>
    );
  };
}
