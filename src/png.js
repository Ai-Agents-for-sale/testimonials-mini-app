import { toPng } from 'html-to-image';

export async function renderCanvasToPng(canvasEl) {
  return toPng(canvasEl, {
    cacheBust: true,
    pixelRatio: 1,
    width: 1080,
    height: 1350,
    backgroundColor: null
  });
}

export function dataUrlToBase64(dataUrl) {
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}
