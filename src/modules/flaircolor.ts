import { P, Preferences } from "~src/preferences";
import { crel } from "~src/utils";

export function decorateProfileDialog() {
  if (!Preferences.get(P.fancyColors)) return;
  const flairLabel = document.querySelector<HTMLLabelElement>(
    'label.ui-select[for="flair-select"]'
  );
  if (!flairLabel) return;
  flairLabel.htmlFor = "flair-select-old";
  if (flairLabel.firstElementChild?.id === "flair-select") {
    // not replaced yet.
    const event = new Event("change", { bubbles: true });
    const newFlairLabel = flairLabel.cloneNode() as HTMLLabelElement;
    newFlairLabel.classList.add("disable-after");
    flairLabel.firstElementChild.id = "flair-select-old";
    flairLabel.style.display = "none";
    const input = crel("input", {
      id: "flair-select",
      className: "alt-flair-select",
      value: App.user.flair.color
    }) as HTMLInputElement;
    const colorInput = crel("input", {
      id: "flair-select",
      type: "color",
      className: "picker-flair-select",
      value: App.user.flair.color,
      oninput: () => {
        input.value = colorInput.value;
        flairLabel.firstChild?.dispatchEvent(event);
      }
    }) as HTMLInputElement;
    newFlairLabel.append(input, colorInput);
    flairLabel.parentElement?.insertBefore(
      newFlairLabel,
      flairLabel.nextSibling
    );
    input.oninput = () => {
      colorInput.value = input.value;
      flairLabel.firstChild?.dispatchEvent(event);
    };
  }
}
