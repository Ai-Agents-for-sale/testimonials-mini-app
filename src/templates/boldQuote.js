import { el } from '../dom.js';

export const meta = {
  id: 'bold-quote',
  nameHe: 'ציטוט ענק',
  type: 'extract',
  description: 'בלי סקרינשוט. ציטוט גדול מהשיחה, כוכבים, שם הממליץ, ושם המותג בתחתית.',
  editableFields: [
    { key: 'quote',      labelHe: 'הציטוט', multiline: true },
    { key: 'authorName', labelHe: 'שם הממליץ' },
    { key: 'authorRole', labelHe: 'תפקיד/תיאור (אופציונלי)' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-quote' }, [
    el('div', { class: 'tpl-thumb-brandtop' }, 'BRAND'),
    el('div', { class: 'tpl-thumb-quote-mark' }, '"'),
    el('div', { class: 'tpl-thumb-quote-text' }),
    el('div', { class: 'tpl-thumb-stars-row' }, '★★★★★'),
    el('div', { class: 'tpl-thumb-footer' }, '— לקוח')
  ]);
}

export function render({ content, brand, format }) {
  const primary = brand.primaryColor || '#0d1b4b';
  const accent  = brand.accentColor || '#F2C94C';
  const brandName = brand.nameHe || brand.name || 'THE BRAND';
  const quote = content.quote || content.caption || 'המלצה';
  const authorName = content.authorName || '';
  const authorRole = content.authorRole || '';

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-quote',
    style: { background: primary }
  }, [
    // Top brand strip
    el('div', { class: 'bq-brandtop' }, [
      brand.logoUrl
        ? el('img', { class: 'bq-brandtop-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'bq-brandtop-dot', style: { background: accent } }),
      el('div', { class: 'bq-brandtop-name', style: { color: accent } }, brandName)
    ]),

    el('div', { class: 'bq-mark', style: { color: accent } }, '"'),
    el('div', { class: 'bq-quote' }, quote),

    // Stars
    el('div', { class: 'bq-stars', style: { color: accent } }, '★ ★ ★ ★ ★'),
    el('div', { class: 'bq-divider', style: { background: accent } }),

    (authorName || authorRole)
      ? el('div', { class: 'bq-author' }, [
          authorName ? el('div', { class: 'bq-author-name', style: { color: accent } }, '— ' + authorName) : null,
          authorRole ? el('div', { class: 'bq-author-role' }, authorRole) : null
        ])
      : null,

    // Bottom brand band
    el('div', { class: 'bq-brand-bottom', style: { borderColor: accent } }, [
      brand.logoUrl
        ? el('img', { class: 'bq-brand-bottom-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'bq-brand-bottom-text' }, brandName)
    ])
  ]);
}
