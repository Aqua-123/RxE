import { P, Preferences } from "~src/preferences";
import { timeSince } from "~src/utils";

const MAX_IMAGES = 10;
const INTERVAL = 3600e3;

const uploadsAll = () => Preferences.get(P.imgurLastUploadTimes);

const setUploads = (times: number[]) =>
  Preferences.set(P.imgurLastUploadTimes, times);

const uploads = () =>
  uploadsAll().filter(
    (timestamp) => timeSince(new Date(timestamp)) <= INTERVAL
  );

export const canUpload = FEATURES.HACKS
  ? () => true
  : () => uploads().length < MAX_IMAGES;

export function newUpload(): void {
  setUploads([...uploadsAll(), +new Date()].slice(-MAX_IMAGES));
}

export function nextUpload(): number {
  const blockingUploads = uploads().slice(0, -(MAX_IMAGES - 1));
  if (blockingUploads.length === 0) return 0;
  const lastBlockingUpload = Math.max(...blockingUploads);
  return +new Date() + (INTERVAL - timeSince(new Date(lastBlockingUpload)));
}

export const ratelimitInfo = `You can upload ${MAX_IMAGES} new images per ${$.timeago(
  +new Date() - INTERVAL
)}.`;
