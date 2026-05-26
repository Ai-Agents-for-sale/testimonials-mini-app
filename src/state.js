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
  scheduleAt: null
};

export function getState() {
  return state;
}

export function setBrand(brand) {
  state.brand = brand;
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
    if (v === undefined || v === null || v === '') v = f.default || '';
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

export function setScheduleAt(iso) {
  state.scheduleAt = iso;
}

// Reset just the per-post flow (keep brand, folders, selectedFolder).
// Used when looping back to pick another template within the same folder.
export function resetPostFlow() {
  state.templateId = null;
  state.format = 'feed';
  state.currentImage = null;
  state.excludeIds = [];
  state.generatedContent = null;
  state.editableValues = {};
  state.scheduleAt = null;
}

// Full reset back to "open the app" state. Used to switch folder.
export function resetAll() {
  resetPostFlow();
  state.folders = [];
  state.galleryImages = [];
  state.selectedFolderId = null;
  state.selectedFolderName = '';
}
