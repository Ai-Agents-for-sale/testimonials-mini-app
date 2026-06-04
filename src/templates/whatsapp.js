import { el } from '../dom.js';

export const meta = {
  id: 'whatsapp',
  nameHe: 'הודעת וואטסאפ',
  type: 'whatsapp',
  description: 'אותנטי. רקע לבן עם מסגרת טלפון, צ׳אט וואטסאפ אמיתי עם רקע הדודל הקלאסי, כותרת מעל וטקסט תחתון.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת מעל הצ׳אט (Suez One)', default: 'הלקוחות שלנו מספרים.' },
    { key: 'caption',  labelHe: 'טקסט מתחת לצ׳אט', multiline: true, default: 'תודה רבה! כיף לנו לקבל את ההודעה הזו.' }
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
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const headline = content.headline;
  const caption  = content.caption;
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-whatsapp' }, [
    // Top: editorial-style Suez headline (AI-driven, disappears if cleared)
    headline ? el('div', { class: 'wa-top' }, [
      el('div', {
        class: 'wa-top-headline',
        'data-field': 'headline',
        'data-fit-max': '76', 'data-fit-min': '32'
      }, headline),
      el('div', { class: 'wa-top-rule', style: { background: waHeaderGreen } })
    ]) : null,

    // Chat frame (the "phone")
    el('div', { class: 'wa-chat-frame', 'data-field': 'image' }, [
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

      el('div', { class: 'wa-chat-body' }, [
        imageUrl
          ? el('img', { class: 'wa-chat-img', src: imageUrl, crossorigin: 'anonymous' })
          : el('div', { class: 'wa-chat-placeholder' }, 'צילום השיחה')
      ])
    ]),

    // Caption block below the chat — plain multi-line text, no bubble
    caption ? el('div', {
      class: 'wa-caption',
      'data-field': 'caption',
      'data-fit-max': '32', 'data-fit-min': '18'
    }, caption) : null,

    // Bottom signature — generic
    el('div', { class: 'wa-sig' }, [
      el('div', { class: 'wa-sig-line' }, 'מתוך שיחה עם לקוח')
    ])
  ]);
}
