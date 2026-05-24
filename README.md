# Testimonials Mini App

Telegram Mini App that turns client testimonial screenshots into
1080×1350 Instagram-ready posts via an n8n backend.

Standalone — does NOT live inside the welcome_app repo.

## Flow

1. Templates screen → pick one of 4 templates (Black Proof, Funnel Over Photo, Sunset Proof, Bold Quote)
2. Compose screen → app pulls a random testimonial image from your Drive folder. Re-roll or upload manually.
3. Review screen → live preview with AI-generated Hebrew caption, editable inline, regenerate, publish now or schedule.

Final image is rendered client-side via `html-to-image` and POSTed as base64 to a single n8n webhook.

## n8n side

Workflow: `AI Pipeline - Testimonials` on the user's n8n cloud.
Single webhook `/webhook/testimonials` routed by `body.action`:
- `bootstrap` → returns brand config
- `pick-image` → returns one random Drive image as `data:` URL
- `caption` → OpenAI vision (JSON mode) → structured Hebrew JSON
- `publish` → responds 200 immediately → waits if scheduled → uploads to Drive + sends to Telegram channel

The same workflow has a Telegram Trigger that replies to any message with a `web_app` button launching this mini app.

## Develop

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # outputs dist/
```

## Deploy

`.github/workflows/deploy.yml` builds + deploys to GitHub Pages on push to `main`.
