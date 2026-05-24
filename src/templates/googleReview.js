import { el } from '../dom.js';
import { brandLogo } from '../components/brandLogo.js';

export const meta = {
  id: 'google-review',
  nameHe: 'ביקורת גוגל',
  type: 'google-review',
  description: 'מותאם לצילומי ביקורת מגוגל — צבעי גוגל, חמישה כוכבי זהב, תג מאומת ושם המותג.',
  editableFields: [
    { key: 'headline',   labelHe: 'כותרת ראשית' },
    { key: 'quote',      labelHe: 'תוכן הביקורת', multiline: true },
    { key: 'authorName', labelHe: 'שם הממליץ' },
    { key: 'authorRole', labelHe: 'תיאור (אופציונלי)' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-google' }, [
    el('div', { class: 'tpl-thumb-google-word' }, [
      el('span', { style: { color: '#4285F4' } }, 'G'),
      el('span', { style: { color: '#EA4335' } }, 'o'),
      el('span', { style: { color: '#FBBC05' } }, 'o'),
      el('span', { style: { color: '#4285F4' } }, 'g'),
      el('span', { style: { color: '#34A853' } }, 'l'),
      el('span', { style: { color: '#EA4335' } }, 'e')
    ]),
    el('div', { class: 'tpl-thumb-google-stars' }, '★★★★★'),
    el('div', { class: 'tpl-thumb-google-card' }),
    el('div', { class: 'tpl-thumb-google-brand' }, 'BRAND')
  ]);
}

export function render({ content, brand, format }) {
  const primary = brand.primaryColor || '#1a73e8';
  const accent  = brand.accentColor || '#F2C94C';
  const headline = content.headline || 'ביקורת ⭐ מגוגל';
  const quote = content.quote || content.caption || '';
  const authorName = content.authorName || '';
  const authorRole = content.authorRole || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-google' }, [
    // Top: Google wordmark
    el('div', { class: 'gr-top' }, [
      el('div', { class: 'gr-google-word' }, [
        el('span', { style: { color: '#4285F4' } }, 'G'),
        el('span', { style: { color: '#EA4335' } }, 'o'),
        el('span', { style: { color: '#FBBC05' } }, 'o'),
        el('span', { style: { color: '#4285F4' } }, 'g'),
        el('span', { style: { color: '#34A853' } }, 'l'),
        el('span', { style: { color: '#EA4335' } }, 'e')
      ]),
      el('div', { class: 'gr-reviews-label' }, 'REVIEWS')
    ]),

    // 5-star header
    el('div', { class: 'gr-stars-row' }, [
      el('div', { class: 'gr-stars' }, '★ ★ ★ ★ ★'),
      el('div', { class: 'gr-rating' }, '5.0  •  Verified')
    ]),

    // Headline
    headline ? el('div', { class: 'gr-headline' }, headline) : null,

    // Image card (if present)
    imageUrl
      ? el('div', { class: 'img-card-wrap gr-img-wrap' }, [
          el('div', { class: 'img-card img-card-bright gr-img-card' }, [
            el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
          ])
        ])
      : null,

    // Quote
    quote ? el('div', { class: 'gr-quote' }, '"' + quote + '"') : null,

    // Author
    (authorName || authorRole)
      ? el('div', { class: 'gr-author' }, [
          el('div', { class: 'gr-avatar', style: { background: primary } }, (authorName || '?').slice(0, 1)),
          el('div', { class: 'gr-author-meta' }, [
            authorName ? el('div', { class: 'gr-author-name' }, authorName) : null,
            authorRole ? el('div', { class: 'gr-author-role' }, authorRole) : null
          ])
        ])
      : null,

    // Bottom brand strip
    el('div', { class: 'gr-bottom' }, [
      el('div', { class: 'gr-bottom-line' }),
      el('div', { class: 'gr-bottom-row' }, [
        brandLogo({ brand, className: 'gr-bottom-logo', textClass: 'gr-bottom-name', dotClass: 'gr-bottom-dot', accent: primary })
      ])
    ])
  ]);
}
