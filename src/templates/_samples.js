// Sample placeholder used inside every template's thumbnail() so the picker
// previews look like real outputs — a generic WhatsApp-style chat screenshot
// works for every template (it represents "a testimonial screenshot"). Encoded
// inline as an SVG data URL so there's zero network cost in the picker.
const SVG = (
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280">' +
    '<rect width="200" height="280" fill="#e5ddd5"/>' +
    '<g opacity="0.18" stroke="#5a6b5a" fill="none" stroke-width="1">' +
      '<circle cx="22" cy="34" r="7"/>' +
      '<circle cx="170" cy="60" r="5"/>' +
      '<circle cx="48" cy="118" r="9"/>' +
      '<circle cx="158" cy="178" r="6"/>' +
      '<circle cx="80" cy="248" r="8"/>' +
      '<path d="M 130 30 q 6 -8 14 0"/>' +
      '<path d="M 30 220 q 8 -6 16 4"/>' +
    '</g>' +
    '<rect x="68" y="40" width="118" height="48" rx="9" fill="#dcf8c6"/>' +
    '<rect x="80" y="54" width="92" height="5" rx="2" fill="#0a4634" opacity="0.55"/>' +
    '<rect x="80" y="64" width="80" height="5" rx="2" fill="#0a4634" opacity="0.55"/>' +
    '<rect x="80" y="74" width="60" height="5" rx="2" fill="#0a4634" opacity="0.55"/>' +
    '<rect x="14" y="106" width="100" height="38" rx="9" fill="#ffffff"/>' +
    '<rect x="22" y="118" width="82" height="5" rx="2" fill="#1f1f1f" opacity="0.45"/>' +
    '<rect x="22" y="128" width="68" height="5" rx="2" fill="#1f1f1f" opacity="0.45"/>' +
    '<rect x="56" y="162" width="130" height="62" rx="9" fill="#dcf8c6"/>' +
    '<rect x="68" y="176" width="106" height="5" rx="2" fill="#0a4634" opacity="0.55"/>' +
    '<rect x="68" y="186" width="112" height="5" rx="2" fill="#0a4634" opacity="0.55"/>' +
    '<rect x="68" y="196" width="92" height="5" rx="2" fill="#0a4634" opacity="0.55"/>' +
    '<rect x="68" y="206" width="78" height="5" rx="2" fill="#0a4634" opacity="0.55"/>' +
  '</svg>'
);

export const SAMPLE_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(SVG);

// Sample texts used inside the mini previews so users can SEE the kind of
// content that will sit inside each template.
export const SAMPLE = {
  headline:    'תראו מה כתבו',
  subHeadline: 'הודעה אמיתית',
  caption:     'תודה! שירות מעולה.',
  quote:       'השירות הכי טוב שקיבלתי',
  authorName:  'שיר כהן',
  authorRole:  'לקוחה',
  statHead:    '100K₪',
  statSub:     'בחודש הראשון',
  captionLines: ['הלקוחות פנו אלינו', 'הצענו פתרון אמיתי', 'המכירה סגרה את עצמה']
};
