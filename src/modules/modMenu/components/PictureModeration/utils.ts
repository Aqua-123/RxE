import { Preferences, P } from "~src/preferences";
import { getImageBlobFromUrl, hashBlob } from "~src/utils";
import { getAction } from "../utils";

export function setModIconCount(count: number) {
  const countOverlay = document.querySelector(
    ".notification-count-overlay"
  ) as HTMLElement;
  if (countOverlay) countOverlay.textContent = String(count);
  if (count > 0) {
    countOverlay.style.display = "inline";
  } else {
    countOverlay.style.display = "none";
  }
}

export function updatePicHashListPref(hash: string, action: string) {
  const currentRecords = Preferences.get(P.picModHashes);
  const matchingRecord = currentRecords.find((record) => record.hash === hash);
  if (matchingRecord) {
    if (action === "approve") {
      matchingRecord.approvals += 1;
    } else if (action === "reject") {
      matchingRecord.rejections += 1;
    }
    Preferences.set(P.picModHashes, currentRecords);
  } else {
    const newRecord = {
      hash,
      approvals: action === "approve" ? 1 : 0,
      rejections: action === "reject" ? 1 : 0
    };
    const updatedRecords = [...currentRecords, newRecord];
    Preferences.set(P.picModHashes, updatedRecords);
  }
}

function deleteConflicts(conflictedHashes: string[]) {
  const currentRecords = Preferences.get(P.picModHashes);
  const newRecords = currentRecords.filter(
    (record) => !conflictedHashes.includes(record.hash)
  );
  Preferences.set(P.picModHashes, newRecords);
}

export async function picModFetchHandler(
  modPictures: ModPicture[],
  approveFunc: (id: number) => void,
  deleteFunc: (id: number) => void
) {
  // Get recorded hashes from preferences
  const recordedHashes = Preferences.get(P.picModHashes);

  // Get hashes for all mod pictures
  const pictureHashes = await Promise.allSettled(
    // eslint-disable-next-line camelcase
    modPictures.map(async ({ id, image_url }) => {
      try {
        const imageData = await getImageBlobFromUrl(image_url);
        const imageHash = (await hashBlob(imageData)) as string;
        return { id, imageHash };
      } catch (error) {
        console.error(`Error hashing image ${id}: ${error}`);
        return { id, error };
      }
    })
  ).then((results) =>
    results
      .filter(({ status }) => status === "fulfilled")
      // @ts-ignore
      .map(({ value }) => value)
  );

  // Update image hashes for matching mod pictures
  pictureHashes.forEach(({ id, imageHash }) => {
    const modPicture = modPictures.find(({ id: modId }) => modId === id);
    if (modPicture) modPicture.imageHash = imageHash;
  });

  // Filter mod pictures without a matching recorded hash
  const filteredModPictures = modPictures.filter(({ imageHash }) =>
    recordedHashes.some(({ hash }) => hash === imageHash)
  );

  // Get actions for filtered mod pictures
  const actions = filteredModPictures.map(({ id, imageHash }) => {
    const { approvals = 0, rejections = 0 } =
      recordedHashes.find(({ hash }) => hash === imageHash) || {};
    const action = getAction(approvals, rejections);
    return { id, action, hash: imageHash };
  });

  // Filter out actions with "standby" status and add conflicted hashes to array
  const conflictedHashes: string[] = [];
  const approvedIds: number[] = [];
  const rejectedIds: number[] = [];

  actions.forEach(({ id, action, hash }) => {
    if (!hash) return;
    if (action === "conflicted") {
      conflictedHashes.push(hash);
    } else if (action === "approve") {
      approvedIds.push(id);
      updatePicHashListPref(hash, "approve");
    } else if (action === "reject") {
      rejectedIds.push(id);
      updatePicHashListPref(hash, "reject");
    }
  });

  // Call approveFunc and deleteFunc for approved and rejected pictures
  approvedIds.forEach((id) => approveFunc(id));
  rejectedIds.forEach((id) => deleteFunc(id));

  deleteConflicts(conflictedHashes);

  // Return mod pictures that don't have a matching recorded hash
  const filteredPictureModerations = modPictures.filter(
    (modPicture) =>
      !approvedIds.includes(modPicture.id) &&
      !rejectedIds.includes(modPicture.id) &&
      !conflictedHashes.includes(
        modPicture.imageHash ? modPicture.imageHash : ""
      )
  );

  return filteredPictureModerations;
}

export function clearPicModCache() {
  Preferences.set(P.picModHashes, []);
  alert("Image cache for picture moderation has been cleared");
}
