/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable camelcase */
import React, { ChangeEvent } from "react";

function reportLogUnits(
  reportLogList: reportLogData[],
  hideReportLog: Function
) {
  return reportLogList.map((e) => (
    <ReportLogModerationUnit
      key={`report_log_${e.id}`}
      data={e}
      hideReportLog={hideReportLog}
    />
  ));
}

export function reportLogOverride() {
  ReportLogModerationUnit.prototype.render = function rlmuRender() {
    const { data } = this.props;
    const reportLog = data.report_logs[this.state.selected];

    return (
      <div className="dashboard-button animated" style={{ paddingTop: "30px" }}>
        <div className="room-component-message-left">
          <img
            onMouseDown={(event) =>
              // @ts-ignore
              UserViewGenerator.generate({ event, user: this.props.data })
            }
            alt=""
            src={data.thumbnail_picture || data.display_picture}
            className="room-component-message-avatar"
          />
          <button
            className="report-log-hide"
            onClick={this.hide}
            title="Click to hide"
            type="button"
          >
            <i className="fa fa-eye fa-lg social" />
          </button>
        </div>
        <div className="info">
          <p>{data.display_name + (data.gold ? "(G)" : "")}</p>
        </div>
        <div className="report-log-container">
          <div
            className="grid-item arrow"
            title="Previous"
            onClick={this.previous}
            role="button"
          >
            {"<"}
          </div>
          <div className="grid-item weight">
            <div className="reason">Reason: {reportLog.reason}</div>
            <div className="reason">
              Username: {reportLog.username || "DELETED USER"}
            </div>
            <div
              className="reason"
              style={{
                color: this.calculate_age(reportLog.created_at).includes("hour")
                  ? "#2f0303"
                  : ""
              }}
            >
              Report Age: {this.calculate_age(reportLog.created_at)}
            </div>
            <div className="reason">
              Reporter Age: {this.calculate_age(reportLog.creator_age)}
            </div>
            {this.renderContent(reportLog)}
          </div>
          <div
            className="grid-item arrow"
            title="Next"
            onClick={this.next}
            role="button"
          >
            {">"}
          </div>
        </div>
        <div>
          {this.state.selected + 1} out of {data.report_logs.length}
        </div>
      </div>
    );
  };

  ReportLogModeration.prototype.componentDidMount = function rlmCDM() {
    this.fetchData();
    this.setState({ sort: "max_count" });
  };

  ReportLogModeration.prototype.fetchData = function rlmFD(
    sort: string | null = null,
    page: number | null = null,
    read: boolean | null = null,
    searchQuery: string | null = null
  ) {
    $.ajax({
      type: "GET",
      url: `/report_logs_moderation?sort=${sort || this.state.sort}&page=${
        page || this.state.page
      }&read=${read || this.state.read}&search=${
        searchQuery || this.state.searchQuery
      }`,
      dataType: "json",
      success: (data: reportLogData[]) => {
        this.setState({ report_logs: data });
      }
    });
  };

  ReportLogModeration.prototype.changeRead = function rlmCR(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    this.setState({ read: event.target.value === "true", page: 1 }, () => {
      this.fetchData();
    });
  };

  ReportLogModeration.prototype.change = function rlmC(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    this.setState({ sort: event.target.value, page: 1 }, () => {
      this.fetchData();
    });
  };

  ReportLogModeration.prototype.handleSearchChange = function rlmHSC(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const query = event.target.value;
    if (query === "") {
      this.setState({
        searchQuery: query
      });
      return;
    }

    this.setState({ searchQuery: query });
  };

  ReportLogModeration.prototype.next = function rlmN() {
    const newPage = this.state.page + 1;
    this.setState({ page: newPage }, () => {
      this.fetchData();
    });
  };

  ReportLogModeration.prototype.previous = function rlmP() {
    const newPage = this.state.page - 1;
    this.setState({ page: newPage }, () => {
      this.fetchData();
    });
  };

  ReportLogModeration.prototype.hideAll = function rlmHA() {
    $.ajax({
      type: "GET",
      url: `/hide?ids=[${this.state.report_logs.map((e) => e.id).join(",")}]`,
      dataType: "json",
      success: () => {
        this.fetchData();
      }
    });
  };

  ReportLogModeration.prototype.render = function rlmR() {
    const reportLogState = this.state.report_logs;
    const searchQuery = this.state.searchQuery || "";
    return (
      <div className="dashboard-background">
        <div className="dashboard-container">
          <div className="meet-cards-container video-moderation">
            <div className="video-moderation-controls-container">
              <div
                className="sort-container"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <span
                    className="m1"
                    style={{
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      marginTop: "10px"
                    }}
                  >
                    Search
                  </span>
                  <input
                    type="text"
                    style={
                      // style it modern
                      {
                        padding: "5px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        marginRight: "10px",
                        marginLeft: "10px"
                      }
                    }
                    placeholder="Search users"
                    value={this.state.searchQuery || ""}
                    onChange={this.handleSearchChange.bind(this)}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    className="m1"
                    style={{
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      marginTop: "10px"
                    }}
                  >
                    Read Status
                  </span>
                  <label className="ui-select" htmlFor="read">
                    <select
                      defaultValue="false"
                      onChange={this.changeRead.bind(this)}
                      name="read"
                      id="read"
                    >
                      <option value="true">Read</option>
                      <option value="false">Unread</option>
                    </select>
                  </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    className="m1"
                    style={{
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      marginTop: "10px"
                    }}
                  >
                    Filter Type
                  </span>

                  <label className="ui-select" htmlFor="sort">
                    <select
                      defaultValue="max_count"
                      onChange={this.change.bind(this)}
                      name="sort"
                      id="sort"
                    >
                      <option value="max_count">Max count</option>
                      <option value="most_recent">Most Recent</option>
                      <option value="all">All</option>
                    </select>
                  </label>
                </div>
                {this.state.sort === "all" && (
                  <button
                    className="ui-button-match-mega primary-button"
                    onClick={this.hideAll.bind(this)}
                    type="button"
                  >
                    Hide All Report Logs
                  </button>
                )}
              </div>
              {this.state.sort === "all" && (
                <div>
                  <button
                    className="ui-button-match-mega primary-button"
                    onClick={this.previous.bind(this)}
                    disabled={this.state.page < 2}
                    type="button"
                  >
                    Previous Page
                  </button>
                  <span>Page {this.state.page}</span>
                  <button
                    className="ui-button-match-mega primary-button"
                    onClick={this.next.bind(this)}
                    type="button"
                  >
                    Next Page
                  </button>
                </div>
              )}
            </div>
            <div className="meet-cards-container report-logs-container">
              {reportLogUnits(
                reportLogState.filter(
                  (e) =>
                    e.display_name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    e.username.toLowerCase().includes(searchQuery.toLowerCase())
                ),
                this.hideReportLog.bind(this)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
}
