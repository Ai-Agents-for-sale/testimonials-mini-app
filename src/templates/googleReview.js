import { el } from '../dom.js';

export const meta = {
  id: 'google-review',
  nameHe: 'ביקורת גוגל',
  type: 'google-review',
  description: 'בסגנון מטריאל. רקע גריד עדין, וורדמארק Google שמאל-עליון, לוגו המותג ימין-עליון, ציטוט סריף איטליק, ותחתית עם דירוג, כוכבים וסימן אימות.',
  editableFields: [
    { key: 'quote', labelHe: 'תוכן הביקורת (סריף איטליק)', multiline: true, default: 'השירות הכי טוב שקיבלתי. צוות מקצועי, זמין ומהיר. ממליצה בחום!' }
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
    el('div', { class: 'tpl-thumb-google-card' }),
    el('div', { class: 'tpl-thumb-google-rating' }, '5.0'),
    el('div', { class: 'tpl-thumb-google-stars' }, '★★★★★'),
    el('div', { class: 'tpl-thumb-google-sig' }, 'ביקורת ל-BRAND')
  ]);
}

export function render({ content, brand, format }) {
  const primary = brand.primaryColor || '#1a73e8';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const quote = content.quote || content.caption;
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-google' }, [
    // Soft grid pattern background
    el('div', { class: 'gr-bg-grid' }),
    // Big blurred Google color orbs
    el('div', { class: 'gr-bg-orbs' }, [
      el('span', { class: 'gr-orb gr-orb-blue',   style: { background: '#4285F4' } }),
      el('span', { class: 'gr-orb gr-orb-red',    style: { background: '#EA4335' } }),
      el('span', { class: 'gr-orb gr-orb-yellow', style: { background: '#FBBC05' } }),
      el('span', { class: 'gr-orb gr-orb-green',  style: { background: '#34A853' } })
    ]),

    // Top row: Google wordmark LEFT, brand logo RIGHT
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
      el('div', { class: 'gr-brand-logo-wrap' }, [
        brand.logoUrl
          ? el('img', { class: 'gr-brand-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
          : el('div', { class: 'gr-brand-logo-fallback', style: { background: primary } }, initial)
      ])
    ]),

    // Quote — serif italic, with quote marks framing it
    quote ? el('div', { class: 'gr-quote-wrap' }, [
      el('div', { class: 'gr-quote-mark-l', style: { color: primary } }, '"'),
      el('div', {
        class: 'gr-quote',
        'data-fit-max': '42', 'data-fit-min': '20'
      }, quote),
      el('div', { class: 'gr-quote-mark-r', style: { color: primary } }, '"')
    ]) : null,

    // Testimonial image
    imageUrl ? el('div', { class: 'img-card-wrap gr-img-wrap' }, [
      el('div', { class: 'img-card img-card-bright gr-img-card' }, [
        el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
      ])
    ]) : null,

    // Bottom block: 5.0 → stars → verified → sig
    el('div', { class: 'gr-bottom' }, [
      el('div', { class: 'gr-rating-block' }, [
        el('div', { class: 'gr-rating-num' }, '5.0'),
        el('div', { class: 'gr-rating-out' }, 'out of 5')
      ]),
      el('div', { class: 'gr-bottom-stars', style: { color: '#FBBC05' } }, '★ ★ ★ ★ ★'),
      el('div', { class: 'gr-verified' }, [
        el('span', { class: 'gr-check', style: { background: '#34A853' } }, '✓'),
        el('span', { style: { color: '#5f6368' } }, 'Verified Review')
      ]),
      el('div', { class: 'gr-sig-rule' }),
      el('div', { class: 'gr-sig' }, [
        el('span', { class: 'gr-sig-prefix' }, 'ביקורת ל-'),
        el('span', { class: 'gr-sig-brand', style: { color: primary } }, brandName)
      ])
    ])
  ]);
}
