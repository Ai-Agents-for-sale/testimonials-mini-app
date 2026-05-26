import { el } from '../dom.js';

export const meta = {
  id: 'whatsapp',
  nameHe: 'הודעת וואטסאפ',
  type: 'whatsapp',
  description: 'אותנטי. רקע קרם בדוגמת וואטסאפ, כותרת מגזין מעל, צ׳אט בסגנון אפליקציה עם הלוגו של המותג כתמונת פרופיל, ושורת חתימה למטה.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת מגזין מעל הצ׳אט' },
    { key: 'caption',  labelHe: 'תגובת בעל העסק (בועה ירוקה למטה)', multiline: true }
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
  const accent  = brand.accentColor || '#25D366';
  const primary = brand.primaryColor || '#075E54';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const headline = content.headline || 'הלקוחות שלנו מספרים.';
  const caption  = content.caption || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-whatsapp' }, [
    // Cream WhatsApp doodle pattern background
    el('div', { class: 'wa-bg-pattern' }),

    // Top: editorial-style magazine headline
    el('div', { class: 'wa-top' }, [
      el('div', { class: 'wa-top-eyebrow' }, 'TESTIMONIAL · עדות אמיתית'),
      el('div', { class: 'wa-top-headline' }, headline),
      el('div', { class: 'wa-top-rule', style: { background: primary } })
    ]),

    // Chat frame
    el('div', { class: 'wa-chat-frame' }, [
      // Chat header — brand logo as the contact avatar, name = brand name
      el('div', { class: 'wa-chat-header', style: { background: primary } }, [
        el('div', { class: 'wa-chat-back' }, '‹'),
        el('div', { class: 'wa-chat-avatar' }, [
          brand.logoUrl
            ? el('img', { class: 'wa-chat-avatar-img', src: brand.logoUrl, crossorigin: 'anonymous' })
            : el('div', { class: 'wa-chat-avatar-initial', style: { background: accent } }, initial)
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

    // Owner reply bubble below the chat
    caption ? el('div', { class: 'wa-reply' }, [
      el('div', { class: 'wa-reply-bubble', style: { background: accent } }, [
        el('div', { class: 'wa-reply-tail', style: { background: accent } }),
        el('div', { class: 'wa-reply-label' }, 'התגובה שלנו'),
        el('div', { class: 'wa-reply-text' }, caption)
      ])
    ]) : null,

    // Bottom signature line — "מתוך שיחה עם {brand}"
    el('div', { class: 'wa-sig' }, [
      el('div', { class: 'wa-sig-line' }, [
        el('span', {}, 'מתוך שיחה עם '),
        el('span', { class: 'wa-sig-brand', style: { color: primary } }, brandName),
        el('span', {}, ' · 5.0'),
        el('span', { class: 'wa-sig-stars', style: { color: accent } }, ' ★★★★★')
      ])
    ])
  ]);
}
