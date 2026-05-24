const state = {
  brand: null,
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

export function setGeneratedContent(content) {
  state.generatedContent = content || {};
  state.editableValues = { ...state.generatedContent };
  if (Array.isArray(state.editableValues.captionLines)) {
    state.editableValues.captionLines = state.editableValues.captionLines.join('\n');
  }
}

export function setEditableValue(key, value) {
  state.editableValues = { ...state.editableValues, [key]: value };
}

export function setScheduleAt(iso) {
  state.scheduleAt = iso;
}

export function resetFlow() {
  state.templateId = null;
  state.format = 'feed';
  state.currentImage = null;
  state.excludeIds = [];
  state.generatedContent = null;
  state.editableValues = {};
  state.scheduleAt = null;
}
