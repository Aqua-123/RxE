import { P, Preferences } from "~src/preferences";

export function reorderMenu() {
  const gold = document.evaluate(
    "//li[text()='Emerald Gold']",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  const premiumBadge = document.evaluate(
    "//li[text()='Premium Badge']",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (Preferences.get(P.adBlocker)) {
    if (gold instanceof HTMLElement) {
      gold.remove();
    }
    if (premiumBadge instanceof HTMLElement) {
      premiumBadge.remove();
    }
  } else {
    if (gold && gold.parentElement?.firstChild === gold) {
      gold.parentElement.append(gold);
    }
    if (
      premiumBadge &&
      premiumBadge.parentElement?.firstChild === premiumBadge
    ) {
      premiumBadge.parentElement.append(premiumBadge);
    }
  }
}
