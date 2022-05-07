export const emotes = {
  "/shrug": "¯\\_(ツ)_/¯",
  "/tableflip": "(╯°□°）╯︵ ┻━┻",
  "/tableflip2": "(ノಠ益ಠ)ノ彡┻━┻",
  "/unflip": "┬──┬ ノ( ゜-゜ノ)"
};

export function processEmotes(text: string) {
  let newText = text;
  Object.keys(emotes).forEach((emote) => {
    newText = newText.replace(new RegExp(emote, "g"), emotes[emote]);
  });
  return newText;
}
