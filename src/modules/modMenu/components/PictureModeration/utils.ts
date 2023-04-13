import md5 from "md5";
import { ListPreferenceMap } from "~src/listprefcache";
import { Preferences, P } from "~src/preferences";

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

export async function getUserData(id: number) {
  const response = await fetch(`https://emeraldchat.com/profile_json?id=${id}`);
  const data = (await response.json()) as ProfileData;
  return data;
}

export async function getImageData(url: string) {
  const response = await fetch(url);
  return response.blob();
}

export function hashBlob(blob: Blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.onload = () => {
      const data = fileReader.result as string;
      const hash = md5(data);
      resolve(hash);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

export async function picModFetchHandler(
  modPictures: ModPicture[],
  approveFunc: (arg0: number) => void,
  deleteFunc: (arg0: number) => void
) {
  const pictureModerations = await Promise.all(
    modPictures.map(async (modPicture) => {
      const imageData = await getImageData(modPicture.image_url);
      const imageHash = (await hashBlob(imageData)) as string;
      return { ...modPicture, imageHash };
    })
  );

  const recordedHashes = Preferences.get(P.picModHashes);

  const filteredElements = pictureModerations.filter((elem) =>
    recordedHashes.some((recordedHash) => recordedHash[0] === elem.imageHash)
  );

  filteredElements.forEach((filteredElem) => {
    const action = recordedHashes.find(
      (recordedHash) => recordedHash[0] === filteredElem.imageHash
    )?.[1];

    if (action === "approve") {
      approveFunc(filteredElem.id);
    } else if (action === "delete") {
      deleteFunc(filteredElem.id);
    }
  });

  const filteredPictureModerations = pictureModerations.filter((modPicture) => {
    const hash = modPicture.imageHash;
    return recordedHashes.every(([recordedHash, _]) => recordedHash !== hash);
  });

  return filteredPictureModerations;
}

export function updatePicHashListPref(hash: string, action: string) {
  ListPreferenceMap.addItem({ key: hash, item: action }, P.picModHashes);
}

export function clearPicModCache() {
  Preferences.set(P.picModHashes, []);
  alert("Image cache for picture moderation has been cleared");
}
