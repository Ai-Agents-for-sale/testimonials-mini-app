import { el } from '../dom.js';
import { brandLogo } from '../components/brandLogo.js';

export const meta = {
  id: 'black-proof',
  nameHe: 'הוכחה שחורה',
  type: 'frame',
  description: 'מגזין שחור מהודר. רדיאל כהה, פס מבטא אנכי, סטמפ מותג בפינה הימנית-עליונה, כותרת ענקית ב-Suez One וטקסט עזר בסריף.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת ראשית (Suez One)' },
    { key: 'subline',  labelHe: 'תת-כותרת קצרה' },
    { key: 'caption',  labelHe: 'הערה בסריף מתחת לתמונה', multiline: true }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-blackproof' }, [
    el('div', { class: 'tpl-thumb-blackproof-bar' }),
    el('div', { class: 'tpl-thumb-blackproof-stamp' }, '◆'),
    el('div', { class: 'tpl-thumb-blackproof-headline' }, 'ההוכחה'),
    el('div', { class: 'tpl-thumb-blackproof-card' }),
    el('div', { class: 'tpl-thumb-blackproof-foot' }, '— VERIFIED')
  ]);
}

export function render({ content, brand, format }) {
  const accent  = brand.accentColor || '#F2C94C';
  const headline = content.headline || 'הנה ההוכחה.';
  const subline  = content.subline  || 'בלי פילטרים. בלי תרגילים.';
  const caption  = content.caption  || '';
  const imageUrl = content.sourceImageUrl;
  const brandName = brand.nameHe || brand.name || 'BRAND';

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-blackproof' }, [
    // Background overlay layers — radial vignette + faint noise
    el('div', { class: 'bp-bg-vignette' }),
    el('div', { class: 'bp-bg-noise' }),

    // Vertical accent bar (left edge, full height)
    el('div', { class: 'bp-edge-bar', style: { background: accent } }),

    // Top-right brand stamp — square with logo or initial
    el('div', { class: 'bp-stamp', style: { borderColor: accent } }, [
      brand.logoUrl
        ? el('img', { class: 'bp-stamp-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'bp-stamp-initial', style: { color: accent } }, (brandName || '?').slice(0, 1))
    ]),

    // Top-right tiny serif tag under the stamp
    el('div', { class: 'bp-est-tag' }, 'EST. ' + new Date().getFullYear()),

    // Headline block (Suez display + Heebo subline)
    el('div', { class: 'bp-headline-block' }, [
      el('div', { class: 'bp-headline', style: { color: accent } }, headline),
      el('div', { class: 'bp-subline' }, subline)
    ]),

    // Image — raw, centered, no card
    el('div', { class: 'img-card-wrap bp-img-wrap' }, [
      imageUrl
        ? el('div', { class: 'img-card img-card-bright' }, [
            el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
          ])
        : null
    ]),

    // Serif italic caption
    caption ? el('div', { class: 'bp-caption' }, '"' + caption + '"') : null,

    // Bottom: verified badge + brand serif signature
    el('div', { class: 'bp-foot' }, [
      el('div', { class: 'bp-verified', style: { color: accent } }, [
        el('span', { class: 'bp-check', style: { background: accent } }, '✓'),
        el('span', {}, 'VERIFIED REVIEW')
      ]),
      el('div', { class: 'bp-foot-rule', style: { background: accent } }),
      el('div', { class: 'bp-foot-name' }, brandName)
    ])
  ]);
}
