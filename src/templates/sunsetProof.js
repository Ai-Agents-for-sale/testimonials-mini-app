import { el } from '../dom.js';
import { SAMPLE_IMG, SAMPLE, SAMPLE_BRAND_NAME, SAMPLE_INITIAL } from './_samples.js';

export const meta = {
  id: 'sunset-proof',
  nameHe: 'הוכחה אווירתית',
  type: 'frame-stat',
  description: 'אווירה חמה. גראדיינט אפרסק על תמונה, רקע נקודות הלפטון, מסגרת מותג מרכזית למעלה, כותרת בסריף איטליק, ומונוגרם עדין בתחתית.',
  descLong: 'גראדיאנט חם בצבעי המותג כרקע. כותרת איטליק עוטפת. בתחתית — מונוגרם נקי. רך, מסוגנן, פחות "אגרסיבי" מהשאר. נראה כמו פוסט פרימיום.',
  bestFor: 'תוכן רגשי / סיפור',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת איטליק (Frank Ruhl)', default: 'כוחו של הסיפור.' },
    { key: 'statLine', labelHe: 'שורת תוצאה תחתונה', multiline: true, default: 'הכניס מעל 100,000 ₪ בחודש הראשון.' }
  ]
};

export function thumbnail(brand) {
  const primary = (brand && brand.primaryColor) || '#1F6FB2';
  const accent  = (brand && brand.accentColor)  || '#F2C94C';
  const brandName = SAMPLE_BRAND_NAME;
  return el('div', {
    class: 'mp mp-sunset',
    style: { background: 'linear-gradient(180deg, ' + primary + ' 0%, ' + accent + ' 55%, ' + primary + ' 100%)' }
  }, [
    el('div', { class: 'mp-sunset-frame' }, [
      el('div', { class: 'mp-sunset-rule', style: { background: accent } }),
      el('span', { class: 'mp-sunset-name' }, brandName),
      el('div', { class: 'mp-sunset-rule', style: { background: accent } })
    ]),
    el('div', { class: 'mp-sunset-headline' }, SAMPLE.headline + '.'),
    el('div', { class: 'mp-img-wrap mp-img-wrap-sm' }, [
      el('img', { src: SAMPLE_IMG, alt: '', class: 'mp-img' })
    ]),
    el('div', { class: 'mp-sunset-stat' }, SAMPLE.statHead + ' ' + SAMPLE.statSub),
    el('div', { class: 'mp-sunset-mono', style: { borderColor: accent, color: accent } }, SAMPLE_INITIAL)
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
        el('div', { class: 'sp-top-dot', style: { background: accent } }),
        el('div', { class: 'sp-top-name' }, brandName)
      ]),
      el('div', { class: 'sp-top-rule', style: { background: accent } })
    ]),

    headline ? el('div', { class: 'sp-headline-block' }, [
      el('div', {
        class: 'sp-headline',
        'data-field': 'headline',
        'data-fit-max': '84', 'data-fit-min': '34'
      }, headline)
    ]) : null,

    // Image — raw, centered
    el('div', { class: 'img-card-wrap sp-img-wrap', 'data-field': 'image' }, [
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
        'data-field': 'statLine',
        'data-fit-max': '56', 'data-fit-min': '24'
      }, statLine)
    ]) : null,

    // Bottom minimalist monogram circle (just the initial)
    el('div', { class: 'sp-mono-wrap' }, [
      el('div', { class: 'sp-mono', style: { borderColor: accent, color: accent } }, initial)
    ])
  ]);
}
