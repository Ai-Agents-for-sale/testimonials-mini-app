import { el } from '../dom.js';

export const meta = {
  id: 'phone-mockup',
  nameHe: 'מוקאפ פאלפון',
  type: 'phone-mockup',
  description: 'הסקרינשוט יושב בתוך מסגרת אייפון, חיצים ושכבות קישוט מסביב, רקע גראדיאנט עם עיגולים גדולים בצבעי המותג.',
  editableFields: [
    { key: 'headline',    labelHe: 'כותרת ראשית', default: 'תראו מה כתבו לנו.' },
    { key: 'subHeadline', labelHe: 'תת-כותרת', default: 'הודעה אמיתית. צילום אמיתי.' },
    { key: 'caption',     labelHe: 'אנוטציה צד (קצרה)', multiline: false, default: '★ אמיתי' }
  ]
};

export function thumbnail() {
  return el('div', { class: 'tpl-thumb tpl-thumb-mockup' }, [
    el('div', { class: 'tpl-thumb-mockup-orb-a' }),
    el('div', { class: 'tpl-thumb-mockup-orb-b' }),
    el('div', { class: 'tpl-thumb-mockup-headline' }, 'הוכחה'),
    el('div', { class: 'tpl-thumb-mockup-phone' }, [
      el('div', { class: 'tpl-thumb-mockup-screen' })
    ]),
    el('div', { class: 'tpl-thumb-mockup-arrow' }, '↘'),
    el('div', { class: 'tpl-thumb-mockup-foot' }, 'BRAND')
  ]);
}

// Curvy SVG arrow that can be positioned anywhere. Two variants: from-left
// and from-right (mirrored). Stroke + arrowhead use the brand accent color.
function curvyArrow({ variant, accent }) {
  const isLeft = variant === 'left';
  const d = isLeft
    ? 'M 40 30 Q 140 10 220 90 Q 290 150 320 230'
    : 'M 320 30 Q 220 10 140 90 Q 70 150 40 230';
  const tip = isLeft
    ? '320,230 295,225 310,200'
    : '40,230 65,225 50,200';
  return el('svg', {
    class: 'pm-arrow pm-arrow-' + variant,
    viewBox: '0 0 360 260',
    xmlns: 'http://www.w3.org/2000/svg'
  }, [
    el('path', {
      d,
      stroke: accent,
      'stroke-width': '8',
      fill: 'none',
      'stroke-linecap': 'round',
      'stroke-dasharray': '0'
    }),
    el('polygon', {
      points: tip,
      fill: accent
    })
  ]);
}

export function render({ content, brand, format }) {
  const primary = brand.primaryColor || '#1F6FB2';
  const accent  = brand.accentColor || '#F2C94C';
  const brandName = brand.nameHe || brand.name || 'BRAND';
  const initial = (brandName || '?').slice(0, 1);
  const headline    = content.headline    || 'תראו מה כתבו לנו.';
  const subHeadline = content.subHeadline || 'הודעה אמיתית. צילום אמיתי.';
  const caption     = content.caption     || '★ אמיתי';
  const imageUrl    = content.sourceImageUrl;

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-mockup',
    style: { background: 'linear-gradient(155deg, ' + primary + ' 0%, #0a0e1a 100%)' }
  }, [
    // Background decoration — large blurred color orbs
    el('div', { class: 'pm-bg-orbs' }, [
      el('span', { class: 'pm-orb pm-orb-accent', style: { background: accent } }),
      el('span', { class: 'pm-orb pm-orb-primary', style: { background: primary } }),
      el('span', { class: 'pm-orb pm-orb-soft', style: { background: '#fff' } })
    ]),
    // Diagonal stripes overlay for extra texture
    el('div', { class: 'pm-bg-stripes' }),

    // Top brand row
    el('div', { class: 'pm-top' }, [
      el('div', { class: 'pm-brand-pill', style: { borderColor: accent } }, [
        brand.logoUrl
          ? el('img', { class: 'pm-brand-pill-logo', src: brand.logoUrl, crossorigin: 'anonymous' })
          : el('span', { class: 'pm-brand-pill-dot', style: { background: accent } }),
        el('span', { class: 'pm-brand-pill-name' }, brandName)
      ])
    ]),

    // Headline block (Suez display + serif italic sub)
    el('div', { class: 'pm-headline-block' }, [
      el('div', { class: 'pm-headline' }, headline),
      el('div', { class: 'pm-subhead', style: { color: accent } }, subHeadline)
    ]),

    // Phone mockup with the screenshot inside it, flanked by curvy arrows
    el('div', { class: 'pm-stage' }, [
      curvyArrow({ variant: 'right', accent }),

      el('div', { class: 'pm-phone' }, [
        el('div', { class: 'pm-phone-notch' }),
        el('div', { class: 'pm-phone-button pm-phone-mute' }),
        el('div', { class: 'pm-phone-button pm-phone-vol-up' }),
        el('div', { class: 'pm-phone-button pm-phone-vol-down' }),
        el('div', { class: 'pm-phone-button pm-phone-power' }),
        el('div', { class: 'pm-phone-screen' }, [
          imageUrl
            ? el('img', { class: 'pm-phone-img', src: imageUrl, crossorigin: 'anonymous' })
            : el('div', { class: 'pm-phone-placeholder' }, 'צילום')
        ])
      ]),

      curvyArrow({ variant: 'left', accent }),

      // Floating annotation badge (right side)
      el('div', { class: 'pm-annotation pm-annotation-right', style: { background: accent } }, caption),
      // Floating sticker on left side
      el('div', { class: 'pm-annotation pm-annotation-left' }, '✓ מאומת')
    ]),

    // Bottom signature
    el('div', { class: 'pm-bottom' }, [
      el('div', { class: 'pm-bottom-rule', style: { background: accent } }),
      el('div', { class: 'pm-bottom-row' }, [
        el('span', { class: 'pm-bottom-initial', style: { background: accent } }, initial),
        el('span', { class: 'pm-bottom-name' }, brandName),
        el('span', { class: 'pm-bottom-dot' }, '·'),
        el('span', { class: 'pm-bottom-tag' }, 'TESTIMONIAL')
      ])
    ])
  ]);
}
