export const BIO_IMAGE = () =>
  /\[?rxe-pfp:?([A-Za-z0-9+/=\u{E0020}-\u{E005F}]+)\]?/gu;
export const BIO_IMAGE_IMGUR = () =>
  /\[?rxe-pfp:?imgur([A-Za-z0-9+.:/=\u{E0020}-\u{E005F}]+)\]?/gu;
const makeBioImage = (compressed: string) => `[rxe-pfp:${compressed}]`;
const makeBioImageimgur = (compressed: string) =>
  `[rxe-pfp:imgur${compressed}]`;

export function extractBioImage(bio: string): string | null {
  const extracted =
    Array.from(bio.matchAll(BIO_IMAGE()))
      .map((match) => match[1])
      .slice(-1)[0] ?? null;
  if (extracted === "imgurhttps") {
    return (
      Array.from(bio.matchAll(BIO_IMAGE_IMGUR()))
        .map((match) => match[1])
        .slice(-1)[0] ?? null
    );
  }
  return extracted;
}

export function bioWithoutImage(bio: string): string {
  const lastIndex = Array.from(bio.matchAll(BIO_IMAGE()))
    .map((match) => match.index)
    .filter((index) => index !== undefined)
    .slice(-1)[0];
  // intended behaviour if undefined
  return bio.slice(0, lastIndex);
}
export function replaceBioImage(bio: string, compressed: string) {
  const rawBio = bioWithoutImage(bio);
  const result =
    rawBio +
    (rawBio[rawBio.length - 1] === "\n" ? "" : "\n") +
    makeBioImage(compressed);
  if (result) return result;
  return (
    rawBio +
    (rawBio[rawBio.length - 1] === "\n" ? "" : "\n") +
    makeBioImageimgur(compressed)
  );
}

export async function saveBio(user: EmeraldUser, bio: string) {
  return new Promise<void>((resolve, reject) => {
    const params = {
      display_name: user.display_name,
      bio,
      flair: { color: user.flair.color },
      gender: user.gender
    };
    console.log(bio);
    $.ajax({
      type: "GET",
      url: `/update_profile?${$.param(params)}`,
      dataType: "json",
      success() {
        UserProfileReact?.load(user.id);
        resolve();
      },
      error() {
        reject();
      }
    } as JQueryAjaxSettings); // old jQuery moment
  });
}
