import { el } from '../dom.js';
import { SAMPLE_IMG, SAMPLE } from './_samples.js';

export const meta = {
  id: 'black-proof',
  nameHe: 'הוכחה שחורה',
  type: 'frame',
  description: 'מינימליסטי. רקע שחור נקי בלי קישוטים. כותרת בעברית על רקע לבן למעלה, תמונה באמצע, ומשפט קצר על רקע לבן למטה.',
  descLong: 'נקי, רציני, מינימליסטי. רקע כהה עם זוהר עדין בצבע המותג. שני "כדורים" לבנים — אחד למעלה ואחד למטה — עוטפים את הצילום באמצע.',
  bestFor: 'תמונות עבודה / מוצר',
  editableFields: [
    { key: 'headline', labelHe: 'טקסט עליון (על רקע לבן)', default: 'הנה ההוכחה.' },
    { key: 'caption',  labelHe: 'משפט תחתון (על רקע לבן)', multiline: true, default: 'הלקוחות שלנו אומרים את הכל בעצמם.' }
  ]
};

export function thumbnail(brand) {
  const primary = (brand && brand.primaryColor) || '#1F6FB2';
  const accent  = (brand && brand.accentColor)  || '#F2C94C';
  return el('div', {
    class: 'mp mp-bp',
    style: { background: 'radial-gradient(ellipse at center, ' + primary + ' 0%, #000 80%)' }
  }, [
    el('div', { class: 'mp-bp-pill', style: { borderColor: accent, color: primary } }, SAMPLE.headline),
    el('div', { class: 'mp-img-wrap' }, [
      el('img', { src: SAMPLE_IMG, alt: '', class: 'mp-img' })
    ]),
    el('div', { class: 'mp-bp-pill', style: { borderColor: accent, color: primary } }, SAMPLE.caption)
  ]);
}

export function render({ content, brand, format }) {
  const primary = (brand && brand.primaryColor) || '#1F6FB2';
  const accent  = (brand && brand.accentColor)  || '#F2C94C';
  const headline = content.headline;
  const caption  = content.caption;
  const imageUrl = content.sourceImageUrl;

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-blackproof',
    // Brand-driven dark canvas: primary stays in the middle as a soft glow,
    // edges fade to deep black. Keeps the "black proof" identity but reacts
    // to the client's brand colour.
    style: { background: 'radial-gradient(ellipse at center, ' + primary + ' 0%, #000 75%)' }
  }, [
    headline ? el('div', {
      class: 'bp-pill bp-pill-top',
      'data-field': 'headline',
      'data-fit-max': '60', 'data-fit-min': '28',
      // Brand-accent thin border so the white pill picks up the brand voice.
      style: { borderColor: accent, color: primary }
    }, headline) : null,

    el('div', { class: 'img-card-wrap bp-img-wrap', 'data-field': 'image' }, [
      imageUrl
        ? el('div', { class: 'img-card img-card-bright' }, [
            el('img', { class: 'img-card-img', src: imageUrl, crossorigin: 'anonymous' })
          ])
        : null
    ]),

    caption ? el('div', {
      class: 'bp-pill bp-pill-bottom',
      'data-field': 'caption',
      'data-fit-max': '36', 'data-fit-min': '18',
      style: { borderColor: accent, color: primary }
    }, caption) : null
  ]);
}
