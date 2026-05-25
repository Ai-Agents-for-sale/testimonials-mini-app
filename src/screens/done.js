import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { getState, resetPostFlow } from '../state.js';

export function doneScreen({ navigate }) {
  const state = getState();
  const wasScheduled = Boolean(state.scheduleAt);

  const root = el('div', { class: 'screen done-screen' }, [
    el('div', { class: 'done-emoji' }, wasScheduled ? '📅' : '✅'),
    el('div', { class: 'done-title' }, wasScheduled ? 'הפוסט תוזמן בהצלחה' : 'הפוסט נשלח לפרסום'),
    el('div', { class: 'done-sub' }, 'מה עכשיו?'),

    el('div', { class: 'done-actions' }, [
      el('button', {
        class: 'btn btn-primary done-btn',
        onClick: () => {
          haptic('medium');
          resetPostFlow();
          navigate('folders', true);
        }
      }, '🔁 בוא נמשיך — פוסט נוסף'),

      el('button', {
        class: 'btn btn-secondary done-btn',
        onClick: () => {
          haptic('light');
          const tg = window.Telegram && window.Telegram.WebApp;
          if (tg && tg.close) try { tg.close(); } catch (_) {}
        }
      }, '👋 זהו, סיימתי')
    ])
  ]);

  return root;
}
