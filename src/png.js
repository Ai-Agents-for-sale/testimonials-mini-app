import { toPng } from 'html-to-image';

export async function renderCanvasToPng(canvasEl, dims = { w: 1080, h: 1350 }) {
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
