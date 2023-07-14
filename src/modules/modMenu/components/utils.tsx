import React from "react";

interface CheckmarkButtonProps {
  isSelected: boolean;
  onClick: () => void;
}

export function CheckmarkButton(props: CheckmarkButtonProps): JSX.Element {
  const { isSelected, onClick } = props;
  const checkMark = (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ fill: "#fff" }}>
      <path d="M6 11.776l-3.88-3.888-1.12 1.152 5 5 10-10-1.12-1.152-8.88 8.888z" />
    </svg>
  );
  return (
    <button
      className={`checkmark-button${isSelected ? " selected" : ""} `}
      onClick={onClick}
      type="button"
    >
      {isSelected && checkMark}
    </button>
  );
}

export function getAction(approvals: number, rejections: number) {
  if (approvals >= 2 && rejections >= 2) {
    // conflicted, hence record will be cleared from memory to get new actions
    return "conflicted";
  }
  if (approvals >= 2) return "approve";
  if (rejections >= 2) return "reject";
  return "standby";
}

export async function getUserData(id: number) {
  const response = await fetch(`https://emeraldchat.com/profile_json?id=${id}`);
  const data = (await response.json()) as ProfileData;
  return data;
}
