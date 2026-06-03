import { toPng } from 'html-to-image';

// Wait for every <img> inside the root to finish decoding before we
// snapshot. Without this the snapshot can fire before a freshly-set
// data URL has resolved → that <img> renders blank in the PNG.
async function preloadImages(rootEl) {
  const imgs = Array.from(rootEl.querySelectorAll('img'));
  await Promise.all(imgs.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener('load',  resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }));
}

// Convert a `data:image/...;base64,...` URL into a Blob URL.
// html-to-image clones the DOM into an SVG <foreignObject>; on iOS WebView
// (Telegram Mini App) large data: URLs in that foreignObject are dropped
// silently — the rendered PNG comes out with the <img> missing. Blob URLs
// survive that path reliably, so we swap each <img>'s src to a blob for
// the duration of the snapshot, then restore the original src after.
function dataUrlToBlobUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return null;
  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
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
  // Re-wait: changing src triggers a new load.
  await Promise.all(swaps.map(({ img }) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener('load',  resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }));
  return swaps;
}

function restoreSrcs(swaps) {
  swaps.forEach(({ img, originalSrc, blobUrl }) => {
    img.src = originalSrc;
    URL.revokeObjectURL(blobUrl);
  });
}

export async function renderCanvasToPng(canvasEl, dims = { w: 1080, h: 1350 }) {
  await preloadImages(canvasEl);
  const swaps = await swapDataUrlsForBlobs(canvasEl);
  try {
    return await toPng(canvasEl, {
      cacheBust: true,
      pixelRatio: 1,
      width: dims.w,
      height: dims.h,
      backgroundColor: null
    });
  } finally {
    restoreSrcs(swaps);
  }
}

export function dataUrlToBase64(dataUrl) {
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}
