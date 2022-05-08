export const emotes = {
  // use regex instead

  "/shrug": "¯\\_(ツ)_/¯",
  "/tableflip": "(╯°□°）╯︵ ┻━┻",
  "/tableflip2": "(ノಠ益ಠ)ノ彡┻━┻",
  "/unflip": "┬──┬ ノ( ゜-゜ノ)"
};
// regex for space
// /\s/g
export function processEmotes(text: string) {
  let newText = text;
  Object.keys(emotes).forEach((emote) => {
    newText = newText.replace(
      new RegExp(`${emote}/s+`, "g"),
      `${emotes[emote]} `
    );
  });
  return newText;
}
