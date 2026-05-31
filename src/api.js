import { getClientInfo } from './telegram.js';

// Single n8n webhook — handles all actions via Switch node on body.action.
const WEBHOOK_URL = 'https://aiagentsforsale.app.n8n.cloud/webhook/testimonials';

async function call(action, body = {}) {
  const info = getClientInfo();
  const payload = { action, ...body, chatId: info.chatId, clientName: info.clientName };

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Webhook responded with ' + res.status);
  return res.json();
}

export async function fetchBootstrap() {
  return call('bootstrap');
}

export async function listFolders() {
  return call('list-folders');
}

// Single-execution variant: returns { brand, folders } in one round-trip
// so the folder-picker screen needs ONE webhook call instead of two.
export async function fetchInit() {
  return call('init');
}

export async function pickRandomImage(folderId, excludeIds = []) {
  return call('pick-image', { folderId, excludeIds });
}

// Single-execution variant: picks the first random image AND generates the
// caption for it in one n8n run. Used on initial review-screen entry so we
// spend one webhook call instead of two. Response shape:
//   { image: {id, imageUrl, mimeType}, content: {...AI fields} }
//   OR { empty: true } if the folder has no images.
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
