// Shrink-to-fit typography for the fixed-size template canvases.
//
// Each template marks variable-length text elements with:
//   data-fit-max="<max-fontSize-px>"
//   data-fit-min="<min-fontSize-px>"   (optional, defaults to 14)
//
// After the canvas is in the DOM, call autofitCanvas(canvasEl). The helper
// resets every marked element to its max font-size, then iteratively shrinks
// whichever element has the most "headroom" (curSize − minSize) until the
// canvas no longer overflows. This guarantees the image and decorative
// chrome stay fully visible no matter how long the AI text is.

export function autofitCanvas(canvasEl) {
  if (!canvasEl) return;
  // Two RAFs: first lets the browser do initial layout (so we measure real
  // sizes), the second lets it apply our font-size resets before we measure.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => fit(canvasEl));
  });
}

function fit(canvasEl) {
  const targets = Array.from(canvasEl.querySelectorAll('[data-fit-max]'));
  if (!targets.length) return;

  // Reset every target to its declared max font-size.
  targets.forEach((el) => {
    const max = parseFloat(el.dataset.fitMax);
    const min = parseFloat(el.dataset.fitMin || '14');
    el.style.fontSize = max + 'px';
    el._fitMax = max;
    el._fitMin = min;
    el._fitCur = max;
  });

  // Iteratively shrink the element with the most headroom until the canvas
  // no longer overflows OR every element has hit its minimum.
  let safety = 400;
  while (safety-- > 0) {
    const overflowing = canvasEl.scrollHeight > canvasEl.clientHeight + 1;
    if (!overflowing) break;

    let pickEl = null;
    let pickGap = 0;
    targets.forEach((el) => {
      const gap = el._fitCur - el._fitMin;
      if (gap > pickGap) {
        pickGap = gap;
        pickEl = el;
      }
    });
    if (!pickEl) break;

    pickEl._fitCur -= 2;
    pickEl.style.fontSize = pickEl._fitCur + 'px';
  }
}
