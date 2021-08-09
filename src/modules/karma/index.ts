import { crel, loadCSS } from "~src/utils";
import trackKarma from "./style.scss";

const KARMA_TRACKING_INTERVAL = 10 * 1000;

let currentKarma: number | null = null;

function updateKarma(karma: number) {
  if (karma === currentKarma) return;
  if (currentKarma !== null) {
    const delta = karma - currentKarma;
    const elt = crel("div", {
      className: `karma-delta ${delta > 0 ? "positive" : "negative"}`,
      textContent: delta > 0 ? `+${delta}` : delta
    });
    document.body.append(elt);
    // if I were using CSS animations rather than transitions
    // I wouldn't need this awkwardness.
    setTimeout(() => elt.classList.add("zoom"), 250);
    setTimeout(() => elt.remove(), 5000);
  }
  currentKarma = karma;
  const text = karma ? `Karma: ${karma}` : "";
  const karmaTracker = document.querySelector(".karma-tracker");
  if (karmaTracker) {
    karmaTracker.textContent = text;
  }
}

function fetchKarma() {
  const { id } = App.user;
  if (!id) {
    setTimeout(fetchKarma, 500);
    return;
  }
  $.ajax({
    type: "GET",
    url: `/profile_json?id=${id}`,
    dataType: "json",
    success: (e) => {
      updateKarma(e.user.karma);
      setTimeout(fetchKarma, KARMA_TRACKING_INTERVAL);
    },
    error: () => {
      setTimeout(fetchKarma, KARMA_TRACKING_INTERVAL);
    }
  });
}

export function initKarmaTracker() {
  fetchKarma();
  loadCSS(trackKarma);
}
