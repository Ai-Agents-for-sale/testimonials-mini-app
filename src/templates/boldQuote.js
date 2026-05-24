import { el } from '../dom.js';
import { brandLogo } from '../components/brandLogo.js';

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
  const quote = content.quote || content.caption || 'המלצה';
  const authorName = content.authorName || '';
  const authorRole = content.authorRole || '';

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-quote',
    style: { background: primary }
  }, [
    el('div', { class: 'bq-brandtop' }, [
      brandLogo({ brand, className: 'bq-brandtop-logo', textClass: 'bq-brandtop-name', dotClass: 'bq-brandtop-dot', accent })
    ]),

    el('div', { class: 'bq-mark', style: { color: accent } }, '"'),
    el('div', { class: 'bq-quote' }, quote),

    el('div', { class: 'bq-stars', style: { color: accent } }, '★ ★ ★ ★ ★'),
    el('div', { class: 'bq-divider', style: { background: accent } }),

    (authorName || authorRole)
      ? el('div', { class: 'bq-author' }, [
          authorName ? el('div', { class: 'bq-author-name', style: { color: accent } }, '— ' + authorName) : null,
          authorRole ? el('div', { class: 'bq-author-role' }, authorRole) : null
        ])
      : null,

    el('div', { class: 'bq-brand-bottom', style: { borderColor: accent } }, [
      brandLogo({ brand, className: 'bq-brand-bottom-logo', textClass: 'bq-brand-bottom-text', dotClass: 'bq-brandtop-dot', accent })
    ])
  ]);
}
