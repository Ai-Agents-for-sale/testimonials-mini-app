import { el } from '../dom.js';

export const meta = {
  id: 'phone-mockup',
  nameHe: 'מוקאפ פאלפון',
  type: 'phone-mockup',
  description: 'הסקרינשוט יושב בתוך מסגרת אייפון, חיצים מסביב, רקע גראדיאנט רדיאלי מהמרכז עם עיגולים גדולים בצבעי המותג.',
  editableFields: [
    { key: 'headline',    labelHe: 'כותרת ראשית', default: 'תראו מה כתבו לנו.' },
    { key: 'subHeadline', labelHe: 'תת-כותרת', default: 'הודעה אמיתית. צילום אמיתי.' }
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
  const headline    = content.headline;
  const subHeadline = content.subHeadline;
  const imageUrl    = content.sourceImageUrl;

  return el('div', {
    class: 'tpl-canvas format-' + format + ' tpl-mockup',
    // Centred radial gradient: brand primary glows from the middle and
    // fades into deep navy at the edges. Replaces the previous off-axis
    // 155° linear gradient.
    style: { background: 'radial-gradient(ellipse at center, ' + primary + ' 0%, #0a0e1a 85%)' }
  }, [
    // Background decoration — large blurred color orbs
    el('div', { class: 'pm-bg-orbs' }, [
      el('span', { class: 'pm-orb pm-orb-accent', style: { background: accent } }),
      el('span', { class: 'pm-orb pm-orb-primary', style: { background: primary } }),
      el('span', { class: 'pm-orb pm-orb-soft', style: { background: '#fff' } })
    ]),

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
    (headline || subHeadline) ? el('div', { class: 'pm-headline-block' }, [
      headline ? el('div', {
        class: 'pm-headline',
        'data-field': 'headline',
        'data-fit-max': '92', 'data-fit-min': '40'
      }, headline) : null,
      subHeadline ? el('div', {
        class: 'pm-subhead',
        style: { color: accent },
        'data-field': 'subHeadline',
        'data-fit-max': '32', 'data-fit-min': '20'
      }, subHeadline) : null
    ]) : null,

    // Phone mockup with the screenshot inside it, flanked by curvy arrows
    el('div', { class: 'pm-stage' }, [
      curvyArrow({ variant: 'right', accent }),

      el('div', { class: 'pm-phone', 'data-field': 'image' }, [
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

      curvyArrow({ variant: 'left', accent })
    ]),

    // Bottom signature
    el('div', { class: 'pm-bottom' }, [
      el('div', { class: 'pm-bottom-rule', style: { background: accent } }),
      el('div', { class: 'pm-bottom-row' }, [
        el('span', { class: 'pm-bottom-initial', style: { background: accent } }, initial),
        el('span', { class: 'pm-bottom-name' }, brandName)
      ])
    ])
  ]);
}
