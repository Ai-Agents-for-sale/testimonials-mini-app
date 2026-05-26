import { el } from '../dom.js';

export const meta = {
  id: 'funnel-over-photo',
  nameHe: 'תוצאה על רקע',
  type: 'frame-multi',
  description: 'מגזין נועז על רקע תמונה. סרט אלכסוני בפינה שמאל-עליונה, כותרת ענקית, חלוקה אלכסונית, ושורות הסבר במשקלים מעורבים.',
  editableFields: [
    { key: 'headline',     labelHe: 'מספר/סטטיסטיקה ענקית (Suez One)' },
    { key: 'subHeadline',  labelHe: 'תת-כותרת תיאורית' },
    { key: 'captionLines', labelHe: 'שורות הסבר (שורה לכל שורה)', multiline: true, linesField: true }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-funnel' }, [
    el('div', { class: 'tpl-thumb-funnel-photo' }),
    el('div', { class: 'tpl-thumb-funnel-ribbon' }, 'BRAND'),
    el('div', { class: 'tpl-thumb-funnel-stat' }, '100K'),
    el('div', { class: 'tpl-thumb-funnel-pills' })
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
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const headline = content.headline || '100K ₪';
  const subHeadline = content.subHeadline || 'בחודש הראשון';
  const imageUrl = content.sourceImageUrl;
  const lines = toLines(content.captionLines).length
    ? toLines(content.captionLines)
    : (content.caption ? [content.caption] : []);

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-funnel',
    style: { background: bg ? 'url("' + bg + '") center/cover no-repeat' : 'linear-gradient(135deg, #1a2540 0%, #0d1320 100%)' }
  }, [
    // Diagonal gradient overlay — angled split for editorial feel
    el('div', { class: 'fn-bg-diagonal' }),
    el('div', { class: 'fn-bg-vignette' }),

    // Top-LEFT diagonal ribbon banner with brand name
    el('div', { class: 'fn-ribbon', style: { background: accent } }, [
      brand.logoUrl
        ? el('img', { class: 'fn-ribbon-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('span', { class: 'fn-ribbon-text' }, brandName)
    ]),

    // Headline block — massive Suez display stat + serif italic subline
    el('div', { class: 'fn-headline-block' }, [
      headline ? el('div', { class: 'fn-headline-num' }, headline) : null,
      subHeadline ? el('div', { class: 'fn-headline-sub' }, subHeadline) : null,
      // Decorative diagonal line under headline
      el('div', { class: 'fn-headline-rule', style: { background: accent } })
    ]),

    // Image — raw, centered, no card
    el('div', { class: 'img-card-wrap fn-img-wrap' }, [
      imageUrl
        ? el('div', { class: 'img-card img-card-bright' }, [
            el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
          ])
        : null
    ]),

    // Mixed-weight pill stack
    el('div', { class: 'fn-pills' },
      lines.map((line, i) => el('div', {
        class: 'fn-pill ' + (i % 2 === 0 ? 'fn-pill-light' : 'fn-pill-bold')
      }, line))
    ),

    // Bottom-right serif signature with thin rule
    el('div', { class: 'fn-sig' }, [
      el('div', { class: 'fn-sig-rule', style: { background: accent } }),
      el('div', { class: 'fn-sig-name' }, brandName),
      el('div', { class: 'fn-sig-en' }, (brand.name || '').toUpperCase())
    ])
  ]);
}
