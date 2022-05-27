import { cached, some } from "~src/utils";

export const DIGIT_SIZE = 6;

export const IMAGE_SIZE_MAX = 128;
export const IMAGE_SIZE_STEP = IMAGE_SIZE_MAX / (1 << 3);
export const PALETTE_BITS = 4;
export const PALETTE_LENGTH = 1 << PALETTE_BITS;
export const BIT_HEADER = {
  PALETTE_SELECTION: "00",
  BACKGROUND_SELECTION_STREAM: "1",
  /* OFFSET: "10",
    OFFSET_LONG: "11", */
  OFFSET: "01"
};
export const TOKEN_DIGITS = {
  OFFSET: 1,
  // OFFSET_LONG: 2,
  BACKGROUND_SELECTION_STREAM: 2,
  PALETTE_SELECTION: 3
};

export const LOG_ENCODING_INFO = false;

export const CHOOSE_COMPRESSION_PARAMETERS = false;

export const MAX_APPROXIMATION = CHOOSE_COMPRESSION_PARAMETERS
  ? cached(() => some(+(prompt("MAX_APPROXIMATION", "0.01") ?? 0.01)))
  : () => 0.01;

export const PALETTE_DIST_WEIGHT = CHOOSE_COMPRESSION_PARAMETERS
  ? cached(() => some(+(prompt("PALETTE_DIST_WEIGHT", "0.5") ?? 0.5)))
  : () => 0.5;
