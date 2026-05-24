import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { fetchBootstrap } from '../api.js';
import { TEMPLATES } from '../templates/index.js';
import { getState, setBrand, setTemplate, resetFlow } from '../state.js';

export function templatesScreen({ navigate }) {
  resetFlow();

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'topbar' }, [
      el('div', { class: 'topbar-title' }, '⭐ הוכחות לקוחות')
    ]),
    el('div', { class: 'intro' }, [
      el('div', { class: 'intro-title' }, 'בחר תבנית'),
      el('div', { class: 'intro-sub' }, 'התבנית קובעת איך הסקרינשוט יוצג ואיזה טקסט יוצג סביבו')
    ])
  ]);

  const grid = el('div', { class: 'tpl-grid' });
  root.appendChild(grid);

  const loading = el('div', { class: 'loading' }, 'טוען מותג…');
  root.appendChild(loading);

  TEMPLATES.forEach((tpl) => {
    const card = el('div', { class: 'tpl-card' }, [
      el('div', { class: 'tpl-card-thumb' }, [tpl.thumbnail()]),
      el('div', { class: 'tpl-card-body' }, [
        el('div', { class: 'tpl-card-name' }, tpl.meta.nameHe),
        el('div', { class: 'tpl-card-desc' }, tpl.meta.description)
      ])
    ]);
    card.addEventListener('click', () => {
      if (!getState().brand) return;
      haptic('light');
      setTemplate(tpl.meta.id);
      navigate('review');
    });
    grid.appendChild(card);
  });

  fetchBootstrap()
    .then((res) => {
      setBrand(res && res.brand ? res.brand : {});
      loading.classList.add('hidden');
    })
    .catch((err) => {
      loading.textContent = 'שגיאה בטעינת המותג: ' + err.message;
      loading.classList.add('error');
    });

  return root;
}
