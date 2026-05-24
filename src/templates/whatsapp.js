import { el } from '../dom.js';
import { brandLogo } from '../components/brandLogo.js';

export const meta = {
  id: 'whatsapp',
  nameHe: 'הודעת וואטסאפ',
  type: 'whatsapp',
  description: 'מותאם לצילומי וואטסאפ — מסגרת צ׳אט בסגנון אפליקציה, צבעי וואטסאפ, מסגרת ירוקה ומותג.',
  editableFields: [
    { key: 'headline', labelHe: 'כותרת ראשית' },
    { key: 'caption',  labelHe: 'הערה תחתונה (תגובת בעל העסק)', multiline: true }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-whatsapp' }, [
    el('div', { class: 'tpl-thumb-wa-header' }),
    el('div', { class: 'tpl-thumb-wa-pattern' }, [
      el('div', { class: 'tpl-thumb-card-mini' })
    ]),
    el('div', { class: 'tpl-thumb-footer' }, '⌬ BRAND')
  ]);
}

export function render({ content, brand, format }) {
  const accent  = brand.accentColor || '#25D366';
  const headline = content.headline || 'הלקוחות שלנו מדברים.';
  const caption  = content.caption || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-whatsapp' }, [
    // Top brand strip (dark)
    el('div', { class: 'wa-brand-top' }, [
      brandLogo({ brand, className: 'wa-brand-logo', textClass: 'wa-brand-name', dotClass: 'wa-brand-dot', accent })
    ]),

    // Headline band (WhatsApp green)
    el('div', { class: 'wa-headline-band' }, [
      el('div', { class: 'wa-icon-bubble' }, '💬'),
      el('div', { class: 'wa-headline' }, headline)
    ]),

    // Chat-styled frame containing the screenshot
    el('div', { class: 'wa-chat-frame' }, [
      el('div', { class: 'wa-chat-header' }, [
        el('div', { class: 'wa-avatar' }, '🟢'),
        el('div', { class: 'wa-chat-meta' }, [
          el('div', { class: 'wa-chat-name' }, 'לקוח/ה'),
          el('div', { class: 'wa-chat-status' }, 'online')
        ])
      ]),
      el('div', { class: 'wa-chat-body' }, [
        imageUrl
          ? el('img', { class: 'wa-chat-img', src: imageUrl, crossorigin: 'anonymous' })
          : el('div', { class: 'img-card-placeholder' }, 'צילום וואטסאפ')
      ])
    ]),

    // Owner reply below
    caption
      ? el('div', { class: 'wa-reply' }, [
          el('div', { class: 'wa-reply-label' }, 'התגובה שלנו'),
          el('div', { class: 'wa-reply-text' }, caption)
        ])
      : null,

    // Bottom brand strip
    el('div', { class: 'wa-bottom' }, [
      el('div', { class: 'wa-bottom-line', style: { background: accent } }),
      el('div', { class: 'wa-bottom-row' }, [
        brandLogo({ brand, className: 'wa-bottom-logo', textClass: 'wa-bottom-name', dotClass: 'wa-brand-dot', accent }),
        el('div', { class: 'wa-bottom-stars', style: { color: accent } }, '★ ★ ★ ★ ★')
      ])
    ])
  ]);
}
