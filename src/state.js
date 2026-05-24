const state = {
  brand: null,
  templateId: null,
  currentImage: null,
  excludeIds: [],
  generatedContent: null,
  captionDraft: '',
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

export function setCurrentImage(img) {
  state.currentImage = img;
  if (img && img.id && !state.excludeIds.includes(img.id)) {
    state.excludeIds = [...state.excludeIds, img.id];
  }
}

export function setGeneratedContent(content) {
  state.generatedContent = content;
  state.captionDraft = (content && content.caption) || '';
}

export function setCaptionDraft(text) {
  state.captionDraft = text;
}

export function setScheduleAt(iso) {
  state.scheduleAt = iso;
}

export function resetFlow() {
  state.templateId = null;
  state.currentImage = null;
  state.excludeIds = [];
  state.generatedContent = null;
  state.captionDraft = '';
  state.scheduleAt = null;
}
