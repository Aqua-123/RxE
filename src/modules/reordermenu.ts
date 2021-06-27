import { P, Preferences } from "~src/preferences";

export function reorderMenu() {
  const gold = document
    .evaluate("//li[text()='Emerald Gold']", document)
    .iterateNext();
  if (process.env.HACKS !== "OFF" && Preferences.get(P.disableNags!)) {
    if (gold instanceof HTMLElement) {
      gold.remove();
    }
  } else {
    if (gold && gold?.parentElement?.firstChild === gold) {
      gold.parentElement.append(gold);
    }
  }
}
