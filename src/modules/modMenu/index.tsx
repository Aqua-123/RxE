import styles from "./style.scss";
import { loadCSS } from "~src/utils";
import { initHideUser } from "./ws";
import { initBanForm } from "./components/banForm";
import { reportModOverride } from "./components/reportModeration";
import { pictureModerationOverride } from "./components/PictureModeration/pictureModeration";
import { spamModOverride } from "./components/spamModeration";
import { nameModerationOverride } from "./components/NameModeration/nameModeration";

export function modFunctionInit() {
  loadCSS(styles);
  spamModOverride();
  reportModOverride();
  pictureModerationOverride();
  nameModerationOverride();
  initHideUser();
  initBanForm();
}
