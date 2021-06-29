export function render(kernels: Array<() => void>) {
  function renderOnce() {
    kernels.forEach((kernel) => kernel());
  }

  let next: number;
  const observer = new MutationObserver(() => {
    cancelAnimationFrame(next);
    next = requestAnimationFrame(renderOnce);
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true
  });
  renderOnce();
}
