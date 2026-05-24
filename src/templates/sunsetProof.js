import { el } from '../dom.js';

export const meta = {
  id: 'sunset-proof',
  nameHe: 'הוכחה אווירתית',
  type: 'frame-stat',
  description: 'רקע אווירה, באדג׳ שחור עם כותרת, סקרינשוט באמצע, באדג׳ צבעוני עם תוצאה מספרית, חתימת מותג למטה.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת ראשית' },
    { key: 'statLine', labelHe: 'שורת תוצאה תחתונה', multiline: true }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-sunset' }, [
    el('div', { class: 'tpl-thumb-photo sunset-bg' }),
    el('div', { class: 'tpl-thumb-brandtop' }, 'BRAND'),
    el('div', { class: 'tpl-thumb-badge dark' }, 'כוחו של...'),
    el('div', { class: 'tpl-thumb-card-mini' }),
    el('div', { class: 'tpl-thumb-stat' }, '100K+')
  ]);
}

export function render({ content, brand, format }) {
  const bg = content.backgroundUrl || brand.defaultBackgroundUrl;
  const primary = brand.primaryColor || '#1F6FB2';
  const accent  = brand.accentColor || '#F2C94C';
  const brandName = brand.nameHe || brand.name || 'THE BRAND';
  const headline = content.headline || '';
  const statLine = content.statLine || content.caption || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-sunset',
    style: { background: bg ? 'url("' + bg + '") center/cover no-repeat' : '#2a2a2a' }
  }, [
    el('div', { class: 'sp-overlay' }),

    // Top brand pill
    el('div', { class: 'sp-brandtop' }, [
      brand.logoUrl
        ? el('img', { class: 'sp-brandtop-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'sp-brandtop-dot', style: { background: accent } }),
      el('div', { class: 'sp-brandtop-name' }, brandName)
    ]),

    headline
      ? el('div', { class: 'sp-headline-wrap' }, [
          el('div', { class: 'sp-headline' }, headline)
        ])
      : null,

    imageUrl
      ? el('div', { class: 'sp-card' }, [
          el('img', { class: 'sp-card-img', src: imageUrl, crossorigin: 'anonymous' })
        ])
      : null,

    statLine
      ? el('div', { class: 'sp-stat-wrap' }, [
          el('div', { class: 'sp-stat', style: { background: primary } }, statLine)
        ])
      : null,

    // Bottom brand strip
    el('div', { class: 'sp-brand-bottom' }, [
      el('div', { class: 'sp-brand-line', style: { background: accent } }),
      el('div', { class: 'sp-brand-row' }, [
        el('div', { class: 'sp-brand-name' }, brandName),
        el('div', { class: 'sp-brand-stars', style: { color: accent } }, '★ ★ ★ ★ ★')
      ])
    ])
  ]);
}
