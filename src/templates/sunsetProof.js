import { el } from '../dom.js';

export const meta = {
  id: 'sunset-proof',
  nameHe: 'הוכחה אווירתית',
  type: 'frame-stat',
  description: 'רקע אווירה, באדג׳ שחור עם כותרת, סקרינשוט באמצע, באדג׳ צבעוני עם תוצאה מספרית למטה.'
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-sunset' }, [
    el('div', { class: 'tpl-thumb-photo sunset-bg' }),
    el('div', { class: 'tpl-thumb-badge dark' }, 'כוחו של...'),
    el('div', { class: 'tpl-thumb-card-mini' }),
    el('div', { class: 'tpl-thumb-stat' }, '100K+')
  ]);
}

export function render({ content, brand }) {
  const bg = content.backgroundUrl || brand.defaultBackgroundUrl;
  const headline = content.headline || '';
  const statLine = content.statLine || content.caption || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', {
    class: 'tpl-canvas tpl-sunset',
    style: { background: bg ? 'url("' + bg + '") center/cover no-repeat' : '#2a2a2a' }
  }, [
    el('div', { class: 'sp-overlay' }),
    headline
      ? el('div', { class: 'sp-headline-wrap' }, [
          el('div', { class: 'sp-headline' }, headline)
        ])
      : null,
    imageUrl
      ? el('div', { class: 'sp-card' }, [
          el('img', { class: 'sp-card-img', src: imageUrl, crossorigin: 'anonymous' })
        ])
      : null,
    statLine
      ? el('div', { class: 'sp-stat-wrap' }, [
          el('div', { class: 'sp-stat', style: { background: brand.primaryColor || '#1F6FB2' } }, statLine)
        ])
      : null
  ]);
}
