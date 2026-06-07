import { el } from '../dom.js';
import { SAMPLE_IMG, SAMPLE } from './_samples.js';

export const meta = {
  id: 'bold-quote',
  nameHe: 'ציטוט מגזין',
  type: 'extract',
  description: 'מינימליסטי. רקע צבע מותג אחיד (התבנית היחידה עם רקע נקי). תמונה ממורכזת, ציטוט סריף ענקי מתחת, מונוגרם בפינה ימנית-עליונה, חתימה בפינה ימנית-תחתונה.',
  descLong: 'הציטוט הוא הכוכב. רקע אחיד בצבע המותג, תמונה קטנה למעלה, ציטוט ענק באמצע, שם הממליץ למטה. מתאים כשיש משפט חזק שמדבר בעד עצמו.',
  bestFor: 'ציטוט עוצמתי + שם',
  editableFields: [
    { key: 'quote',      labelHe: 'הציטוט (Suez One איטליק)', multiline: true, default: 'השירות הכי טוב שקיבלתי. ממליצה בחום!' },
    { key: 'authorName', labelHe: 'שם הממליץ', default: 'שיר כהן' },
    { key: 'authorRole', labelHe: 'תפקיד/תיאור (אופציונלי)', default: 'לקוחה' }
  ]
};

export function thumbnail(brand) {
  const primary = (brand && brand.primaryColor) || '#0d1b4b';
  const accent  = (brand && brand.accentColor)  || '#F2C94C';
  const brandName = (brand && (brand.nameHe || brand.name)) || 'מותג';
  return el('div', { class: 'mp mp-quote', style: { background: primary } }, [
    el('div', { class: 'mp-quote-mono', style: { borderColor: accent, color: accent } }, (brandName[0] || '?')),
    el('div', { class: 'mp-img-wrap mp-img-wrap-sm' }, [
      el('img', { src: SAMPLE_IMG, alt: '', class: 'mp-img' })
    ]),
    el('div', { class: 'mp-quote-mark', style: { color: accent } }, '"'),
    el('div', { class: 'mp-quote-text' }, SAMPLE.quote),
    el('div', { class: 'mp-quote-author' }, [
      el('div', { class: 'mp-quote-rule', style: { background: accent } }),
      el('div', {}, '— ' + SAMPLE.authorName)
    ]),
    el('div', { class: 'mp-quote-sig' }, brandName)
  ]);
}

export function render({ content, brand, format }) {
  const primary = brand.primaryColor || '#0d1b4b';
  const accent  = brand.accentColor || '#F2C94C';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const quote = content.quote || content.caption;
  const authorName = content.authorName;
  const authorRole = content.authorRole;
  const imageUrl = content.sourceImageUrl;

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-quote',
    style: { background: primary }
  }, [
    // Top-RIGHT monogram circle (single initial)
    el('div', { class: 'bq-mono', style: { borderColor: accent, color: accent } }, initial),

    // Image — centered above the quote
    imageUrl ? el('div', { class: 'img-card-wrap bq-img-wrap', 'data-field': 'image' }, [
      el('div', { class: 'img-card img-card-bright' }, [
        el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
      ])
    ]) : null,

    // Opening quote mark + quote text (both gone if there's no quote)
    quote ? el('div', { class: 'bq-mark', style: { color: accent } }, '"') : null,
    quote ? el('div', {
      class: 'bq-quote',
      'data-field': 'quote',
      'data-fit-max': '60', 'data-fit-min': '26'
    }, quote) : null,

    // Thin accent rule + author
    (authorName || authorRole) ? el('div', { class: 'bq-author-block' }, [
      el('div', { class: 'bq-author-rule', style: { background: accent } }),
      authorName ? el('div', {
        class: 'bq-author-name',
        'data-field': 'authorName',
        'data-fit-max': '32', 'data-fit-min': '18'
      }, '— ' + authorName) : null,
      authorRole ? el('div', {
        class: 'bq-author-role',
        'data-field': 'authorRole',
        'data-fit-max': '20', 'data-fit-min': '14'
      }, authorRole) : null
    ]) : null,

    // Bottom-RIGHT serif signature
    el('div', { class: 'bq-sig' }, [
      el('div', { class: 'bq-sig-rule', style: { background: accent } }),
      el('div', { class: 'bq-sig-name' }, brandName),
      brand.name ? el('div', { class: 'bq-sig-en' }, brand.name.toUpperCase()) : null
    ])
  ]);
}
