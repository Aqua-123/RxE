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
  // ["7", "7 seconds (warning)"],
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
  ["172800", "2 days"],
  ["259200", "3 days"],
  // ["604800", "1 week"],
  ["1209600", "2 weeks"],
  ["31556952", "1 year"],
  ["315569520", "Permanently"]
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
    value: "csa",
    label: "Distribution/Promotion of illegal content involving CP/CSA"
  },
  {
    value: "inappropriate_content",
    label: "Distribution/Promotion of illegal/explicit content"
  },
  {
    value: "underage",
    label: "You must be 18+ in order to use 1-on-1 chat"
  },
  {
    value: "racism",
    label: "Spreading derogatory words/racism/bigotry in chat"
  },
  {
    value: "impersonation",
    label: "Impersonation of users or moderators"
  },
  {
    value: "doxxing",
    label: "Doxxing (sharing personal/private information of others)"
  },
  {
    value: "self_harm_threats",
    label: "Threats of self-harm or encouragement of self-harm"
  },
  {
    value: "phishing_scamming",
    label: "Phishing attempts or scamming other users"
  },
  {
    value: "bots_automation_abuse",
    label: "Use of automated bots or scripts to spam or manipulate chat"
  },
  {
    value: "illegal_activity",
    label: "Encouraging or facilitating illegal activity"
  },
  {
    value: "trolling_disruption",
    label: "Excessive trolling or disruptive behavior"
  },
  {
    value: "exploiting_vulnerabilities",
    label:
      "Exploitation of platform vulnerabilities (e.g., bypassing bans, exploiting bugs)"
  },
  {
    value: "soliciting_services",
    label:
      "Advertising, promotion, or selling services/content (e.g., external platforms) is not allowed on Emerald Chat"
  },
  {
    value: "non_english_group_chats",
    label:
      "Group chats should be in English to ensure inclusivity and moderation effectiveness"
  },
  { value: "other", label: "other" }
];

const prettyMap: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  sexual_harassment: "Sexual Harassment",
  csa: "CSA",
  inappropriate_content: "Inappropriate Content",
  underage: "Underage",
  racism: "Racism",
  impersonation: "Impersonation",
  doxxing: "Doxxing",
  self_harm_threats: "Self-Harm Threats",
  phishing_scamming: "Phishing/Scamming",
  bots_automation_abuse: "Bots/Automation Abuse",
  illegal_activity: "Illegal Activity",
  trolling_disruption: "Trolling/Disruption",
  exploiting_vulnerabilities: "Exploiting Vulnerabilities",
  soliciting_services: "Soliciting or Exchanging Services",
  non_english_group_chats: "Non-English in Group Chats",
  other: "Other"
};

export class BanForm extends Component<BanFormProps, BanFormState> {
  private reasonInputRef: React.RefObject<HTMLInputElement>;

  constructor(props: BanFormProps) {
    super(props);
    this.state = {
      duration: "120",
      reason: props.reasons[0].label,
      showCustomReason: false
    };
    this.reasonInputRef = React.createRef();
  }

  handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ duration: e.target.value });
  };

  handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedReason = e.target.value;
    this.setState({ reason: selectedReason });
    const otherOption = reasonList.find((r) => r.value === "other");
    if (selectedReason === otherOption?.label) {
      this.setState({ showCustomReason: true, reason: "" });
    } else {
      this.setState({ showCustomReason: false });
    }
  };

  handleOtherReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ reason: e.target.value });
  };

  handleEditReasonToggle = () => {
    this.setState((prevState) => {
      const newShowCustomReason = !prevState.showCustomReason;
      setTimeout(() => {
        if (newShowCustomReason && this.reasonInputRef.current) {
          this.reasonInputRef.current.focus();
          this.reasonInputRef.current.select();
        }
      }, 0);
      return {
        showCustomReason: newShowCustomReason
      };
    });
  };

  // eslint-disable-next-line class-methods-use-this
  renderDurationOption(value: string, label: string) {
    return <option value={value}>{label}</option>;
  }

  // eslint-disable-next-line class-methods-use-this
  renderReasonOption(reasonObj: { value: string; label: string }) {
    const displayText = prettyMap[reasonObj.value] || reasonObj.value;
    return (
      <option key={reasonObj.value} value={reasonObj.label}>
        {displayText}
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
            ref={this.reasonInputRef}
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
