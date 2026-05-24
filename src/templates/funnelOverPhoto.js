import { el } from '../dom.js';

export const meta = {
  id: 'funnel-over-photo',
  nameHe: 'תוצאה על רקע',
  type: 'frame-multi',
  description: 'רקע תמונה, באדג׳ צבעוני עם הכותרת, סקרינשוט באמצע, שורות הסבר למטה, חתימת מותג.',
  editableFields: [
    { key: 'headline',     labelHe: 'כותרת ראשית' },
    { key: 'subHeadline',  labelHe: 'תת-כותרת (סטטיסטיקה)' },
    { key: 'captionLines', labelHe: 'שורות הסבר (שורה לכל שורה)', multiline: true, linesField: true }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-funnel' }, [
    el('div', { class: 'tpl-thumb-photo' }),
    el('div', { class: 'tpl-thumb-brandtop' }, 'BRAND'),
    el('div', { class: 'tpl-thumb-badge' }, '4 ב 5,000'),
    el('div', { class: 'tpl-thumb-card-mini' }),
    el('div', { class: 'tpl-thumb-lines' })
  ]);
}

function toLines(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split('\n').map((s) => s.trim()).filter(Boolean);
  return [];
}

export function render({ content, brand, format }) {
  const bg = content.backgroundUrl || brand.defaultBackgroundUrl;
  const primary = brand.primaryColor || '#1F6FB2';
  const accent  = brand.accentColor || '#F2C94C';
  const brandName = brand.nameHe || brand.name || 'THE BRAND';
  const headline = content.headline || '';
  const subHeadline = content.subHeadline || '';
  const imageUrl = content.sourceImageUrl;
  const lines = toLines(content.captionLines).length
    ? toLines(content.captionLines)
    : (content.caption ? [content.caption] : []);

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-funnel',
    style: { background: bg ? 'url("' + bg + '") center/cover no-repeat' : '#1a1a1a' }
  }, [
    el('div', { class: 'fn-overlay' }),

    // Top brand watermark
    el('div', { class: 'fn-brandtop' }, [
      brand.logoUrl
        ? el('img', { class: 'fn-brandtop-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'fn-brandtop-dot', style: { background: accent } }),
      el('div', { class: 'fn-brandtop-name' }, brandName)
    ]),

    el('div', { class: 'fn-headline-wrap' }, [
      headline ? el('div', { class: 'fn-headline', style: { background: primary } }, headline) : null,
      subHeadline ? el('div', { class: 'fn-subheadline' }, subHeadline) : null
    ]),

    imageUrl
      ? el('div', { class: 'fn-card' }, [
          el('img', { class: 'fn-card-img', src: imageUrl, crossorigin: 'anonymous' })
        ])
      : null,

    el('div', { class: 'fn-lines' }, lines.map((line) => el('div', { class: 'fn-line' }, line))),

    // Bottom brand signature
    el('div', { class: 'fn-brand-sig' }, [
      el('div', { class: 'fn-brand-line', style: { background: accent } }),
      el('div', { class: 'fn-brand-name' }, brandName)
    ])
  ]);
}
