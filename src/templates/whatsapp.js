import { el } from '../dom.js';

export const meta = {
  id: 'whatsapp',
  nameHe: 'הודעת וואטסאפ',
  type: 'whatsapp',
  description: 'בסגנון מקצועי בהשראת בדיקת גוגל. רקע קרם-ירקרק עם עיגולי צבע, סמליל וואטסאפ למעלה, סטמפ מותג בצד, וצ׳אט וואטסאפ אמיתי במרכז.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת מעל הצ׳אט', default: 'הלקוחות שלנו מספרים.' },
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
  // WhatsApp palette — fixed regardless of brand colors, so the chat
  // chrome stays recognisable as WhatsApp.
  const waHeaderGreen = '#075E54';
  const waMidGreen    = '#128C7E';
  const waBrandGreen  = '#25D366';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial   = (brandName || '?').slice(0, 1);
  const headline  = content.headline;
  const caption   = content.caption;
  const imageUrl  = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-whatsapp' }, [
    // Soft grid pattern background (like Google Review)
    el('div', { class: 'wa-bg-grid' }),
    // WhatsApp-themed color orbs — blurred, decorative
    el('div', { class: 'wa-bg-orbs' }, [
      el('span', { class: 'wa-orb wa-orb-dark',   style: { background: waHeaderGreen } }),
      el('span', { class: 'wa-orb wa-orb-mid',    style: { background: waMidGreen } }),
      el('span', { class: 'wa-orb wa-orb-bright', style: { background: waBrandGreen } }),
      el('span', { class: 'wa-orb wa-orb-soft',   style: { background: '#DCF8C6' } })
    ]),

    // Top row: WhatsApp wordmark LEFT, brand stamp RIGHT
    el('div', { class: 'wa-top-row' }, [
      el('div', { class: 'wa-wordmark' }, [
        // WhatsApp speech-bubble glyph (SVG inline so it stays crisp)
        el('span', { class: 'wa-icon', style: { background: waBrandGreen } }, '✓'),
        el('span', { class: 'wa-wordmark-text', style: { color: waHeaderGreen } }, 'WhatsApp')
      ]),
      el('div', { class: 'wa-brand-stamp', style: { background: waHeaderGreen } }, initial)
    ]),

    // Headline (AI-driven, disappears if cleared)
    headline ? el('div', { class: 'wa-headline-wrap' }, [
      el('div', {
        class: 'wa-headline',
        'data-field': 'headline',
        'data-fit-max': '68', 'data-fit-min': '30'
      }, headline)
    ]) : null,

    // Chat frame — the centerpiece
    el('div', { class: 'wa-chat-frame', 'data-field': 'image' }, [
      // Chat header — generic 'לקוח' name, NOT the brand name
      el('div', { class: 'wa-chat-header', style: { background: waHeaderGreen } }, [
        el('div', { class: 'wa-chat-back' }, '‹'),
        el('div', { class: 'wa-chat-avatar', style: { background: waBrandGreen } }, '👤'),
        el('div', { class: 'wa-chat-meta' }, [
          el('div', { class: 'wa-chat-name' }, 'לקוח'),
          el('div', { class: 'wa-chat-status' }, 'online')
        ]),
        el('div', { class: 'wa-chat-icons' }, '⋯')
      ]),

      // Chat body with the classic WhatsApp cream + doodle wallpaper
      el('div', { class: 'wa-chat-body' }, [
        imageUrl
          ? el('img', { class: 'wa-chat-img', src: imageUrl, crossorigin: 'anonymous' })
          : el('div', { class: 'wa-chat-placeholder' }, 'צילום השיחה')
      ])
    ]),

    // Caption block below the chat — plain serif text, no bubble
    caption ? el('div', {
      class: 'wa-caption',
      'data-field': 'caption',
      'data-fit-max': '32', 'data-fit-min': '18'
    }, caption) : null,

    // Bottom signature — "מתוך שיחה עם {brand}"
    el('div', { class: 'wa-sig' }, [
      el('div', { class: 'wa-sig-rule', style: { background: waBrandGreen } }),
      el('div', { class: 'wa-sig-text' }, [
        el('span', { class: 'wa-sig-prefix' }, 'מתוך שיחה עם'),
        el('span', { class: 'wa-sig-brand', style: { color: waHeaderGreen } }, brandName)
      ])
    ])
  ]);
}
