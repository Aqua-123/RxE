export function handleFuckedImages() {
  // Function to reload an image with retries
  function reloadImage(img: HTMLImageElement, retryCount: number) {
    if (retryCount <= 0) {
      console.error(`Failed to load image after multiple attempts: ${img.src}`);
      return;
    }

    const baseSrc = img.getAttribute("data-base-src") || img.src;
    const newImg = new Image();

    newImg.onload = function () {
      // Cache the successfully loaded image
      localStorage.setItem(baseSrc, newImg.src);
      img.src = newImg.src;
    };

    newImg.onerror = function () {
      console.warn(
        `Retrying to load image: ${baseSrc}, attempts left: ${retryCount - 1}`
      );
      setTimeout(() => reloadImage(img, retryCount - 1), 200); // retry after 200 milliseconds
    };

    newImg.src = `${baseSrc}?${new Date().getTime()}`; // cache-busting
  }

  // Function to handle image load errors
  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;

    if (!img.hasAttribute("data-retries")) {
      img.setAttribute("data-retries", "3");
    }

    const retryCount = parseInt(img.getAttribute("data-retries")!, 10);
    reloadImage(img, retryCount);
  }

  // Initialize the images
  const images = document.querySelectorAll<HTMLImageElement>("img");
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

  // Observe for dynamically added images
  const observer = new MutationObserver((mutations) => {
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
            newImages.forEach((img) => {
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
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
