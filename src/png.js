import { toPng } from 'html-to-image';

// Resolve when this image is loaded — or after `timeoutMs`, so a single
// stuck `<img>` can't deadlock publish. Never rejects.
function waitForImage(img, timeoutMs = 2500) {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    img.addEventListener('load',  finish, { once: true });
    img.addEventListener('error', finish, { once: true });
    setTimeout(finish, timeoutMs);
  });
}

async function preloadImages(rootEl) {
  const imgs = Array.from(rootEl.querySelectorAll('img'));
  await Promise.all(imgs.map((img) => waitForImage(img)));
}

export async function renderCanvasToPng(canvasEl, dims = { w: 1080, h: 1350 }) {
  // Wait for every <img> in the canvas to finish decoding. Without this,
  // html-to-image can snapshot before a freshly-set data URL has resolved.
  try { await preloadImages(canvasEl); } catch (_e) {}

  return toPng(canvasEl, {
    cacheBust: true,
    pixelRatio: 1,
    width: dims.w,
    height: dims.h,
    backgroundColor: null
  });
}

export function dataUrlToBase64(dataUrl) {
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}
