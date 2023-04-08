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

export const reasonList = [
  { value: "spam", label: "Multiple spam attempts in chat" },
  {
    value: "harassment",
    label: "Harassment, threats and/or abuse towards an user or group of users"
  },
  {
    value: "sexual_harassment",
    label: "Sexually explicit remarks towards an user or group of users"
  },
  {
    value: "csa",
    label: "Distribution/Promotion of illegal content involving CP/CSA"
  },
  {
    value: "inappropriate_content",
    label: "Distribution/Promotion of illegal/explicit content"
  },
  {
    value: "underage",
    label: "You must be +18 in order to use 1-on-1 chat"
  },
  {
    value: "racism",
    label: "Spreading derogatory words/racism/bigotry in chat"
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
            <option value="120">2 minutes</option>
            <option value="300">5 minutes</option>
            <option value="600">10 minutes</option>
            <option value="900">15 minutes</option>
            <option value="1800">30 minutes</option>
            <option value="3600">1 hour</option>
            <option value="10800">3 hours</option>
            <option value="21600">6 hours</option>
            <option value="43200">12 hours</option>
            <option value="86400">1 day</option>
            {/* <option value="259200">3 days</option> */}
            <option value="31556952">Permanently</option>
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
              {reasons.map((reasonObj) => (
                <option key={reasonObj.value} value={reasonObj.label}>
                  {reasonObj.label}
                </option>
              ))}
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
