import { el } from '../dom.js';

export const meta = {
  id: 'bold-quote',
  nameHe: 'ציטוט מגזין',
  type: 'extract',
  description: 'מינימליסטי. רקע צבע מותג אחיד (התבנית היחידה עם רקע נקי). ציטוט סריף ענקי, מונוגרם בפינה שמאלית-עליונה, חתימת מותג בסריף בפינה ימנית-תחתונה.',
  editableFields: [
    { key: 'quote',      labelHe: 'הציטוט (Suez One איטליק)', multiline: true },
    { key: 'authorName', labelHe: 'שם הממליץ' },
    { key: 'authorRole', labelHe: 'תפקיד/תיאור (אופציונלי)' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-quote' }, [
    el('div', { class: 'tpl-thumb-quote-mono' }, 'B'),
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

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-quote',
    style: { background: primary }
  }, [
    // Top-LEFT monogram circle (single initial)
    el('div', { class: 'bq-mono', style: { borderColor: accent, color: accent } }, initial),

    // Massive opening quote mark
    el('div', { class: 'bq-mark', style: { color: accent } }, '"'),

    // The quote in Suez serif italic
    el('div', { class: 'bq-quote' }, quote),

    // Thin accent rule + author
    (authorName || authorRole) ? el('div', { class: 'bq-author-block' }, [
      el('div', { class: 'bq-author-rule', style: { background: accent } }),
      authorName ? el('div', { class: 'bq-author-name' }, '— ' + authorName) : null,
      authorRole ? el('div', { class: 'bq-author-role' }, authorRole) : null
    ]) : null,

    // Bottom-RIGHT serif signature
    el('div', { class: 'bq-sig' }, [
      el('div', { class: 'bq-sig-rule', style: { background: accent } }),
      el('div', { class: 'bq-sig-name' }, brandName),
      brand.name ? el('div', { class: 'bq-sig-en' }, brand.name.toUpperCase()) : null
    ])
  ]);
}
