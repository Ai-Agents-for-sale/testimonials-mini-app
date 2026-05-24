import * as blackProof from './blackProof.js';
import * as funnelOverPhoto from './funnelOverPhoto.js';
import * as sunsetProof from './sunsetProof.js';
import * as boldQuote from './boldQuote.js';

export const TEMPLATES = [blackProof, funnelOverPhoto, sunsetProof, boldQuote];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.meta.id === id) || null;
}
