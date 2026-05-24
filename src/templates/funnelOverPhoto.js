import { el } from '../dom.js';

export const meta = {
  id: 'funnel-over-photo',
  nameHe: 'תוצאה על רקע',
  type: 'frame-multi',
  description: 'רקע תמונה, באדג׳ צבעוני עם הכותרת, סקרינשוט באמצע, שורות הסבר למטה.'
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-funnel' }, [
    el('div', { class: 'tpl-thumb-photo' }),
    el('div', { class: 'tpl-thumb-badge' }, '4 ב 5,000'),
    el('div', { class: 'tpl-thumb-card-mini' }),
    el('div', { class: 'tpl-thumb-lines' })
  ]);
}

export function render({ content, brand }) {
  const bg = content.backgroundUrl || brand.defaultBackgroundUrl;
  const headline = content.headline || '';
  const subHeadline = content.subHeadline || '';
  const imageUrl = content.sourceImageUrl;
  const lines = Array.isArray(content.captionLines) && content.captionLines.length
    ? content.captionLines
    : (content.caption ? [content.caption] : []);

  return el('div', {
    class: 'tpl-canvas tpl-funnel',
    style: { background: bg ? 'url("' + bg + '") center/cover no-repeat' : '#1a1a1a' }
  }, [
    el('div', { class: 'fn-overlay' }),
    el('div', { class: 'fn-headline-wrap' }, [
      headline ? el('div', { class: 'fn-headline', style: { background: brand.primaryColor || '#1F6FB2' } }, headline) : null,
      subHeadline ? el('div', { class: 'fn-subheadline' }, subHeadline) : null
    ]),
    imageUrl
      ? el('div', { class: 'fn-card' }, [
          el('img', { class: 'fn-card-img', src: imageUrl, crossorigin: 'anonymous' })
        ])
      : null,
    el('div', { class: 'fn-lines' },
      lines.map((line) => el('div', { class: 'fn-line' }, line))
    )
  ]);
}
