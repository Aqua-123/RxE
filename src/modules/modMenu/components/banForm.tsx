/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from "react";

export interface BanFormProps {
  reasons: {
    value: string;
    label: string;
  }[];
}

interface BanFormState {
  duration: string;
  reason: string;
  showCustomReason: boolean;
}

const durationList = [
  ["7", "7 seconds (warning)"],
  ["120", "2 minutes"],
  ["300", "5 minutes"],
  ["600", "10 minutes"],
  ["900", "15 minutes"],
  ["1800", "30 minutes"],
  ["3600", "1 hour"],
  ["10800", "3 hours"],
  ["21600", "6 hours"],
  ["43200", "12 hours"],
  ["86400", "1 day"],
  ["259200", "3 days"],
  // ["604800", "1 week"],
  ["31556952", "Permanently"]
];

export const reasonList = [
  { value: "spam", label: "Multiple spam attempts in chat" },
  {
    value: "harassment",
    label: "Harassment, threats and/or abuse towards a user or group of users"
  },
  {
    value: "sexual_harassment",
    label: "Sexually explicit remarks towards a user or group of users"
  },
  {
    value: "racism",
    label: "Spreading derogatory words/racism/bigotry in chat"
  },
  {
    value: "csa",
    label: "Distribution/Promotion of illegal content involving CP/CSA"
  },
  {
    value: "english",
    label: "Please keep group chat in English"
  },
  {
    value: "socials",
    label: "Promotion of external social media"
  },
  {
    value: "inappropriate_content",
    label: "Distribution/Promotion of illegal/explicit content"
  },
  {
    value: "underage",
    label:
      "Feel free to join our Group Chat, but you must be 18+ in order to use 1-on-1 Text Chat/Video Chat"
  },
  {
    value: "nudity",
    label:
      "Please don't start your video with nudity or sexual content, not everyone wants to see that"
  },
  {
    value: "warn_perm",
    label:
      "Your account is under review for potential illegal actions. Please check again or refer to a mod for an update on your account status"
  },
  { value: "other", label: "Other" }
];

export class BanForm extends Component<BanFormProps, BanFormState> {
  constructor(props: BanFormProps) {
    super(props);
    this.state = {
      duration: "120",
      reason: props.reasons[0].label,
      showCustomReason: false
    };
  }

  handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ duration: e.target.value });
  };

  handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedReason = e.target.value;
    this.setState({ reason: selectedReason });
    if (selectedReason === "Other") {
      this.setState({ showCustomReason: true, reason: "" });
    } else {
      this.setState({ showCustomReason: false });
    }
  };

  handleOtherReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ reason: e.target.value });
  };

  handleEditReasonToggle = () => {
    this.setState((prevState) => ({
      showCustomReason: !prevState.showCustomReason
    }));
  };

  // eslint-disable-next-line class-methods-use-this
  renderDurationOption(value: string, label: string) {
    return <option value={value}>{label}</option>;
  }

  // eslint-disable-next-line class-methods-use-this
  renderReasonOption(reasonObj: { value: string; label: string }) {
    return (
      <option key={reasonObj.value} value={reasonObj.label}>
        {reasonObj.label}
      </option>
    );
  }

  render() {
    const { duration, reason, showCustomReason } = this.state;
    const { reasons } = this.props;

    return (
      <div>
        <div>ISSUE BAN</div>
        <br />
        <br />
        <div className="m1">duration</div>
        <label className="ui-select" htmlFor="duration">
          <select
            name="duration"
            id="duration"
            value={duration}
            onChange={this.handleDurationChange}
          >
            {durationList.map(([value, label]) =>
              this.renderDurationOption(value, label)
            )}
          </select>
        </label>
        <div className="m1">reason</div>
        {showCustomReason ? (
          <input
            type="text"
            id="reason"
            className="ui-input"
            value={reason}
            onChange={this.handleOtherReasonChange}
          />
        ) : (
          <label className="ui-select" htmlFor="reason">
            <select
              name="reason"
              id="reason"
              value={reason}
              onChange={this.handleReasonChange}
            >
              {reasons.map((reasonObj) => this.renderReasonOption(reasonObj))}
            </select>
          </label>
        )}
        <div className="m1">
          <input
            type="checkbox"
            id="edit-reason-toggle"
            checked={showCustomReason}
            onChange={this.handleEditReasonToggle}
          />
          <label htmlFor="edit-reason-toggle">Edit Reason</label>
        </div>
      </div>
    );
  }
}

export function initBanForm() {
  ModPanel.prototype.issue_ban_menu = function issueMenu() {
    return <BanForm reasons={reasonList} />;
  };
}
