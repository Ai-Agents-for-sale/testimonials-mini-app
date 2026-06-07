import { el } from '../dom.js';
import { SAMPLE_IMG, SAMPLE } from './_samples.js';

export const meta = {
  id: 'google-review',
  nameHe: 'ביקורת גוגל',
  type: 'google-review',
  description: 'בסגנון מטריאל. רקע גריד עדין, וורדמארק Google שמאל-עליון, לוגו המותג ימין-עליון, ציטוט סריף איטליק, ותחתית עם דירוג, כוכבים וסימן אימות.',
  descLong: 'נראה כמו ביקורת אמיתית בגוגל — דירוג 5 כוכבים, וורדמארק גוגל, פונט סריף איטליק לציטוט. צבעי גוגל קבועים (לא משתנים עם המותג).',
  bestFor: 'ביקורות גוגל',
  editableFields: [
    { key: 'quote', labelHe: 'תוכן הביקורת (סריף איטליק)', multiline: true, default: 'השירות הכי טוב שקיבלתי. צוות מקצועי, זמין ומהיר. ממליצה בחום!' }
  ]
};

export function thumbnail(brand) {
  const brandName = (brand && (brand.nameHe || brand.name)) || 'מותג';
  return el('div', { class: 'mp mp-google' }, [
    el('div', { class: 'mp-google-top' }, [
      el('div', { class: 'mp-google-word' }, [
        el('span', { style: { color: '#4285F4' } }, 'G'),
        el('span', { style: { color: '#EA4335' } }, 'o'),
        el('span', { style: { color: '#FBBC05' } }, 'o'),
        el('span', { style: { color: '#4285F4' } }, 'g'),
        el('span', { style: { color: '#34A853' } }, 'l'),
        el('span', { style: { color: '#EA4335' } }, 'e')
      ]),
      el('div', { class: 'mp-google-stamp' }, (brandName[0] || '?'))
    ]),
    el('div', { class: 'mp-google-quote' }, [
      el('span', { class: 'mp-google-mark' }, '“'),
      SAMPLE.quote,
      el('span', { class: 'mp-google-mark' }, '”')
    ]),
    el('div', { class: 'mp-img-wrap mp-img-wrap-sm' }, [
      el('img', { src: SAMPLE_IMG, alt: '', class: 'mp-img' })
    ]),
    el('div', { class: 'mp-google-bottom' }, [
      el('div', { class: 'mp-google-rating' }, '5.0'),
      el('div', { class: 'mp-google-stars' }, '★★★★★'),
      el('div', { class: 'mp-google-sig' }, 'ביקורת ל-' + brandName)
    ])
  ]);
}

export function render({ content, brand, format }) {
  // Google Review is intentionally LOCKED to Google's brand colors —
  // brand.primaryColor / accentColor are NOT used. The template's
  // recognisability comes from looking like a real Google review.
  const googleBlue = '#1a73e8';
  const brandName = (brand && (brand.nameHe || brand.name)) || 'BRAND';
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
        el('div', { class: 'gr-brand-logo-fallback', style: { background: googleBlue } }, initial)
      ])
    ]),

    // Quote — serif italic, with quote marks framing it
    quote ? el('div', { class: 'gr-quote-wrap' }, [
      el('div', { class: 'gr-quote-mark-l', style: { color: googleBlue } }, '"'),
      el('div', {
        class: 'gr-quote',
        'data-field': 'quote',
        'data-fit-max': '42', 'data-fit-min': '20'
      }, quote),
      el('div', { class: 'gr-quote-mark-r', style: { color: googleBlue } }, '"')
    ]) : null,

    // Testimonial image
    imageUrl ? el('div', { class: 'img-card-wrap gr-img-wrap', 'data-field': 'image' }, [
      el('div', { class: 'img-card img-card-bright gr-img-card' }, [
        el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
      ])
    ]) : null,

    // Bottom block: 5.0 → 5 stars → "ביקורת ל-[brand]" sig
    el('div', { class: 'gr-bottom' }, [
      el('div', { class: 'gr-rating-block' }, [
        el('div', { class: 'gr-rating-num' }, '5.0')
      ]),
      el('div', { class: 'gr-bottom-stars', style: { color: '#FBBC05' } }, '★ ★ ★ ★ ★'),
      el('div', { class: 'gr-sig-rule' }),
      el('div', { class: 'gr-sig' }, [
        el('span', { class: 'gr-sig-prefix' }, 'ביקורת ל-'),
        el('span', { class: 'gr-sig-brand', style: { color: googleBlue } }, brandName)
      ])
    ])
  ]);
}
