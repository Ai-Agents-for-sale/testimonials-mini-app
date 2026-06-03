import { el } from '../dom.js';

export const meta = {
  id: 'sunset-proof',
  nameHe: 'הוכחה אווירתית',
  type: 'frame-stat',
  description: 'אווירה חמה. גראדיינט אפרסק על תמונה, רקע נקודות הלפטון, מסגרת מותג מרכזית למעלה, כותרת בסריף איטליק, ומונוגרם עדין בתחתית.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת איטליק (Frank Ruhl)', default: 'כוחו של הסיפור.' },
    { key: 'statLine', labelHe: 'שורת תוצאה תחתונה', multiline: true, default: 'הכניס מעל 100,000 ₪ בחודש הראשון.' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-sunset' }, [
    el('div', { class: 'tpl-thumb-sunset-bg' }),
    el('div', { class: 'tpl-thumb-sunset-frame' }, 'BRAND'),
    el('div', { class: 'tpl-thumb-sunset-headline' }, '...כוחו של'),
    el('div', { class: 'tpl-thumb-sunset-card' }),
    el('div', { class: 'tpl-thumb-sunset-stat' }, '100K+'),
    el('div', { class: 'tpl-thumb-sunset-mono' })
  ]);
}

export function render({ content, brand, format }) {
  const bg = content.backgroundUrl || brand.defaultBackgroundUrl;
  const primary = brand.primaryColor || '#1F6FB2';
  const accent  = brand.accentColor || '#F2C94C';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const headline = content.headline;
  const statLine = content.statLine || content.caption;
  const imageUrl = content.sourceImageUrl;

  // Brand-driven background. If a custom photo bg is provided, use it;
  // otherwise build a gradient from the brand colors: primary (dark) →
  // accent (warm middle) → primary (dark). The overlay underneath stays
  // brand-neutral (just adds a soft vignette + halftone for atmosphere).
  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-sunset',
    style: {
      background: bg
        ? 'url("' + bg + '") center/cover no-repeat'
        : 'linear-gradient(180deg, ' + primary + ' 0%, ' + accent + ' 55%, ' + primary + ' 100%)'
    }
  }, [
    // Soft vignette overlay (brand-neutral — just darkens edges slightly)
    el('div', { class: 'sp-bg-vignette' }),
    // Halftone dot pattern overlay
    el('div', { class: 'sp-bg-halftone' }),

    // Centered top brand frame
    el('div', { class: 'sp-top-frame' }, [
      el('div', { class: 'sp-top-rule', style: { background: accent } }),
      el('div', { class: 'sp-top-brand' }, [
        brand.logoUrl
          ? el('img', { class: 'sp-top-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
          : el('div', { class: 'sp-top-dot', style: { background: accent } }),
        el('div', { class: 'sp-top-name' }, brandName)
      ]),
      el('div', { class: 'sp-top-rule', style: { background: accent } })
    ]),

    headline ? el('div', { class: 'sp-headline-block' }, [
      el('div', {
        class: 'sp-headline',
        'data-fit-max': '84', 'data-fit-min': '34'
      }, headline)
    ]) : null,

    // Image — raw, centered
    el('div', { class: 'img-card-wrap sp-img-wrap' }, [
      imageUrl
        ? el('div', { class: 'img-card img-card-bright' }, [
            el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
          ])
        : null
    ]),

    // Stat block — Suez display number above + serif description
    statLine ? el('div', { class: 'sp-stat-block' }, [
      el('div', {
        class: 'sp-stat-text',
        'data-fit-max': '56', 'data-fit-min': '24'
      }, statLine)
    ]) : null,

    // Bottom minimalist monogram circle (just the initial)
    el('div', { class: 'sp-mono-wrap' }, [
      el('div', { class: 'sp-mono', style: { borderColor: accent, color: accent } }, initial)
    ])
  ]);
}
