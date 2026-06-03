// Build a self-contained HTML doc from the rendered template canvas.
// Cloud Run's Puppeteer-based renderer takes this and rasterises it with
// full headless Chromium — no iOS-WebView limits on data URL size, no
// foreignObject quirks. This replaces the html-to-image client-side path.

function collectInlineStyles() {
  const chunks = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        chunks.push(rule.cssText);
      }
    } catch (_e) {
      // CORS-locked sheets (e.g. fonts.googleapis.com) — skip; we re-add
      // the Google Fonts link in the output doc head separately so the
      // server-side render gets the same font set.
    }
  }
  return chunks.join('\n');
}

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  'family=Heebo:wght@200;300;400;500;600;700;800;900&' +
  'family=Frank+Ruhl+Libre:ital,wght@0,300;0,400;0,500;0,700;0,900;1,400&' +
  'family=Suez+One&' +
  'display=swap';

export function buildCanvasHtmlDoc(canvasEl) {
  const canvasHtml = canvasEl.outerHTML;
  const css = collectInlineStyles();
  return [
    '<!doctype html>',
    '<html dir="rtl" lang="he">',
    '<head>',
    '<meta charset="utf-8">',
    `<link href="${GOOGLE_FONTS_HREF}" rel="stylesheet">`,
    '<style>',
    '* { box-sizing: border-box; }',
    'html, body { margin: 0; padding: 0; background: transparent; }',
    css,
    '</style>',
    '</head>',
    '<body>',
    canvasHtml,
    '</body>',
    '</html>'
  ].join('\n');
}
