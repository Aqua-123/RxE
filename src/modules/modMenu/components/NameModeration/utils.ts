/* eslint-disable camelcase */
import { Preferences, P } from "~src/preferences";
import { getAction } from "../utils";

export function setNameModIconCount(count: number) {
  const countOverlay = document.querySelector(
    ".name-count-overlay"
  ) as HTMLElement;
  if (countOverlay) countOverlay.textContent = String(count);
  if (count > 0) {
    countOverlay.style.display = "inline";
  } else {
    countOverlay.style.display = "none";
  }
}

export function updateNameRecPref(name: string, action: string) {
  const currentRecords = Preferences.get(P.nameModRecords);
  const matchingRecord = currentRecords.find((record) => record.name === name);
  if (matchingRecord) {
    if (action === "approve") {
      matchingRecord.approvals += 1;
    } else if (action === "reject") {
      matchingRecord.rejections += 1;
    }
    Preferences.set(P.nameModRecords, currentRecords);
  } else {
    const newRecord = {
      name,
      approvals: action === "approve" ? 1 : 0,
      rejections: action === "reject" ? 1 : 0
    };
    const updatedRecords = [...currentRecords, newRecord];
    Preferences.set(P.nameModRecords, updatedRecords);
  }
}

function deleteConflicts(conflictedNames: string[]) {
  const currentRecords = Preferences.get(P.nameModRecords);
  const newRecords = currentRecords.filter(
    (record) => !conflictedNames.includes(record.name)
  );
  Preferences.set(P.nameModRecords, newRecords);
}

export async function nameModFetchHandler(
  modNames: ModName[],
  approveFunc: (id: number) => void,
  deleteFunc: (id: number) => void
) {
  // Get recorded hashes from preferences
  const recorededNames = Preferences.get(P.nameModRecords);

  // Filter mod pictures without a matching recorded hash
  const filteredModNames = modNames.filter(({ new_display_name }) =>
    recorededNames.some(({ name }) => name === new_display_name)
  );

  // Get actions for filtered mod pictures
  const actions = filteredModNames.map(({ id, new_display_name }) => {
    const { approvals = 0, rejections = 0 } =
      recorededNames.find(({ name }) => name === new_display_name) || {};
    const action = getAction(approvals, rejections);
    return { id, action, name: new_display_name };
  });

  // Filter out actions with "standby" status and add conflicted hashes to array
  const conflictedNames: string[] = [];
  const approvedIds: number[] = [];
  const rejectedIds: number[] = [];

  actions.forEach(({ id, action, name }) => {
    if (!name) return;
    if (action === "conflicted") {
      conflictedNames.push(name);
    } else if (action === "approve") {
      approvedIds.push(id);
      updateNameRecPref(name, "approve");
    } else if (action === "reject") {
      rejectedIds.push(id);
      updateNameRecPref(name, "reject");
    }
  });

  // Call approveFunc and deleteFunc for approved and rejected pictures
  approvedIds.forEach((id) => approveFunc(id));
  rejectedIds.forEach((id) => deleteFunc(id));

  deleteConflicts(conflictedNames);

  // Return mod pictures that don't have a matching recorded hash
  const unmatchedModNames = modNames.filter(
    (modName) =>
      !approvedIds.includes(modName.id) &&
      !rejectedIds.includes(modName.id) &&
      !conflictedNames.includes(modName.new_display_name)
  );

  return unmatchedModNames;
}

export function clearNameModCache() {
  Preferences.set(P.nameModRecords, []);
  alert("Cache for display name moderation has been cleared");
}
