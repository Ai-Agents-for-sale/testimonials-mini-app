import { el } from '../dom.js';

export const meta = {
  id: 'bold-quote',
  nameHe: 'ציטוט ענק',
  type: 'extract',
  description: 'בלי סקרינשוט. AI חולץ את הציטוט מהשיחה ומציג אותו כטיפוגרפיה דרמטית.'
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-quote' }, [
    el('div', { class: 'tpl-thumb-quote-mark' }, '"'),
    el('div', { class: 'tpl-thumb-quote-text' }),
    el('div', { class: 'tpl-thumb-footer' }, '— לקוח')
  ]);
}

export function render({ content, brand }) {
  const quote = content.quote || content.caption || 'המלצה';
  const authorName = content.authorName || '';
  const authorRole = content.authorRole || '';

  return el('div', {
    class: 'tpl-canvas tpl-quote',
    style: { background: brand.primaryColor || '#000' }
  }, [
    el('div', { class: 'bq-mark', style: { color: brand.accentColor || '#F2C94C' } }, '"'),
    el('div', { class: 'bq-quote', style: { color: '#fff' } }, quote),
    (authorName || authorRole)
      ? el('div', { class: 'bq-author' }, [
          authorName ? el('div', { class: 'bq-author-name', style: { color: brand.accentColor || '#F2C94C' } }, '— ' + authorName) : null,
          authorRole ? el('div', { class: 'bq-author-role' }, authorRole) : null
        ])
      : null,
    el('div', { class: 'bq-brand' }, [
      brand.logoUrl
        ? el('img', { class: 'bq-brand-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'bq-brand-text' }, brand.nameHe || brand.name || '')
    ])
  ]);
}
