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
  const info = getClientInfo();
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
  return call('list-images', { folderId });
}

// Ask n8n for a Cloudinary upload signature; FE uses it to push images
// directly to Cloudinary (no base64-through-webhook). Returns:
//   { cloudName, apiKey, uploadUrl, folder, timestamp, signature, resumeUrl }
export async function getCloudinaryUploadSignature() {
  return call('get-upload-sig');
}

// After all images have been pushed to Cloudinary by the FE, hand n8n the
// list of resulting URLs. n8n downloads each one and writes it into the
// chosen Drive folder.
//   uploads: [{ url, name }]
export async function uploadImagesToFolder(folderId, uploads) {
  return call('upload-to-folder', { folderId, urls: uploads });
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
