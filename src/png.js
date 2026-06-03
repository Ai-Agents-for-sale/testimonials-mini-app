import { toPng } from 'html-to-image';

// Resolve when this image is loaded — or after `timeoutMs`, so a single
// stuck `<img>` can't deadlock the publish/schedule flow. Returns the
// promise; never rejects.
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

// Convert a `data:image/...;base64,...` URL into a Blob URL.
// html-to-image clones the canvas into an SVG <foreignObject>; on iOS
// WebView (Telegram Mini App) large data: URLs in that foreignObject get
// dropped silently — the resulting PNG renders blank in their place.
// Blob URLs survive that path reliably.
function dataUrlToBlobUrl(dataUrl) {
  try {
    const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) return null;
    const mime = match[1];
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch (_e) {
    return null;
  }
}

async function swapDataUrlsForBlobs(rootEl) {
  const swaps = [];
  const imgs = Array.from(rootEl.querySelectorAll('img'));
  imgs.forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!src.startsWith('data:')) return;
    const blobUrl = dataUrlToBlobUrl(src);
    if (!blobUrl) return;
    swaps.push({ img, originalSrc: src, blobUrl });
    img.src = blobUrl;
  });
  // Don't deadlock if a blob load event never fires (iOS race).
  await Promise.all(swaps.map(({ img }) => waitForImage(img)));
  return swaps;
}

function restoreSrcs(swaps) {
  swaps.forEach(({ img, originalSrc, blobUrl }) => {
    img.src = originalSrc;
    URL.revokeObjectURL(blobUrl);
  });
}

export async function renderCanvasToPng(canvasEl, dims = { w: 1080, h: 1350 }) {
  // Best-effort preload + blob-swap; failures here must NOT prevent the
  // snapshot from running. Worst case: html-to-image grabs whatever's in
  // the DOM at the moment (the prior behaviour).
  try { await preloadImages(canvasEl); } catch (_e) {}
  let swaps = [];
  try { swaps = await swapDataUrlsForBlobs(canvasEl); } catch (_e) { swaps = []; }
  try {
    return await toPng(canvasEl, {
      cacheBust: true,
      pixelRatio: 1,
      width: dims.w,
      height: dims.h,
      backgroundColor: null
    });
  } finally {
    try { restoreSrcs(swaps); } catch (_e) {}
  }
}

export function dataUrlToBase64(dataUrl) {
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}
