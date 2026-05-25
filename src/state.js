const state = {
  brand: null,
  folders: [],
  selectedFolderId: null,
  selectedFolderName: '',
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
  state.selectedFolderId = null;
  state.selectedFolderName = '';
}
