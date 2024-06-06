export function handleFuckedImages() {
  function reloadImage(img: { src: string }, retryCount: number) {
    if (retryCount <= 0) {
      console.error(`Failed to load image after multiple attempts: ${img.src}`);
      return;
    }

    const newImg = new Image();
    newImg.onload = function () {
      img.src = newImg.src;
    };
    newImg.onerror = function () {
      console.warn(
        `Retrying to load image: ${img.src}, attempts left: ${retryCount - 1}`
      );
      setTimeout(() => reloadImage(img, retryCount - 1), 2000); // retry after 2 seconds
    };
    newImg.src = `${img.src}?${new Date().getTime()}`; // cache-busting
  }

  // Function to handle image load errors
  function handleImageError(event: { target: any }) {
    const img = event.target;
    if (!img.hasAttribute("data-retries")) {
      img.setAttribute("data-retries", "3");
    }
    const retryCount = parseInt(img.getAttribute("data-retries"), 10);
    reloadImage(img, retryCount);
  }

  // Attach error handler to all images
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("error", handleImageError);
  });
}
