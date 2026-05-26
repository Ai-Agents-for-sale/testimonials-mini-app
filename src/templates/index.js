import * as phoneMockup     from './phoneMockup.js';
import * as whatsapp        from './whatsapp.js';
import * as googleReview    from './googleReview.js';
import * as blackProof      from './blackProof.js';
import * as funnelOverPhoto from './funnelOverPhoto.js';
import * as sunsetProof     from './sunsetProof.js';
import * as boldQuote       from './boldQuote.js';

export const TEMPLATES = [
  phoneMockup,
  whatsapp,
  googleReview,
  blackProof,
  funnelOverPhoto,
  sunsetProof,
  boldQuote
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.meta.id === id) || null;
}
