// #9. Decorate Header

import U from "~src/userscript";
import { crel, loadCSS } from "~src/utils";
import css from "./style.scss";
import {
  getPredictions,
  picModFetchHandler,
  setPicModIconCount
} from "../modMenu/components/PictureModeration/utils";
import {
  nameModFetchHandler,
  setNameModIconCount
} from "../modMenu/components/NameModeration/utils";
import { Preferences, P } from "~src/preferences";

function setLogo(logo: Element) {
  const displayPicture = App.user.display_picture;
  if (!(logo instanceof HTMLImageElement) || logo.src === displayPicture)
    return;
  logo.src = displayPicture;
}

function setFavicon() {
  if (document.head.querySelector(`link[rel="icon"][href="${U.icon}"]`)) return;
  document.head
    .querySelectorAll(`link[rel="icon"]`)
    .forEach((node) => node.remove());
  const favicon = crel("link", {
    rel: "icon",
    href: U.icon
  });
  document.head.prepend(favicon);
}

function addKarmaPlaceholder(logo: Element) {
  const karmaTracker = document.querySelector(".karma-tracker");
  if (karmaTracker) return;
  const tracker = crel("div", {
    className: "karma-tracker"
  });
  logo?.parentElement?.insertBefore(tracker, logo?.nextSibling);
}

function approvePicMod(id: number) {
  $.ajax({
    type: "POST",
    url: `/picture_moderations/${id}/approve`,
    dataType: "json"
  });
}
function rejectPicMod(id: number) {
  $.ajax({
    type: "DELETE",
    url: `/picture_moderations/${id}`,
    dataType: "json"
  });
}

function approveNameMod(id: number) {
  $.ajax({
    type: "POST",
    url: `/display_name_moderations/${id}/approve`,
    dataType: "json"
  });
}
function rejectNameMod(id: number) {
  $.ajax({
    type: "DELETE",
    url: `/display_name_moderations/${id}`,
    dataType: "json"
  });
}

async function fetchPicModData() {
  // if (!App.user.mod || !App.user.master) return 0;
  if (!App.user.mod) return 0;
  const response = await fetch("/picture_moderations");
  if (response.status === 403) {
    return 0;
  }
  const recordedPredictions = Preferences.get(P.picModPredictions);
  console.log(recordedPredictions);
  const modPictures = (await response.json()) as ModPicture[];
  const filteredPictureModerations = await picModFetchHandler(
    modPictures,
    approvePicMod,
    rejectPicMod
  );
  // find the ones that are not in the recorded predictions

  const unrecordedPictures = filteredPictureModerations.filter(
    (picture) =>
      !recordedPredictions.some((record) => record.hash === picture.imageHash)
  );

  const preRecordedPictures = filteredPictureModerations.filter((picture) =>
    recordedPredictions.some((record) => record.hash === picture.imageHash)
  );

  // add predictions to prerecorded pictures from cache
  preRecordedPictures.forEach((picture) => {
    const prediction = recordedPredictions.find(
      (record) => record.hash === picture.imageHash
    )?.prediction;
    if (prediction) picture.prediction = prediction;
  });

  let unrecordedPicturesWithPredictions: ModPicture[] = [];

  if (unrecordedPictures.length) {
    unrecordedPicturesWithPredictions = (await getPredictions(
      unrecordedPictures
    )) as ModPicture[];
  }
  const finalPredictions = preRecordedPictures.concat(
    unrecordedPicturesWithPredictions
  );

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
  return finalPredictions.length ? finalPredictions.length : 0;
}

async function fetchNameModData() {
  // if (!App.user.mod || !App.user.master) return 0;
  if (!App.user.mod) return 0;
  const response = await fetch("/display_name_moderations");
  if (response.status === 403) {
    return 0;
  }
  const modNames = (await response.json()) as ModName[];
  const filteredNameModerations = await nameModFetchHandler(
    modNames,
    approveNameMod,
    rejectNameMod
  );

  return filteredNameModerations.length ? filteredNameModerations.length : 0;
}
function headerIcons() {
  const iconsHolder = document.querySelector(".navigation-notification-icons");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!iconsHolder?.children) return;
  if (
    document.fullscreenEnabled &&
    !iconsHolder.querySelector(".ritsu-button-fullscreen") &&
    !isMobile
  ) {
    const fullscreenIcon = crel("span", {
      className:
        "material-icons navigation-notification-unit ritsu-button-fullscreen",
      textContent: "open_in_full",
      tabIndex: -1,
      role: "button",
      onmousedown: async () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          fullscreenIcon.textContent = "open_in_full";
        } else {
          await document.body.requestFullscreen();
          fullscreenIcon.textContent = "close_fullscreen";
        }
      }
    });
    const icon = crel("span");
    icon.append(fullscreenIcon);
    iconsHolder.prepend(icon);
  }
  if (!iconsHolder.querySelector(".ritsu-icon-network-unavail")) {
    const networkText =
      "Emerald is not responding - switching chats is not recommended.";
    const networkIcon = crel("span", {
      className:
        "material-icons navigation-notification-unit ritsu-icon-network-unavail",
      textContent: "signal_cellular_alt",
      tabIndex: -1,
      role: "button",
      title: networkText,
      onmousedown: () => alert(networkText)
    });
    const icon = crel("span");
    icon.append(networkIcon);
    iconsHolder.prepend(icon);
  }

  if (!iconsHolder.querySelector(".ritsu-icon-pic-mod") && App.user.mod) {
    const imgCountOverlay = crel("span", {
      className: "notification-count-overlay",
      textContent: 0,
      style: "display: none;"
    });

    const picModIcon = crel("span", {
      className:
        "material-icons navigation-notification-unit ritsu-icon-pic-mod",
      textContent: "account_box",
      tabIndex: -1,
      role: "button",
      title: "Picture Moderation",
      onmousedown: () => ActionTray.prototype.pictureModeration()
    });
    const icon = crel("span");
    icon.append(picModIcon);
    icon.append(imgCountOverlay);
    iconsHolder.prepend(icon);
  }

  // eslint-disable-next-line no-inner-declarations
  async function updatePicModIcon() {
    if (document.body.classList.contains("picModMounted")) return;
    const response = await fetchPicModData();
    setPicModIconCount(response);
  }

  if (!iconsHolder.querySelector(".ritsu-icon-name-mod") && App.user.mod) {
    const nameCountOverlay = crel("span", {
      className: "name-count-overlay",
      textContent: 0,
      style: "display: none;"
    });

    const nameModIcon = crel("span", {
      className:
        "material-icons navigation-notification-unit ritsu-icon-name-mod",
      textContent: "badge",
      tabIndex: -1,
      role: "button",
      title: "Display Name Moderation",
      onmousedown: () => ActionTray.prototype.display_nameModeration()
    });
    const icon = crel("span");
    icon.append(nameModIcon);
    icon.append(nameCountOverlay);
    iconsHolder.prepend(icon);
  }

  // eslint-disable-next-line no-inner-declarations
  async function updateNameModIcon() {
    if (document.body.classList.contains("picModMounted")) return;
    const response = await fetchNameModData();
    setNameModIconCount(response);
  }

  if (!document.body.classList.contains("watchers_started")) {
    setTimeout(updatePicModIcon, 1000);
    setTimeout(updateNameModIcon, 1000);
    document.body.classList.add("watchers_started");
    setInterval(updatePicModIcon, 15000);
    setInterval(updateNameModIcon, 15000);
  }
}
function addTextToLogo(logo: Element) {
  const displayName = App.user.display_name || "(...)";
  const title = `${displayName} - ${U.shortName} ${U.version}`;
  if (document.title !== title) document.title = title;
  const logoText = document.querySelector(".main-logo-text");
  if (!logoText) {
    const text = crel("div", {
      className: "main-logo-text",
      textContent: title
    });
    if (logo.parentElement)
      logo.parentElement.insertBefore(text, logo.nextSibling);
  }
  if (logoText && logoText.textContent !== title) {
    logoText.textContent = title;
  }
}

export function initHeader() {
  loadCSS(css);
}
export function decorateHeader() {
  const logo = document.querySelector(".main-logo");
  if (!logo) return;
  headerIcons();
  setLogo(logo);
  setFavicon();
  addKarmaPlaceholder(logo);
  addTextToLogo(logo);
}
