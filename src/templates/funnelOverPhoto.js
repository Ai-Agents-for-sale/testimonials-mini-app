import { el } from '../dom.js';
import { SAMPLE_IMG, SAMPLE } from './_samples.js';

export const meta = {
  id: 'funnel-over-photo',
  nameHe: 'תוצאה על רקע',
  type: 'frame-multi',
  description: 'מגזין נועז על רקע תמונה. סרט אלכסוני בפינה שמאל-עליונה עם שם המותג, כותרת ענקית, ושורות הסבר נקיות עם פסי הדגשה.',
  descLong: 'הסטטיסטיקה ענקית באמצע. סרט אלכסוני עם שם המותג בפינה. למטה — שורות הסבר על איך הגעת לתוצאה. נראה כמו פוסט מגזין עסקי.',
  bestFor: 'תוצאות עם מספרים',
  editableFields: [
    { key: 'headline',     labelHe: 'מספר/סטטיסטיקה ענקית (Suez One)', default: '100K ₪' },
    { key: 'subHeadline',  labelHe: 'תת-כותרת תיאורית', default: 'בחודש הראשון' },
    { key: 'captionLines', labelHe: 'שורות הסבר (שורה לכל שורה)', multiline: true, linesField: true, default: 'הלקוחות התחילו לפנות\nהמוצר הציע פתרון אמיתי\nהמכירה סגרה את עצמה' }
  ]
};

export function thumbnail(brand) {
  const primary = (brand && brand.primaryColor) || '#1F6FB2';
  const accent  = (brand && brand.accentColor)  || '#F2C94C';
  const brandName = (brand && (brand.nameHe || brand.name)) || 'מותג';
  return el('div', {
    class: 'mp mp-funnel',
    style: { background: 'linear-gradient(135deg, ' + primary + ' 0%, #0d1320 100%)' }
  }, [
    el('div', { class: 'mp-funnel-ribbon', style: { background: accent } }, brandName),
    el('div', { class: 'mp-funnel-stat' }, [
      el('div', { class: 'mp-funnel-num' }, SAMPLE.statHead),
      el('div', { class: 'mp-funnel-sub' }, SAMPLE.statSub),
      el('div', { class: 'mp-funnel-rule', style: { background: accent } })
    ]),
    el('div', { class: 'mp-img-wrap mp-img-wrap-sm' }, [
      el('img', { src: SAMPLE_IMG, alt: '', class: 'mp-img' })
    ]),
    el('div', { class: 'mp-funnel-lines' },
      SAMPLE.captionLines.map((ln) => el('div', { class: 'mp-funnel-line' }, [
        el('span', { class: 'mp-funnel-bar', style: { background: accent } }),
        el('span', null, ln)
      ]))
    )
  ]);
}

function toLines(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split('\n').map((s) => s.trim()).filter(Boolean);
  return [];
}

export function render({ content, brand, format }) {
  const bg = content.backgroundUrl || (brand && brand.defaultBackgroundUrl);
  const primary = (brand && brand.primaryColor) || '#1F6FB2';
  const accent  = (brand && brand.accentColor)  || '#F2C94C';
  const brandName   = (brand && (brand.nameHe || brand.name)) || 'BRAND';
  const brandHandle = (brand && brand.name) || '';
  const headline = content.headline;
  const subHeadline = content.subHeadline;
  const imageUrl = content.sourceImageUrl;
  const lines = toLines(content.captionLines).length
    ? toLines(content.captionLines)
    : (content.caption ? [content.caption] : []);

  // Fallback gradient is now brand-primary → deep navy so the canvas
  // reacts to the brand colour when there's no background photo.
  const fallbackGradient = 'linear-gradient(135deg, ' + primary + ' 0%, #0d1320 100%)';

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-funnel',
    style: { background: bg ? 'url("' + bg + '") center/cover no-repeat' : fallbackGradient }
  }, [
    // Diagonal gradient overlay for editorial feel
    el('div', { class: 'fn-bg-diagonal' }),
    el('div', { class: 'fn-bg-vignette' }),

    // Top-LEFT diagonal ribbon — brand NAME (text only)
    el('div', { class: 'fn-ribbon', style: { background: accent } }, [
      el('span', { class: 'fn-ribbon-text' }, brandName)
    ]),

    (headline || subHeadline) ? el('div', { class: 'fn-headline-block' }, [
      headline ? el('div', {
        class: 'fn-headline-num',
        'data-field': 'headline',
        'data-fit-max': '140', 'data-fit-min': '60'
      }, headline) : null,
      subHeadline ? el('div', {
        class: 'fn-headline-sub',
        'data-field': 'subHeadline',
        'data-fit-max': '28', 'data-fit-min': '16'
      }, subHeadline) : null,
      el('div', { class: 'fn-headline-rule', style: { background: accent } })
    ]) : null,

    // Image — bigger now
    el('div', { class: 'img-card-wrap fn-img-wrap', 'data-field': 'image' }, [
      imageUrl
        ? el('div', { class: 'img-card img-card-bright' }, [
            el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
          ])
        : null
    ]),

    // Magazine-style line list with accent leading bar
    lines.length ? el('div', { class: 'fn-lines' },
      lines.map((line) => el('div', { class: 'fn-line' }, [
        el('span', { class: 'fn-line-bar', style: { background: accent } }),
        el('span', {
          class: 'fn-line-text',
          'data-field': 'captionLines',
          'data-fit-max': '28', 'data-fit-min': '16'
        }, line)
      ]))
    ) : null,

    // Bottom signature — brand name on top, handle below
    el('div', { class: 'fn-sig' }, [
      el('div', { class: 'fn-sig-rule', style: { background: accent } }),
      el('div', { class: 'fn-sig-name' }, brandName),
      brandHandle ? el('div', { class: 'fn-sig-handle', dir: 'ltr' }, '@' + brandHandle.replace(/^@/, '')) : null
    ])
  ]);
}
