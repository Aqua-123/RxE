import { Preferences, P } from "~src/preferences";
import { getImageBlobFromUrl, hashBlob } from "~src/utils";
import { getAction } from "../utils";

export function setPicModIconCount(count: number) {
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
    modPictures?.map(async ({ id, image_url }) => {
      try {
        const imageData = await getImageBlobFromUrl(image_url);
        // @ts-ignore
        const imageHash = await hashBlob(imageData); // Directly hash the blob
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

export async function getPredictions(imageDataArray: ModPicture[]) {
  const apiEndpoint = "https://class2.emeraldchat.com/predict"; // Replace with your actual API endpoint

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(imageDataArray)
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data;
}

export async function processPredictions(pictureModerationList: ModPicture[]) {
  if (Preferences.get(P.hideAIControls)) return pictureModerationList;
  const recordedPredictions = Preferences.get(P.picModPredictions);

  const preRecordedPictures = [] as ModPicture[];
  const unrecordedPictures = [] as ModPicture[];
  let unrecordedPicturesWithPredictions: ModPicture[] = [];

  pictureModerationList.forEach((picture) => {
    const recordedPrediction = recordedPredictions.find(
      (record) => record.hash === picture.imageHash
    );
    if (recordedPrediction) {
      picture.prediction = recordedPrediction.prediction;
      preRecordedPictures.push(picture);
    } else {
      unrecordedPictures.push(picture);
    }
  });

  if (unrecordedPictures.length) {
    unrecordedPicturesWithPredictions = await getPredictions(
      unrecordedPictures
    );
  }

  const finalPredictions =
    unrecordedPicturesWithPredictions.concat(preRecordedPictures);

  // save the predictions
  const newRecordedPredictions = unrecordedPicturesWithPredictions.map(
    (picture) => ({
      hash: picture.imageHash!,
      prediction: picture.prediction!
    })
  );
  Preferences.set(P.picModPredictions, [
    ...recordedPredictions,
    ...newRecordedPredictions
  ]);
  return finalPredictions;
}

export function getFeedback(hash: string) {
  const recordedFeedback = Preferences.get(P.picModFeedback);
  const feedback = recordedFeedback.find((record) => record.hash === hash);
  return feedback;
}

export function setFeedback(hash: string, feedback: string) {
  const recordedFeedback = Preferences.get(P.picModFeedback);
  const newRecordedFeedback = recordedFeedback.filter(
    (record) => record.hash !== hash
  );
  newRecordedFeedback.push({ hash, feedback });
  Preferences.set(P.picModFeedback, newRecordedFeedback);
}
