import browserWindow from "~src/browserWindow";
import { Preferences, P } from "~src/preferences";

export function handleFuckedImages() {
  if (Preferences.get(P.disablePfpNagging)) return;
  const retryMap = new Map<string, number>();

  // Function to reload an image with retries
  function reloadImage(
    img: HTMLImageElement,
    baseSrc: string,
    retryCount: number
  ) {
    if (retryCount <= 0) {
      console.error(`Failed to load image after multiple attempts: ${baseSrc}`);
      return;
    }

    if (!retryMap.has(baseSrc)) {
      retryMap.set(baseSrc, retryCount);
    }

    const newImg = new Image();

    newImg.onload = function () {
      // Cache the successfully loaded image
      localStorage.setItem(baseSrc, newImg.src);
      // Update all images with the same baseSrc
      document
        .querySelectorAll<HTMLImageElement>(`img[data-base-src="${baseSrc}"]`)
        .forEach((image) => {
          image.src = newImg.src;
        });
      retryMap.delete(baseSrc);
    };

    newImg.onerror = function () {
      const remainingRetries = retryMap.get(baseSrc)! - 1;
      retryMap.set(baseSrc, remainingRetries);
      console.warn(
        `Retrying to load image: ${baseSrc}, attempts left: ${remainingRetries}`
      );
      setTimeout(() => reloadImage(img, baseSrc, remainingRetries), 200); // retry after 200 milliseconds
    };

    newImg.src = `${baseSrc}?${new Date().getTime()}`; // cache-busting
  }

  // Function to handle image load errors
  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const baseSrc = img.getAttribute("data-base-src") || img.src;

    if (!retryMap.has(baseSrc)) {
      retryMap.set(baseSrc, 7); // Initialize retries
    }

    const retryCount = retryMap.get(baseSrc)!;
    reloadImage(img, baseSrc, retryCount);
  }

  // Initialize the images
  function initializeImages(images: NodeListOf<HTMLImageElement>) {
    images.forEach((img) => {
      const baseSrc = img.src;

      // Check if the image is already cached in localStorage
      const cachedSrc = localStorage.getItem(baseSrc);
      if (cachedSrc) {
        img.src = cachedSrc;
      } else {
        img.setAttribute("data-base-src", baseSrc);
        img.addEventListener("error", handleImageError);
      }
    });
  }

  const images = document.querySelectorAll<HTMLImageElement>("img");
  initializeImages(images);

  // Debounce function
  function debounce(func: Function, wait: number) {
    let timeout: number;
    return function (...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = browserWindow.setTimeout(later, wait);
    };
  }

  // Observe for dynamically added images
  const observer = new MutationObserver(
    debounce((mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLImageElement) {
              const img = node;
              const baseSrc = img.src;

              // Check if the image is already cached in localStorage
              const cachedSrc = localStorage.getItem(baseSrc);
              if (cachedSrc) {
                img.src = cachedSrc;
              } else {
                img.setAttribute("data-base-src", baseSrc);
                img.addEventListener("error", handleImageError);
              }
            } else if (node instanceof HTMLElement && node.querySelectorAll) {
              const newImages = node.querySelectorAll<HTMLImageElement>("img");
              initializeImages(newImages);
            }
          });
        }
      });
    }, 300) // Adjust the debounce delay as needed
  );

  observer.observe(document.body, { childList: true, subtree: true });
}
