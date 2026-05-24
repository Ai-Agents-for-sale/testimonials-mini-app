import { el } from '../dom.js';

export const meta = {
  id: 'black-proof',
  nameHe: 'הוכחה שחורה',
  type: 'frame',
  description: 'רקע שחור, כותרת זהב, סקרינשוט במסגרת לבנה, חמישה כוכבים, לוגו ושם מותג.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת ראשית (שורה 1)' },
    { key: 'subline',  labelHe: 'כותרת ראשית (שורה 2)' },
    { key: 'caption',  labelHe: 'הערה מתחת לתמונה', multiline: true }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-blackproof' }, [
    el('div', { class: 'tpl-thumb-brandstrip' }),
    el('div', { class: 'tpl-thumb-title' }, 'הנה ההוכחה.'),
    el('div', { class: 'tpl-thumb-stars' }, '★★★★★'),
    el('div', { class: 'tpl-thumb-card' }),
    el('div', { class: 'tpl-thumb-footer' }, 'BRAND')
  ]);
}

export function render({ content, brand, format }) {
  const accent  = brand.accentColor || '#F2C94C';
  const primary = brand.primaryColor || '#1F6FB2';
  const brandName = brand.nameHe || brand.name || 'THE BRAND';
  const headline = content.headline || 'הנה ההוכחה.';
  const subline  = content.subline  || 'בלי פילטרים, בלי טריקים.';
  const caption  = content.caption  || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-blackproof' }, [
    // Top brand strip
    el('div', { class: 'bp-brandstrip' }, [
      brand.logoUrl
        ? el('img', { class: 'bp-brandstrip-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'bp-brandstrip-dot', style: { background: accent } }),
      el('div', { class: 'bp-brandstrip-name' }, brandName)
    ]),
    el('div', { class: 'bp-accent-line', style: { background: accent } }),

    // Headline
    el('div', { class: 'bp-headline' }, [
      el('div', { class: 'bp-line1', style: { color: accent } }, headline),
      el('div', { class: 'bp-line2', style: { color: accent } }, subline)
    ]),

    // Stars
    el('div', { class: 'bp-stars', style: { color: accent } }, '★ ★ ★ ★ ★'),

    // Screenshot card
    el('div', { class: 'bp-card' }, [
      imageUrl
        ? el('img', { class: 'bp-card-img', src: imageUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'bp-card-placeholder' }, 'תמונה')
    ]),

    // Editable caption below the card
    caption ? el('div', { class: 'bp-caption' }, caption) : null,

    // Bottom badge
    el('div', { class: 'bp-bottom' }, [
      el('div', { class: 'bp-accent-line bp-accent-line-bottom', style: { background: accent } }),
      el('div', { class: 'bp-badge', style: { color: accent, borderColor: accent } }, 'VERIFIED  ✦  REVIEW')
    ])
  ]);
}
