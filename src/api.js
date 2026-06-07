import { getClientInfo } from './telegram.js';
import { setBrandLogo } from './state.js';

// Single n8n webhook entry. After the first call the workflow pauses at a
// Wait node and returns $execution.resumeUrl in its response body. Every
// subsequent call hits that resumeUrl, so the entire session runs inside
// ONE n8n execution (DB lookups happen once, branches loop back to Wait).
const WEBHOOK_URL = 'https://aiagentsforsale.app.n8n.cloud/webhook/testimonials';

// Module-level. The first call uses WEBHOOK_URL. As soon as a response
// contains resumeUrl we swap to it for all subsequent calls. resetSession()
// (called from the folder-picker screen on app open) rewinds back to the
// webhook so a new session starts cleanly.
let activeUrl = WEBHOOK_URL;

export function resetSession() {
  activeUrl = WEBHOOK_URL;
}

function urlIsValid(u) {
  if (typeof u !== 'string' || !u) return false;
  try { new URL(u); return true; } catch (_) { return false; }
}

async function call(action, body = {}) {
  try {
    return await _callInner(action, body);
  } catch (e) {
    // Final safety net: any error escapes wrapped with action context, no
    // matter where in call()'s body it originated.
    if (e && typeof e.message === 'string' && e.message.indexOf('[' + action + ']') !== -1) throw e;
    throw new Error((e && e.message ? e.message : String(e)) + ' [call ' + action + ']');
  }
}

async function _callInner(action, body = {}) {
  let info;
  try { info = getClientInfo(); } catch (e) {
    throw new Error('pre-fetch getClientInfo: ' + (e.message || e) + ' [' + action + ']');
  }
  const payload = { action, ...body, chatId: info.chatId, clientName: info.clientName };

  // Defensive: if activeUrl was somehow corrupted (stale, blank, weird
  // chars), fetch will throw "The string did not match the expected
  // pattern" before doing anything useful. Detect that BEFORE the fetch
  // and fall back to the entry webhook so the user can at least retry.
  if (!urlIsValid(activeUrl)) {
    console.warn('[api] activeUrl invalid, resetting to entry webhook. was:', JSON.stringify(activeUrl));
    activeUrl = WEBHOOK_URL;
  }
  const url = activeUrl;
  console.log('[api] →', action, url.slice(0, 100));

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (fetchErr) {
    console.error('[api] fetch threw for', action, '. URL was:', url, 'err:', fetchErr);
    if (fetchErr && /string|pattern|URL|Invalid/i.test(String(fetchErr.message || fetchErr))) {
      activeUrl = WEBHOOK_URL;
    }
    // Surface the URL prefix in the error message so we can debug from a
    // screenshot when Web Inspector isn't available.
    const tail = url.replace(/^https?:\/\/[^/]+/, '').slice(0, 50);
    throw new Error('fetch: ' + (fetchErr && fetchErr.message ? fetchErr.message : String(fetchErr)) + ' [' + action + ' ' + tail + ']');
  }

  // Any non-2xx response from a Wait URL means the session is broken:
  //   409 → URL already consumed (race / duplicate POST)
  //   410 → URL expired (n8n killed the execution)
  //   404 → execution ended, URL gone
  //   5xx → n8n internal error mid-chain → Respond never fired
  // In every case the OLD Wait URL is unusable. Reset to the entry webhook
  // so the very next call starts a fresh execution from init.
  if (!res.ok && url !== WEBHOOK_URL) {
    activeUrl = WEBHOOK_URL;
    throw new Error('session expired (HTTP ' + res.status + ') — please retry [' + action + ']');
  }
  if (!res.ok) throw new Error('HTTP ' + res.status + ' [' + action + ']');
  const json = await res.json();

  // If this response carried a resumeUrl, switch to it. publish responses
  // omit it (execution ends), in which case we keep using the prior URL —
  // it doesn't matter because the session is over.
  if (json && typeof json.resumeUrl === 'string' && json.resumeUrl) {
    activeUrl = json.resumeUrl;
  }

  // Late-arriving brand logo (init now ships sans logo to surface folders
  // faster; review-start piggybacks the logoUrl once n8n's post-respond
  // logo chain finishes). Any response carrying it gets merged in.
  if (json && typeof json.logoUrl === 'string' && json.logoUrl) {
    setBrandLogo(json.logoUrl);
  }

  return json;
}

export async function fetchBootstrap() {
  return call('bootstrap');
}

export async function listFolders() {
  return call('list-folders');
}

// Session entry: returns { brand, folders, resumeUrl } in one round-trip.
// After this call activeUrl is the resumeUrl for the rest of the session.
export async function fetchInit() {
  return call('init');
}

export async function pickRandomImage(folderId, excludeIds = []) {
  return call('pick-image', { folderId, excludeIds });
}

// Picks the first random image AND generates the caption for it inside the
// same n8n iteration. Response shape:
//   { image: {id, imageUrl, mimeType}, content: {...AI fields}, resumeUrl }
//   OR { empty: true, resumeUrl } if the folder has no images.
export async function fetchReviewStart({ folderId, templateId, templateType }) {
  return call('review-start', { folderId, templateId, templateType });
}

export async function listImages(folderId) {
  if (!folderId) throw new Error('listImages: missing folderId');
  return call('list-images', { folderId });
}

// Ship a batch of compressed images to the chosen Drive folder in ONE n8n
// call. images is [{name, dataUrl}] where dataUrl is data:image/jpeg;base64,…
// n8n decodes each, writes it to Drive, returns once all are uploaded.
export async function uploadImagesToFolder(folderId, images) {
  return call('upload-to-folder', { folderId, images });
}

export async function generateCaption({ imageId, imageUrl, templateId, templateType, regenerate }) {
  return call('caption', {
    imageId,
    imageUrl,
    templateId,
    templateType,
    regenerate: Boolean(regenerate)
  });
}

// Server-side rendering: we ship the canvas HTML + viewport dims to n8n,
// which forwards to the Cloud Run / Puppeteer renderer. No more in-browser
// PNG rasterisation, no more iOS WebView limits on data URL size.
export async function submitFinal({ html, viewportWidth, viewportHeight, caption, headline, templateId, format, sourceImageId, scheduleAt }) {
  return call('publish', {
    html,
    viewportWidth,
    viewportHeight,
    caption,
    headline,
    templateId,
    format: format || 'feed',
    sourceImageId,
    scheduleAt: scheduleAt || null
  });
}
