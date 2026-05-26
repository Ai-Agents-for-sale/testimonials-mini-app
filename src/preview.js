import './styles.css';
import './preview.css';
import { el } from './dom.js';
import { TEMPLATES } from './templates/index.js';

// -----------------------------------------------------------------------------
// Mock brand + content. The brand has NO logoUrl so the brandLogo helper falls
// back to the color-dot + nameHe combo (which is what most clients without a
// logo will see). Swap in a real logo URL here if you want to preview logos.
// -----------------------------------------------------------------------------

const MOCK_BRAND = {
  name: 'THE NEXT LEVEL',
  nameHe: 'המותג שלך',
  primaryColor: '#1F6FB2',
  accentColor: '#F2C94C',
  logoUrl: '',
  defaultBackgroundUrl: '',
  fontFamily: 'Heebo'
};

// Placeholder testimonial screenshot — a simple inline SVG that looks like a
// generic chat / review card. Self-contained, no external requests.
const MOCK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="#fff"/>
  <rect x="0" y="0" width="600" height="60" fill="#075E54"/>
  <circle cx="36" cy="30" r="14" fill="#fff" opacity="0.18"/>
  <rect x="60" y="20" width="120" height="10" rx="3" fill="#fff" opacity="0.85"/>
  <rect x="60" y="36" width="80" height="8"  rx="3" fill="#fff" opacity="0.55"/>
  <rect x="80" y="100" width="440" height="60" rx="14" fill="#DCF8C6"/>
  <rect x="100" y="120" width="320" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="138" width="240" height="8" rx="3" fill="#333" opacity="0.5"/>
  <rect x="80" y="180" width="380" height="60" rx="14" fill="#fff" stroke="#ddd"/>
  <rect x="100" y="200" width="280" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="218" width="180" height="8" rx="3" fill="#333" opacity="0.5"/>
  <rect x="80" y="260" width="440" height="100" rx="14" fill="#DCF8C6"/>
  <rect x="100" y="280" width="380" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="298" width="340" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="316" width="200" height="8" rx="3" fill="#333" opacity="0.5"/>
  <rect x="80" y="380" width="320" height="80" rx="14" fill="#fff" stroke="#ddd"/>
  <rect x="100" y="400" width="220" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="418" width="180" height="8" rx="3" fill="#333" opacity="0.5"/>
  <text x="300" y="500" fill="#999" font-family="Heebo,sans-serif" font-size="22" text-anchor="middle">[ Mock Testimonial Screenshot ]</text>
</svg>
`.trim());

const MOCK_CONTENT = {
  headline:     'הנה ההוכחה.',
  subline:      'בלי פילטרים, בלי טריקים.',
  subHeadline:  '(סה״כ 20,000 ש״ח ביום)',
  caption:      'אצלנו כל לקוח מקבל יחס אמיתי — וזה מה שהופך את הסיפור שלו לעוד הצלחה.',
  captionLines: [
    'אחרי שראינו את ההתעניינות,',
    'אחרי שעברנו לשיחה אישית,',
    'הלקוח חזר עם בקשה לעוד ועוד.'
  ],
  statLine:     'הכניס מעל 100,000 ₪ בחודש הראשון.',
  quote:        'השירות הכי טוב שקיבלתי, ממליצה בחום! לא מקרב את הלקוחות — בונה אותם.',
  authorName:   'שיר כהן',
  authorRole:   'לקוחה, תל אביב',
  sourceImageUrl: MOCK_IMAGE,
  backgroundUrl: ''
};

const FORMATS = [
  { id: 'feed',  labelHe: '📱 פיד 4:5',   w: 1080, h: 1350 },
  { id: 'story', labelHe: '📰 סטורי 9:16', w: 1080, h: 1920 }
];

// -----------------------------------------------------------------------------
// Render
// -----------------------------------------------------------------------------

const root = document.getElementById('app');

const header = el('header', { class: 'pv-header' }, [
  el('div', { class: 'pv-title' }, '🎨 Templates Preview'),
  el('div', { class: 'pv-sub' }, 'כל התבניות עם דאטה מדומה. גלגלו, השוו, הגידו לי מה לתקן.')
]);
root.appendChild(header);

// Brand legend (so you can see which color is which)
const legend = el('section', { class: 'pv-legend' }, [
  el('div', { class: 'pv-legend-row' }, [
    el('span', { class: 'pv-swatch', style: { background: MOCK_BRAND.primaryColor } }),
    el('span', {}, 'primaryColor — ' + MOCK_BRAND.primaryColor)
  ]),
  el('div', { class: 'pv-legend-row' }, [
    el('span', { class: 'pv-swatch', style: { background: MOCK_BRAND.accentColor } }),
    el('span', {}, 'accentColor — ' + MOCK_BRAND.accentColor)
  ]),
  el('div', { class: 'pv-legend-row' }, [
    el('span', { class: 'pv-swatch pv-swatch-text' }, 'Aa'),
    el('span', {}, 'nameHe / name — ' + MOCK_BRAND.nameHe + ' / ' + MOCK_BRAND.name)
  ])
]);
root.appendChild(legend);

TEMPLATES.forEach((tpl, idx) => {
  const section = el('section', { class: 'pv-section' });

  const head = el('div', { class: 'pv-section-head' }, [
    el('div', {}, [
      el('div', { class: 'pv-section-num' }, '#' + (idx + 1)),
      el('div', { class: 'pv-section-name' }, tpl.meta.nameHe),
      el('div', { class: 'pv-section-id' }, 'id: ' + tpl.meta.id)
    ]),
    el('div', { class: 'pv-section-desc' }, tpl.meta.description || '')
  ]);
  section.appendChild(head);

  // Editable fields summary
  const fields = (tpl.meta && tpl.meta.editableFields) || [];
  if (fields.length) {
    section.appendChild(el('div', { class: 'pv-fields' },
      fields.map((f) => el('span', { class: 'pv-field-tag' }, f.labelHe))
    ));
  }

  // Renders
  const canvases = el('div', { class: 'pv-canvases' });
  FORMATS.forEach((fmt) => {
    const stage = el('div', { class: 'pv-stage pv-stage-' + fmt.id });
    stage.style.aspectRatio = fmt.w + ' / ' + fmt.h;

    const scale = el('div', { class: 'pv-scale' });
    scale.style.height = fmt.h + 'px';
    scale.appendChild(tpl.render({
      content: MOCK_CONTENT,
      brand: MOCK_BRAND,
      format: fmt.id
    }));

    stage.appendChild(scale);

    canvases.appendChild(el('div', { class: 'pv-canvas-wrap' }, [
      el('div', { class: 'pv-canvas-label' }, fmt.labelHe + ' · ' + fmt.w + '×' + fmt.h),
      stage
    ]));
  });
  section.appendChild(canvases);

  root.appendChild(section);
});

// Sync scale on resize so the preview always fits its column
function syncScales() {
  document.querySelectorAll('.pv-stage').forEach((stage) => {
    const w = stage.clientWidth;
    if (!w) return;
    stage.style.setProperty('--pv-scale', String(w / 1080));
  });
}
setTimeout(syncScales, 0);
window.addEventListener('resize', syncScales);
