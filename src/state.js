import { getTemplate } from './templates/index.js';

const state = {
  brand: null,
  folders: [],
  selectedFolderId: null,
  selectedFolderName: '',
  galleryImages: [],
  templateId: null,
  format: 'feed',
  currentImage: null,
  excludeIds: [],
  generatedContent: null,
  editableValues: {},
  // Per-field size deltas (integer number of clicks, default 0). Each
  // step changes the displayed size by SIZE_STEP percent. Applied on top
  // of the template's CSS / data-fit-max default, after autofit runs.
  sizeAdjustments: {},
  scheduleAt: null
};

const SIZE_STEP = 0.10;
const SIZE_MIN_SCALE = 0.5;
const SIZE_MAX_SCALE = 2.0;

export function getState() {
  return state;
}

export function setBrand(brand) {
  state.brand = brand;
}

// Late-arriving brand logo. Init now returns brand without logoUrl so the
// folder picker loads fast; the logo is fetched in n8n after Respond Init
// and shipped down on the next response (typically review-start). This
// merges it in without clobbering the rest of the brand object.
export function setBrandLogo(logoUrl) {
  if (!logoUrl) return;
  state.brand = { ...(state.brand || {}), logoUrl };
}

export function setFolders(folders) {
  state.folders = Array.isArray(folders) ? folders : [];
}

export function setSelectedFolder(id, name) {
  state.selectedFolderId = id;
  state.selectedFolderName = name || '';
  state.excludeIds = [];
  state.galleryImages = [];
}

export function setGalleryImages(images) {
  state.galleryImages = Array.isArray(images) ? images : [];
}

export function setTemplate(id) {
  state.templateId = id;
}

export function setFormat(format) {
  state.format = format;
}

export function setCurrentImage(img) {
  state.currentImage = img;
  if (img && img.id && !state.excludeIds.includes(img.id)) {
    state.excludeIds = [...state.excludeIds, img.id];
  }
}

// Populate editableValues so each declared editable field has a real
// value — either what the AI returned, or the template's own default.
// Without this, the preview shows a fallback string (rendered by the
// template) but the input box shows empty, so typing in the box "erases"
// the visible preview text. With this, input + preview always match.
export function setGeneratedContent(content) {
  state.generatedContent = content || {};

  const template = getTemplate(state.templateId);
  const fields = (template && template.meta && template.meta.editableFields) || [];

  const next = {};
  fields.forEach((f) => {
    let v = state.generatedContent[f.key];
    if (Array.isArray(v)) v = v.join('\n');
    // No template-default fallback: if the AI returned nothing for this
    // field, leave it empty so the template's conditional render hides
    // the element entirely. The `default` is only shown as an input
    // placeholder hint, not as canvas content.
    if (v === undefined || v === null) v = '';
    next[f.key] = v;
  });
  // Carry through any AI fields the template doesn't declare (e.g. backgroundUrl)
  Object.keys(state.generatedContent).forEach((k) => {
    if (next[k] === undefined) next[k] = state.generatedContent[k];
  });

  state.editableValues = next;
}

export function setEditableValue(key, value) {
  state.editableValues = { ...state.editableValues, [key]: value };
}

// Bump the user's size adjustment for `key` by +1 (bigger) or -1 (smaller).
// Each step = SIZE_STEP%, clamped to [SIZE_MIN_SCALE, SIZE_MAX_SCALE].
export function adjustSize(key, direction) {
  const current = state.sizeAdjustments[key] || 0;
  const next = current + (direction > 0 ? 1 : -1);
  const scale = 1 + next * SIZE_STEP;
  if (scale < SIZE_MIN_SCALE || scale > SIZE_MAX_SCALE) return;
  state.sizeAdjustments = { ...state.sizeAdjustments, [key]: next };
}

export function getFieldScale(key) {
  const steps = state.sizeAdjustments[key] || 0;
  return 1 + steps * SIZE_STEP;
}

export function setScheduleAt(iso) {
  state.scheduleAt = iso;
}

// Reset just the per-post flow (keep brand, folders, selectedFolder).
// Used when looping back to pick another template within the same folder.
// Keeps currentImage + excludeIds so switching template re-uses the same
// image (and just regenerates the caption for the new template) — without
// this, every template switch picks a fresh random image and the user
// loses the image they were working with.
export function resetPostFlow() {
  state.templateId = null;
  state.format = 'feed';
  state.generatedContent = null;
  state.editableValues = {};
  state.sizeAdjustments = {};
  state.scheduleAt = null;
}

// Full reset back to "open the app" state. Used to switch folder.
export function resetAll() {
  resetPostFlow();
  state.currentImage = null;
  state.excludeIds = [];
  state.folders = [];
  state.galleryImages = [];
  state.selectedFolderId = null;
  state.selectedFolderName = '';
}
