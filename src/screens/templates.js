import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { TEMPLATES } from '../templates/index.js';
import { getState, setTemplate, resetPostFlow } from '../state.js';

export function templatesScreen({ navigate, goBack }) {
  // Don't blow away brand or folder selection — only per-post state.
  resetPostFlow();

  const state = getState();
  const folderHint = state.selectedFolderName ? ' • ' + state.selectedFolderName : '';

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'header' }, [
      el('button', { class: 'back-btn', onClick: () => { haptic('light'); goBack(); } }, '› חזרה'),
      el('span', { class: 'header-title right' }, 'בחר תבנית' + folderHint)
    ]),
    el('div', { class: 'intro' }, [
      el('div', { class: 'intro-title' }, 'בחר תבנית'),
      el('div', { class: 'intro-sub' }, 'התבנית קובעת איך הסקרינשוט יוצג ואיזה טקסט יוצג סביבו')
    ])
  ]);

  const grid = el('div', { class: 'tpl-grid' });
  root.appendChild(grid);

  TEMPLATES.forEach((tpl) => {
    const card = el('div', { class: 'tpl-card' }, [
      el('div', { class: 'tpl-card-thumb' }, [tpl.thumbnail()]),
      el('div', { class: 'tpl-card-body' }, [
        el('div', { class: 'tpl-card-name' }, tpl.meta.nameHe),
        el('div', { class: 'tpl-card-desc' }, tpl.meta.description)
      ])
    ]);
    card.addEventListener('click', () => {
      haptic('light');
      setTemplate(tpl.meta.id);
      navigate('review');
    });
    grid.appendChild(card);
  });

  return root;
}
