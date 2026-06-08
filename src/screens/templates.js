import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { TEMPLATES } from '../templates/index.js';
import { getState, setTemplate, resetPostFlow } from '../state.js';

export function templatesScreen({ navigate, goBack }) {
  // Don't blow away brand or folder selection — only per-post state.
  resetPostFlow();

  const state = getState();
  const brand = state.brand || {};
  const folderHint = state.selectedFolderName ? ' • ' + state.selectedFolderName : '';

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'header' }, [
      el('button', { class: 'back-btn', onClick: () => { haptic('light'); goBack(); } }, '› חזרה'),
      el('span', { class: 'header-title right' }, 'בחר תבנית' + folderHint)
    ]),
    el('div', { class: 'step-bar' }, [
      el('div', { class: 'step step-done' }, [el('span', { class: 'step-num' }, '1'), el('span', { class: 'step-lbl' }, 'תיקייה')]),
      el('div', { class: 'step-line step-line-done' }),
      el('div', { class: 'step step-current' }, [el('span', { class: 'step-num' }, '2'), el('span', { class: 'step-lbl' }, 'תבנית')]),
      el('div', { class: 'step-line' }),
      el('div', { class: 'step' }, [el('span', { class: 'step-num' }, '3'), el('span', { class: 'step-lbl' }, 'עריכה ופרסום')])
    ]),
    el('div', { class: 'intro' }, [
      el('div', { class: 'intro-title' }, '🎨 איך הפוסט ייראה?'),
      el('div', { class: 'intro-sub' },
        'התבנית קובעת את העיצוב — איפה הצילום, איזה טקסט עוטף אותו, ואיזה צבעים. ' +
        'הצילום שלך יחליף את הצילום-לדוגמה שאת/ה רואה בכל מיניאטורה. בחר/י את הסגנון שמתאים לסוג ההוכחה.')
    ])
  ]);

  const grid = el('div', { class: 'tpl-grid' });
  root.appendChild(grid);

  TEMPLATES.forEach((tpl) => {
    const card = el('div', { class: 'tpl-card' }, [
      el('div', { class: 'tpl-card-thumb' }, [tpl.thumbnail(brand)]),
      el('div', { class: 'tpl-card-body' }, [
        el('div', { class: 'tpl-card-name' }, tpl.meta.nameHe),
        el('div', { class: 'tpl-card-desc' }, tpl.meta.descLong || tpl.meta.description)
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
