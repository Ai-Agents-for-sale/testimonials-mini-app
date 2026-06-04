import { el } from '../dom.js';

export const meta = {
  id: 'whatsapp',
  nameHe: 'הודעת וואטסאפ',
  type: 'whatsapp',
  description: 'רקע דודל וואטסאפ עם גוון ירוק, התמונה לבדה במרכז, סמליל וואטסאפ למעלה וכיתוב "מתוך שיחה עם לקוח" למטה.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת מעל התמונה',  default: 'הלקוחות שלנו מספרים.' },
    { key: 'caption',  labelHe: 'טקסט מתחת לתמונה', multiline: true, default: 'תודה רבה! כיף לנו לקבל את ההודעה הזו.' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-whatsapp' }, [
    el('div', { class: 'tpl-thumb-wa-headline' }, 'הלקוחות'),
    el('div', { class: 'tpl-thumb-wa-frame' }, [
      el('div', { class: 'tpl-thumb-wa-body' })
    ]),
    el('div', { class: 'tpl-thumb-wa-sig' }, 'מתוך שיחה עם לקוח')
  ]);
}

export function render({ content, format }) {
  const waHeaderGreen = '#075E54';
  const waBrandGreen  = '#25D366';
  const headline = content.headline;
  const caption  = content.caption;
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-whatsapp' }, [
    // Top row: WhatsApp wordmark only (centered).
    el('div', { class: 'wa-top-row' }, [
      el('div', { class: 'wa-wordmark' }, [
        el('span', { class: 'wa-icon', style: { background: waBrandGreen } }, '✓'),
        el('span', { class: 'wa-wordmark-text', style: { color: waHeaderGreen } }, 'WhatsApp')
      ])
    ]),

    // Optional AI headline (disappears if cleared).
    headline ? el('div', { class: 'wa-headline-wrap' }, [
      el('div', {
        class: 'wa-headline',
        'data-field': 'headline',
        'data-fit-max': '68', 'data-fit-min': '30'
      }, headline)
    ]) : null,

    // Image alone, centered on the doodle background — no chat frame.
    el('div', { class: 'wa-image-wrap', 'data-field': 'image' }, [
      imageUrl
        ? el('img', { class: 'wa-image', src: imageUrl, crossorigin: 'anonymous' })
        : el('div', { class: 'wa-image-placeholder' }, 'צילום השיחה')
    ]),

    // Optional AI caption (disappears if cleared).
    caption ? el('div', {
      class: 'wa-caption',
      'data-field': 'caption',
      'data-fit-max': '32', 'data-fit-min': '18'
    }, caption) : null,

    // Bottom signature — generic, ~50% larger than before.
    el('div', { class: 'wa-sig' }, [
      el('div', { class: 'wa-sig-rule', style: { background: waBrandGreen } }),
      el('div', { class: 'wa-sig-text' }, 'מתוך שיחה עם לקוח')
    ])
  ]);
}
