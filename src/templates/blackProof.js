import { el } from '../dom.js';

export const meta = {
  id: 'black-proof',
  nameHe: 'הוכחה שחורה',
  type: 'frame',
  description: 'רקע שחור, כותרת זהב, סקרינשוט במסגרת לבנה. אגרסיבי ונקי.'
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-blackproof' }, [
    el('div', { class: 'tpl-thumb-title' }, 'הנה ההוכחה.'),
    el('div', { class: 'tpl-thumb-card' }),
    el('div', { class: 'tpl-thumb-footer' }, 'BRAND')
  ]);
}

export function render({ content, brand }) {
  const headline = content.headline || 'הנה ההוכחה.';
  const subline  = content.subline  || 'בלי פילטרים, בלי טריקים.';
  const caption  = content.caption  || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas tpl-blackproof', style: { background: '#000' } }, [
    el('div', { class: 'bp-headline' }, [
      el('div', { class: 'bp-line1', style: { color: brand.accentColor || '#F2C94C' } }, headline),
      el('div', { class: 'bp-line2', style: { color: brand.accentColor || '#F2C94C' } }, subline)
    ]),
    el('div', { class: 'bp-card' }, [
      imageUrl
        ? el('img', { class: 'bp-card-img', src: imageUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'bp-card-placeholder' }, 'תמונה'),
      caption ? el('div', { class: 'bp-card-caption' }, caption) : null
    ]),
    el('div', { class: 'bp-footer' }, [
      brand.logoUrl
        ? el('img', { class: 'bp-footer-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'bp-footer-text' }, brand.nameHe || brand.name || 'THE BRAND')
    ])
  ]);
}
