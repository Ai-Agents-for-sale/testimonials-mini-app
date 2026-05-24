import { el } from '../dom.js';

// Renders a brand logo with a robust text fallback.
// If brand.logoUrl is missing OR fails to load, we show a colored dot
// + brand name in the requested style. No CSS filter is applied to
// the logo, so white-on-light or dark-on-dark logos are the user's
// responsibility (deliver the correctly-colored asset).
export function brandLogo({ brand, className = 'brand-logo', textClass = 'brand-logo-text', dotClass = 'brand-logo-dot', accent = '#F2C94C' }) {
  const fallbackText = brand.nameHe || brand.name || 'BRAND';

  if (!brand.logoUrl) {
    return el('div', { class: textClass }, [
      el('span', { class: dotClass, style: { background: accent } }),
      el('span', {}, fallbackText)
    ]);
  }

  const img = el('img', { class: className, src: brand.logoUrl, crossorigin: 'anonymous' });
  img.addEventListener('error', () => {
    img.replaceWith(el('div', { class: textClass }, [
      el('span', { class: dotClass, style: { background: accent } }),
      el('span', {}, fallbackText)
    ]));
  });
  return img;
}
