import { getClientInfo } from './telegram.js';

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

async function call(action, body = {}) {
  const info = getClientInfo();
  const payload = { action, ...body, chatId: info.chatId, clientName: info.clientName };
  const url = activeUrl;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Webhook responded with ' + res.status);
  const json = await res.json();

  // If this response carried a resumeUrl, switch to it. publish responses
  // omit it (execution ends), in which case we keep using the prior URL —
  // it doesn't matter because the session is over.
  if (json && typeof json.resumeUrl === 'string' && json.resumeUrl) {
    activeUrl = json.resumeUrl;
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

export async function generateCaption({ imageId, imageUrl, templateId, templateType, regenerate }) {
  return call('caption', {
    imageId,
    imageUrl,
    templateId,
    templateType,
    regenerate: Boolean(regenerate)
  });
}

export async function submitFinal({ imageBase64, caption, headline, templateId, format, sourceImageId, scheduleAt }) {
  return call('publish', {
    imageBase64,
    caption,
    headline,
    templateId,
    format: format || 'feed',
    sourceImageId,
    scheduleAt: scheduleAt || null
  });
}
