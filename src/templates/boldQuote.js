import { el } from '../dom.js';

export const meta = {
  id: 'bold-quote',
  nameHe: 'ציטוט מגזין',
  type: 'extract',
  description: 'מינימליסטי. רקע צבע מותג אחיד (התבנית היחידה עם רקע נקי). תמונה ממורכזת, ציטוט סריף ענקי מתחת, מונוגרם בפינה ימנית-עליונה, חתימה בפינה ימנית-תחתונה.',
  editableFields: [
    { key: 'quote',      labelHe: 'הציטוט (Suez One איטליק)', multiline: true, default: 'השירות הכי טוב שקיבלתי. ממליצה בחום!' },
    { key: 'authorName', labelHe: 'שם הממליץ', default: 'שיר כהן' },
    { key: 'authorRole', labelHe: 'תפקיד/תיאור (אופציונלי)', default: 'לקוחה' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-quote' }, [
    el('div', { class: 'tpl-thumb-quote-mono' }, 'B'),
    el('div', { class: 'tpl-thumb-quote-card' }),
    el('div', { class: 'tpl-thumb-quote-mark' }, '"'),
    el('div', { class: 'tpl-thumb-quote-text' }),
    el('div', { class: 'tpl-thumb-quote-author' }, '— שם'),
    el('div', { class: 'tpl-thumb-quote-sig' }, 'BRAND')
  ]);
}

export function render({ content, brand, format }) {
  const primary = brand.primaryColor || '#0d1b4b';
  const accent  = brand.accentColor || '#F2C94C';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const quote = content.quote || content.caption || 'המלצה';
  const authorName = content.authorName || '';
  const authorRole = content.authorRole || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-quote',
    style: { background: primary }
  }, [
    // Top-RIGHT monogram circle (single initial)
    el('div', { class: 'bq-mono', style: { borderColor: accent, color: accent } }, initial),

    // Image — centered above the quote
    imageUrl ? el('div', { class: 'img-card-wrap bq-img-wrap' }, [
      el('div', { class: 'img-card img-card-bright' }, [
        el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
      ])
    ]) : null,

    // Opening quote mark (smaller now that the image is the centerpiece)
    el('div', { class: 'bq-mark', style: { color: accent } }, '"'),

    // The quote in Suez serif italic
    el('div', {
      class: 'bq-quote',
      'data-fit-max': '60', 'data-fit-min': '26'
    }, quote),

    // Thin accent rule + author
    (authorName || authorRole) ? el('div', { class: 'bq-author-block' }, [
      el('div', { class: 'bq-author-rule', style: { background: accent } }),
      authorName ? el('div', {
        class: 'bq-author-name',
        'data-fit-max': '32', 'data-fit-min': '18'
      }, '— ' + authorName) : null,
      authorRole ? el('div', {
        class: 'bq-author-role',
        'data-fit-max': '20', 'data-fit-min': '14'
      }, authorRole) : null
    ]) : null,

    // Bottom-RIGHT serif signature
    el('div', { class: 'bq-sig' }, [
      el('div', { class: 'bq-sig-rule', style: { background: accent } }),
      el('div', { class: 'bq-sig-name' }, brandName),
      brand.name ? el('div', { class: 'bq-sig-en' }, brand.name.toUpperCase()) : null
    ])
  ]);
}
