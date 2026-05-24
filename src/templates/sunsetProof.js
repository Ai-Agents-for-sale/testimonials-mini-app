import { el } from '../dom.js';
import { brandLogo } from '../components/brandLogo.js';

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
  const headline = content.headline || '';
  const statLine = content.statLine || content.caption || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-sunset',
    style: { background: bg ? 'url("' + bg + '") center/cover no-repeat' : '#2a2a2a' }
  }, [
    el('div', { class: 'sp-overlay' }),

    el('div', { class: 'sp-brandtop' }, [
      brandLogo({ brand, className: 'sp-brandtop-logo', textClass: 'sp-brandtop-name', dotClass: 'sp-brandtop-dot', accent })
    ]),

    headline
      ? el('div', { class: 'sp-headline-wrap' }, [el('div', { class: 'sp-headline' }, headline)])
      : null,

    el('div', { class: 'img-card-wrap sp-img-wrap' }, [
      imageUrl
        ? el('div', { class: 'img-card img-card-bright' }, [
            el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
          ])
        : null
    ]),

    statLine
      ? el('div', { class: 'sp-stat-wrap' }, [
          el('div', { class: 'sp-stat', style: { background: primary } }, statLine)
        ])
      : null,

    el('div', { class: 'sp-brand-bottom' }, [
      el('div', { class: 'sp-brand-line', style: { background: accent } }),
      el('div', { class: 'sp-brand-row' }, [
        brandLogo({ brand, className: 'sp-brand-name-logo', textClass: 'sp-brand-name', dotClass: 'sp-brandtop-dot', accent }),
        el('div', { class: 'sp-brand-stars', style: { color: accent } }, '★ ★ ★ ★ ★')
      ])
    ])
  ]);
}
