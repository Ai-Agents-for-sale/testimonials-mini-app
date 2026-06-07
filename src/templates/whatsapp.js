import { el } from '../dom.js';
import { SAMPLE_IMG, SAMPLE } from './_samples.js';

export const meta = {
  id: 'whatsapp',
  nameHe: 'הודעת וואטסאפ',
  type: 'whatsapp',
  description: 'רקע דודל וואטסאפ עם גוון ירוק, התמונה לבדה במרכז, סמליל וואטסאפ למעלה וכיתוב "מתוך שיחה עם לקוח" למטה.',
  descLong: 'מתאים מצוין לצילומי מסך של שיחות וואטסאפ. צבעי וואטסאפ קבועים (לא משתנים עם המותג) — נראה אותנטי וברור.',
  bestFor: 'צילומי וואטסאפ',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת מעל התמונה',  default: 'הלקוחות שלנו מספרים.' },
    { key: 'caption',  labelHe: 'טקסט מתחת לתמונה', multiline: true, default: 'תודה רבה! כיף לנו לקבל את ההודעה הזו.' }
  ]
};

export function thumbnail() {
  // Mini version of the real template: WhatsApp wordmark + headline + a
  // miniature screenshot inside + signature. Uses fixed WA colors (this
  // template intentionally doesn't follow brand colors).
  return el('div', { class: 'mp mp-wa' }, [
    el('div', { class: 'mp-wa-top' }, [
      el('span', { class: 'mp-wa-icon' }, '✓'),
      el('span', { class: 'mp-wa-mark' }, 'WhatsApp')
    ]),
    el('div', { class: 'mp-line mp-line-headline' }, SAMPLE.headline),
    el('div', { class: 'mp-img-wrap' }, [
      el('img', { src: SAMPLE_IMG, alt: '', class: 'mp-img' })
    ]),
    el('div', { class: 'mp-line mp-line-caption' }, SAMPLE.caption),
    el('div', { class: 'mp-wa-sig' }, [
      el('div', { class: 'mp-wa-rule' }),
      el('div', { class: 'mp-wa-sig-text' }, 'מתוך שיחה עם לקוח')
    ])
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
