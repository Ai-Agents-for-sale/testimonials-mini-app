import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { fetchBootstrap } from '../api.js';
import { TEMPLATES } from '../templates/index.js';
import { getState, setBrand, setTemplate, resetFlow } from '../state.js';

export function templatesScreen({ navigate }) {
  resetFlow();

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'header' }, [
      el('span', { class: 'header-dot' }),
      el('span', { class: 'header-title' }, 'הוכחות לקוחות'),
      el('span', { class: 'header-badge' }, 'תבניות')
    ]),
    el('div', { class: 'intro' }, [
      el('div', { class: 'intro-title' }, 'בחר תבנית'),
      el('div', { class: 'intro-sub' }, 'התבנית קובעת איך הסקרינשוט יוצג ואיזה טקסט נכתוב סביבו')
    ])
  ]);

  const grid = el('div', { class: 'ts-grid' });
  root.appendChild(grid);

  const loading = el('div', { class: 'ts-loading' }, 'טוען מותג…');
  root.appendChild(loading);

  TEMPLATES.forEach((tpl) => {
    const card = el('div', { class: 'ts-card' }, [
      el('div', { class: 'ts-card-thumb' }, [tpl.thumbnail()]),
      el('div', { class: 'ts-card-body' }, [
        el('div', { class: 'ts-card-name' }, tpl.meta.nameHe),
        el('div', { class: 'ts-card-desc' }, tpl.meta.description)
      ])
    ]);
    card.addEventListener('click', () => {
      const state = getState();
      if (!state.brand) return;
      haptic('light');
      setTemplate(tpl.meta.id);
      navigate('compose');
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
