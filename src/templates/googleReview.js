import { el } from '../dom.js';

export const meta = {
  id: 'google-review',
  nameHe: 'ביקורת גוגל',
  type: 'google-review',
  description: 'בסגנון מטריאל. רקע גריד עדין, וורדמארק Google שמאל-עליון, סטמפ מותג ימין-עליון, ציון 5.0 ענק ב-Suez, ביקורת בסריף איטליק, וחתימת "Reviewed for".',
  editableFields: [
    { key: 'headline',   labelHe: 'כותרת קצרה מעל הציטוט', default: 'ביקורת ⭐ מגוגל' },
    { key: 'quote',      labelHe: 'תוכן הביקורת (סריף איטליק)', multiline: true, default: 'השירות הכי טוב שקיבלתי. צוות מקצועי, זמין ומהיר. ממליצה בחום!' },
    { key: 'authorName', labelHe: 'שם הממליץ', default: 'שיר כהן' },
    { key: 'authorRole', labelHe: 'תיאור (אופציונלי)', default: 'לקוחה' }
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
    el('div', { class: 'tpl-thumb-google-stamp' }, 'B'),
    el('div', { class: 'tpl-thumb-google-rating' }, '5.0'),
    el('div', { class: 'tpl-thumb-google-stars' }, '★★★★★'),
    el('div', { class: 'tpl-thumb-google-card' }),
    el('div', { class: 'tpl-thumb-google-sig' }, 'Reviewed for BRAND')
  ]);
}

export function render({ content, brand, format }) {
  const primary = brand.primaryColor || '#1a73e8';
  const accent  = brand.accentColor || '#F2C94C';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const headline = content.headline || '';
  const quote = content.quote || content.caption || '';
  const authorName = content.authorName || '';
  const authorRole = content.authorRole || '';
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-google' }, [
    // Soft grid pattern background
    el('div', { class: 'gr-bg-grid' }),
    // Big blurred Google color orbs — replace the tiny corner dots
    el('div', { class: 'gr-bg-orbs' }, [
      el('span', { class: 'gr-orb gr-orb-blue',   style: { background: '#4285F4' } }),
      el('span', { class: 'gr-orb gr-orb-red',    style: { background: '#EA4335' } }),
      el('span', { class: 'gr-orb gr-orb-yellow', style: { background: '#FBBC05' } }),
      el('span', { class: 'gr-orb gr-orb-green',  style: { background: '#34A853' } })
    ]),

    // Top row: Google wordmark LEFT, brand stamp RIGHT
    el('div', { class: 'gr-top-row' }, [
      el('div', { class: 'gr-google-word' }, [
        el('span', { style: { color: '#4285F4' } }, 'G'),
        el('span', { style: { color: '#EA4335' } }, 'o'),
        el('span', { style: { color: '#FBBC05' } }, 'o'),
        el('span', { style: { color: '#4285F4' } }, 'g'),
        el('span', { style: { color: '#34A853' } }, 'l'),
        el('span', { style: { color: '#EA4335' } }, 'e'),
        el('span', { class: 'gr-reviews', style: { color: '#5f6368' } }, ' Reviews')
      ]),
      el('div', { class: 'gr-brand-stamp', style: { borderColor: primary } }, [
        brand.logoUrl
          ? el('img', { class: 'gr-brand-stamp-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
          : el('div', { class: 'gr-brand-stamp-initial', style: { color: primary } }, initial)
      ])
    ]),

    // Massive rating block — "5.0" only, stars moved to the bottom
    el('div', { class: 'gr-rating-block' }, [
      el('div', { class: 'gr-rating-num' }, '5.0'),
      el('div', { class: 'gr-rating-out' }, 'out of 5')
    ]),

    // Optional small headline
    headline ? el('div', { class: 'gr-headline' }, headline) : null,

    // Quote — serif italic
    quote ? el('div', { class: 'gr-quote-wrap' }, [
      el('div', { class: 'gr-quote-mark-l', style: { color: primary } }, '"'),
      el('div', { class: 'gr-quote' }, quote),
      el('div', { class: 'gr-quote-mark-r', style: { color: primary } }, '"')
    ]) : null,

    // Optional image (if a real Google review screenshot is provided)
    imageUrl ? el('div', { class: 'img-card-wrap gr-img-wrap' }, [
      el('div', { class: 'img-card img-card-bright gr-img-card' }, [
        el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
      ])
    ]) : null,

    // Author — avatar circle + name + role
    (authorName || authorRole) ? el('div', { class: 'gr-author' }, [
      el('div', { class: 'gr-author-avatar', style: { background: primary } }, (authorName || '?').slice(0, 1)),
      el('div', { class: 'gr-author-meta' }, [
        authorName ? el('div', { class: 'gr-author-name' }, authorName) : null,
        el('div', { class: 'gr-author-stars', style: { color: '#FBBC05' } }, '★ ★ ★ ★ ★')
      ])
    ]) : null,

    // Bottom: small stars row + "Verified" badge + "Reviewed for BRAND" sig
    el('div', { class: 'gr-bottom' }, [
      el('div', { class: 'gr-bottom-stars', style: { color: '#FBBC05' } }, '★ ★ ★ ★ ★'),
      el('div', { class: 'gr-verified' }, [
        el('span', { class: 'gr-check', style: { background: '#34A853' } }, '✓'),
        el('span', { style: { color: '#5f6368' } }, 'Verified Review')
      ]),
      el('div', { class: 'gr-sig-rule' }),
      el('div', { class: 'gr-sig' }, [
        el('span', { class: 'gr-sig-prefix' }, 'Reviewed for'),
        el('span', { class: 'gr-sig-brand', style: { color: primary } }, brandName)
      ])
    ])
  ]);
}
