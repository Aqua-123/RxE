// #5. Image control

import {
  P as PREFS,
  Preferences,
  ListPreferenceSet
} from "~src/preferences";
import { crel, memoizeAsync } from "~src/utils";

const blockedHashes = new ListPreferenceSet(PREFS.blockedHashes);
const savedPictures = new ListPreferenceSet(PREFS.savedPictures);

export function initPictures() {
  blockedHashes.load();
  savedPictures.load();
}

export const getHash = memoizeAsync(async (str: string) => {
  const msg = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msg);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
});

async function blockPicture(src?: string) {
  if (!src) return;
  const hash = await getHash(src);
  blockedHashes.add(hash);
  // apply block
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  decoratePictures();
}

function savePicture(src?: string) {
  if (src) savedPictures.add(src);
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
  PictureUploader.onUploaded(picture);
}

export async function decoratePictures() {
  // add block and save buttons on every image in chat.
  const pics = document.querySelectorAll(
    ".room-component-message-picture-container"
  );
  pics.forEach(async (pic) => {
    if (
      Preferences.get(PREFS.imgControl) &&
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
      const { src } = pic.firstChild;
      const hash = await getHash(src);
      if (blockedHashes.hasItem(hash)) {
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
  } else if (nagText) nagText.style.display = "";

  const imageGrid = dialog.querySelector(".image-grid");
  if (imageGrid) return;
  const buttons = dialog.querySelector(".ui-menu-buttons");
  const newImageGrid = crel("div", {
    className: "image-grid"
  });
  // eslint-disable-next-line no-console
  // console.log(savedPictures);
  savedPictures.values().map(async (src) => {
    const hash = await getHash(src);
    const image = crel("div", {
      style: `background-image: url(${encodeURI(src)}), url(${encodeURI(
        `https://robohash.org/${hash}.png?set=set4`
      )})`,
      onmousedown: () => {
        insertPicture(src);
        MenuReactMicro.close();
      }
    });
    image.append(
      crel("div", {
        className: "picture-button material-icons",
        textContent: "bookmark_remove",
        onmousedown: (event: Event) => {
          event.stopPropagation();
          // eslint-disable-next-line no-alert
          if (!confirm("Are you sure you want to unbookmark this image?"))
            return;
          savedPictures.remove(src);
          image.remove();
        }
      })
    );
    newImageGrid.append(image);
  });
  dialog.insertBefore(newImageGrid, buttons);
}
