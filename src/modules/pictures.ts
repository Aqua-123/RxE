// #5. Image control

import { P, Preferences } from "~src/preferences";
import { crel } from "~src/utils";

const knownHashes: Record<string, string> = {};
const blockedHashes: Record<string, boolean> = {};
const savedPictures: string[] = [];

export function initPictures() {
  const hashes = Preferences.get(P.blockedHashes);
  hashes.forEach((hash) => (blockedHashes[hash] = true));
  savedPictures.push(...Preferences.get(P.savedPictures));
}

async function getHash(str: string) {
  if (!knownHashes[str]) {
    const msg = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msg);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    knownHashes[str] = hashHex;
  }
  return knownHashes[str];
}

async function blockPicture(src?: string) {
  if (!src) return;
  const hash = await getHash(src);
  blockedHashes[hash] = true;
  Preferences.set(P.blockedHashes, Object.keys(blockedHashes));
  // apply block
  decoratePictures();
}

function savePicture(src?: string) {
  if (!src) return;
  savedPictures.push(src);
  Preferences.set(P.savedPictures, savedPictures);
}

function insertPicture(url: string) {
  const time = new Date().toISOString();
  const picture = {
    author_id: App.user.id,
    created_at: time,
    description: null,
    id: 9550000 + ~~(Math.random() * 1e6),
    image: {
      thumb: { url },
      url
    },
    image_processing: false,
    image_tmp: null,
    micropost_id: null,
    picture_album_id: null,
    temporary: false,
    title: null,
    updated_at: time,
    url
  };
  RoomClient.send_picture(picture);
}

export function decoratePictures() {
  // add block and save buttons on every image in chat.
  const pics = document.querySelectorAll(
    ".room-component-message-picture-container"
  );
  pics.forEach(async (pic) => {
    if (
      Preferences.get(P.imgControl) &&
      !pic.querySelector(".picture-control")
    ) {
      const controls = crel("div", {
        className: "picture-control"
      });
      controls.append(
        crel("div", {
          className: "picture-button block material-icons",
          textContent: "delete_forever",
          onmousedown: (e: MouseEvent) => {
            if (e.target instanceof HTMLElement) {
              const img = e.target.parentElement?.parentElement
                ?.firstChild as HTMLImageElement | null;
              blockPicture(img?.src);
            }
          }
        })
      );
      controls.append(
        crel("div", {
          className: "picture-button save material-icons",
          textContent: "bookmark_border",
          onmousedown: (e: MouseEvent) => {
            if (e.target instanceof HTMLElement) {
              const img = e.target.parentElement?.parentElement
                ?.firstChild as HTMLImageElement | null;
              savePicture(img?.src);
            }
          }
        })
      );
      pic.append(controls);
    }
    if (pic.firstChild instanceof HTMLImageElement) {
      const src = pic.firstChild.src;
      const hash = await getHash(src);
      if (blockedHashes[hash]) {
        pic.firstChild.src = "";
      }
    }
  });
  // also look for an Upload Image dialog to populate with saved images
  const uploadForm = document.querySelector("form#picture_upload");
  if (!uploadForm) return;
  const dialog = uploadForm.parentElement!;
  const nagText = dialog.querySelector<HTMLElement>(".ui-menu-text");
  if (nagText?.firstElementChild?.tagName === "B") {
    nagText.style.display = "none";
  } else {
    if (nagText) nagText.style.display = "";
  }

  const imageGrid = dialog.querySelector(".image-grid");
  if (imageGrid) return;
  const buttons = dialog.querySelector(".ui-menu-buttons");
  const closeButton = buttons?.firstChild;
  const newImageGrid = crel("div", {
    className: "image-grid"
  });
  savedPictures.forEach((src) => {
    newImageGrid.append(
      crel("div", {
        style: `background-image: url(${encodeURI(src)})`,
        onmousedown: () => {
          insertPicture(src);
          MenuReactMicro.close();
        }
      })
    );
  });
  dialog.insertBefore(newImageGrid, buttons);
}
