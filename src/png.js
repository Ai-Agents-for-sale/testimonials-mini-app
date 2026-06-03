import { toPng } from 'html-to-image';

// Resolve when this image is loaded — or after `timeoutMs`, so a single
// stuck <img> can't deadlock publish. Never rejects.
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

// Re-encode a data:image/... URL as a JPEG via canvas2d at high quality.
// For a typical phone screenshot, this turns a ~600KB-1MB PNG data URL
// into a ~80-200KB JPEG data URL — small enough to survive iOS WebView's
// SVG <foreignObject> embedding (the rendering path html-to-image uses).
async function shrinkDataUrl(dataUrl) {
  if (!dataUrl.startsWith('data:image/')) return null;
  // Don't bother for already-small data URLs.
  if (dataUrl.length < 100_000) return null;
  return new Promise((resolve) => {
    const probe = new Image();
    const finish = (value) => resolve(value);
    probe.onload = () => {
      try {
        const w = probe.naturalWidth, h = probe.naturalHeight;
        if (!w || !h) return finish(null);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        // White fill — JPEG has no alpha, so transparent backgrounds need
        // a backdrop or they'd come out black. White matches what every
        // testimonial template puts behind the screenshot.
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(probe, 0, 0);
        const jpeg = canvas.toDataURL('image/jpeg', 0.9);
        finish(jpeg && jpeg.length < dataUrl.length ? jpeg : null);
      } catch (_e) {
        finish(null);
      }
    };
    probe.onerror = () => finish(null);
    setTimeout(() => finish(null), 3000);
    probe.src = dataUrl;
  });
}

async function shrinkImagesForSnapshot(rootEl) {
  const swaps = [];
  const imgs = Array.from(rootEl.querySelectorAll('img'));
  for (const img of imgs) {
    const src = img.getAttribute('src') || '';
    const smaller = await shrinkDataUrl(src);
    if (!smaller) continue;
    swaps.push({ img, originalSrc: src });
    img.src = smaller;
    await waitForImage(img);
  }
  return swaps;
}

function restoreSrcs(swaps) {
  swaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });
}

export async function renderCanvasToPng(canvasEl, dims = { w: 1080, h: 1350 }) {
  try { await preloadImages(canvasEl); } catch (_e) {}
  let swaps = [];
  try { swaps = await shrinkImagesForSnapshot(canvasEl); } catch (_e) { swaps = []; }
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
