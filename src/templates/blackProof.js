import { el } from '../dom.js';

export const meta = {
  id: 'black-proof',
  nameHe: 'הוכחה שחורה',
  type: 'frame',
  description: 'מינימליסטי. רקע שחור נקי בלי קישוטים. כותרת בעברית על רקע לבן למעלה, תמונה באמצע, ומשפט קצר על רקע לבן למטה.',
  editableFields: [
    { key: 'headline', labelHe: 'טקסט עליון (על רקע לבן)', default: 'הנה ההוכחה.' },
    { key: 'caption',  labelHe: 'משפט תחתון (על רקע לבן)', multiline: true, default: 'הלקוחות שלנו אומרים את הכל בעצמם.' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-blackproof' }, [
    el('div', { class: 'tpl-thumb-blackproof-pill-top' }, 'טקסט'),
    el('div', { class: 'tpl-thumb-blackproof-card' }),
    el('div', { class: 'tpl-thumb-blackproof-pill-bot' }, 'משפט')
  ]);
}

export function render({ content, format }) {
  const headline = content.headline;
  const caption  = content.caption;
  const imageUrl = content.sourceImageUrl;

  return el('div', { class: 'tpl-canvas format-' + format + ' tpl-blackproof' }, [
    headline ? el('div', {
      class: 'bp-pill bp-pill-top',
      'data-field': 'headline',
      'data-fit-max': '60', 'data-fit-min': '28'
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
      'data-fit-max': '36', 'data-fit-min': '18'
    }, caption) : null
  ]);
}
