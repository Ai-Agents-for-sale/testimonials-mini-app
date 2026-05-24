import { getClientInfo } from './telegram.js';

// Single n8n webhook — handles all 4 actions (bootstrap | pick-image | caption | publish)
// via Switch node on body.action.
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

export async function pickRandomImage(excludeIds = []) {
  return call('pick-image', { excludeIds });
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

export async function submitFinal({ imageBase64, caption, headline, templateId, sourceImageId, scheduleAt }) {
  return call('publish', {
    imageBase64,
    caption,
    headline,
    templateId,
    sourceImageId,
    scheduleAt: scheduleAt || null
  });
}
