import { el } from '../dom.js';

export const meta = {
  id: 'whatsapp',
  nameHe: 'הודעת וואטסאפ',
  type: 'whatsapp',
  description: 'אותנטי. רקע קרם בדוגמת וואטסאפ, כותרת מגזין מעל, צ׳אט בסגנון אפליקציה עם הלוגו של המותג כתמונת פרופיל, ושורת חתימה למטה.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת מגזין מעל הצ׳אט', default: 'הלקוחות שלנו מספרים.' },
    { key: 'caption',  labelHe: 'תגובת בעל העסק (בועה ירוקה למטה)', multiline: true, default: 'תודה רבה! כיף לנו לקבל את ההודעה הזו.' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-whatsapp' }, [
    el('div', { class: 'tpl-thumb-wa-headline' }, 'הלקוחות'),
    el('div', { class: 'tpl-thumb-wa-frame' }, [
      el('div', { class: 'tpl-thumb-wa-header' }),
      el('div', { class: 'tpl-thumb-wa-body' })
    ]),
    el('div', { class: 'tpl-thumb-wa-sig' }, '— BRAND')
  ]);
}

export function render({ content, brand, format }) {
  // Always WhatsApp green for the chat UI so it reads as a real WhatsApp
  // screenshot regardless of brand colors.
  const waHeaderGreen = '#075E54';
  const waBubbleGreen = '#DCF8C6';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const headline = content.headline || 'הלקוחות שלנו מספרים.';
  const caption  = content.caption || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-whatsapp' }, [
    el('div', { class: 'wa-bg-pattern' }),

    // Top: editorial-style magazine headline
    el('div', { class: 'wa-top' }, [
      el('div', {
        class: 'wa-top-headline',
        'data-fit-max': '76', 'data-fit-min': '32'
      }, headline),
      el('div', { class: 'wa-top-rule', style: { background: waHeaderGreen } })
    ]),

    // Chat frame
    el('div', { class: 'wa-chat-frame' }, [
      // Chat header — green WhatsApp tab
      el('div', { class: 'wa-chat-header', style: { background: waHeaderGreen } }, [
        el('div', { class: 'wa-chat-back' }, '‹'),
        el('div', { class: 'wa-chat-avatar' }, [
          brand.logoUrl
            ? el('img', { class: 'wa-chat-avatar-img', src: brand.logoUrl, crossorigin: 'anonymous' })
            : el('div', { class: 'wa-chat-avatar-initial', style: { background: '#25D366' } }, initial)
        ]),
        el('div', { class: 'wa-chat-meta' }, [
          el('div', { class: 'wa-chat-name' }, brandName),
          el('div', { class: 'wa-chat-status' }, 'online')
        ]),
        el('div', { class: 'wa-chat-icons' }, '⋯')
      ]),

      // Chat body containing the screenshot
      el('div', { class: 'wa-chat-body' }, [
        imageUrl
          ? el('img', { class: 'wa-chat-img', src: imageUrl, crossorigin: 'anonymous' })
          : el('div', { class: 'wa-chat-placeholder' }, 'צילום השיחה')
      ])
    ]),

    // Outgoing-style green bubble below the chat
    caption ? el('div', { class: 'wa-reply' }, [
      el('div', { class: 'wa-reply-bubble', style: { background: waBubbleGreen } }, [
        el('div', { class: 'wa-reply-tail', style: { background: waBubbleGreen } }),
        el('div', { class: 'wa-reply-label' }, 'התגובה שלנו'),
        el('div', {
          class: 'wa-reply-text',
          'data-fit-max': '26', 'data-fit-min': '16'
        }, caption)
      ])
    ]) : null,

    // Bottom signature line — generic "מתוך שיחה עם לקוח", no rating
    el('div', { class: 'wa-sig' }, [
      el('div', { class: 'wa-sig-line' }, 'מתוך שיחה עם לקוח')
    ])
  ]);
}
