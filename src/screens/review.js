import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { pickRandomImage, generateCaption, submitFinal } from '../api.js';
import { getTemplate } from '../templates/index.js';
import {
  getState,
  setCurrentImage,
  setGeneratedContent,
  setEditableValue,
  setFormat,
  setScheduleAt
} from '../state.js';
import { renderCanvasToPng, dataUrlToBase64 } from '../png.js';

const FORMAT_DIMS = {
  feed:  { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 }
};

export function reviewScreen({ goBack, onPublished }) {
  const state = getState();
  const template = getTemplate(state.templateId);

  if (!template) {
    setTimeout(goBack, 0);
    return el('div', {}, 'אין תבנית נבחרת');
  }

  const editableFields = (template.meta && template.meta.editableFields) || [];

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'header' }, [
      el('button', { class: 'back-btn', onClick: () => { haptic('light'); goBack(); } }, '› חזרה'),
      el('span', { class: 'header-title right' }, template.meta.nameHe)
    ])
  ]);

  // -------- Format toggle --------
  const formatBtns = {};
  function setFormatAndRender(f) {
    setFormat(f);
    Object.keys(formatBtns).forEach((k) => {
      formatBtns[k].classList.toggle('active', k === f);
    });
    applyStageFormat();
    renderCanvas();
  }
  const formatBar = el('div', { class: 'rv-format-bar' }, [
    el('div', { class: 'rv-format-label' }, 'פורמט:'),
    el('button', { class: 'rv-format-btn' + (state.format === 'feed' ? ' active' : ''),
                   onClick: () => { haptic('light'); setFormatAndRender('feed'); } }, '📱 פיד 4:5'),
    el('button', { class: 'rv-format-btn' + (state.format === 'story' ? ' active' : ''),
                   onClick: () => { haptic('light'); setFormatAndRender('story'); } }, '📰 סטורי 9:16')
  ]);
  formatBtns.feed  = formatBar.children[1];
  formatBtns.story = formatBar.children[2];
  root.appendChild(formatBar);

  // -------- Preview stage --------
  const stage = el('div', { class: 'rv-stage' });
  const canvasWrap = el('div', { class: 'rv-canvas-scale' });
  stage.appendChild(canvasWrap);
  root.appendChild(stage);

  function applyStageFormat() {
    const dims = FORMAT_DIMS[state.format] || FORMAT_DIMS.feed;
    stage.style.aspectRatio = dims.w + ' / ' + dims.h;
    canvasWrap.style.height = dims.h + 'px';
    syncScale();
  }
  function syncScale() {
    const w = stage.clientWidth;
    if (!w) return;
    stage.style.setProperty('--canvas-scale', String(w / 1080));
  }
  setTimeout(() => { applyStageFormat(); syncScale(); }, 0);
  window.addEventListener('resize', syncScale);

  let canvasEl = null;

  function buildContent() {
    const img = state.currentImage;
    const ev = state.editableValues || {};
    return {
      headline:       ev.headline,
      subline:        ev.subline,
      subHeadline:    ev.subHeadline,
      caption:        ev.caption,
      captionLines:   ev.captionLines,
      statLine:       ev.statLine,
      quote:          ev.quote,
      authorName:     ev.authorName,
      authorRole:     ev.authorRole,
      backgroundUrl:  (state.generatedContent && state.generatedContent.backgroundUrl) || '',
      sourceImageUrl: img ? img.imageUrl : null
    };
  }

  function renderCanvas() {
    canvasWrap.replaceChildren();
    canvasEl = template.render({
      content: buildContent(),
      brand: state.brand || {},
      format: state.format
    });
    canvasWrap.appendChild(canvasEl);
  }
  renderCanvas();

  // -------- Image action row (re-roll + upload) --------
  const imgStatus = el('div', { class: 'rv-img-status' });
  const fileInput = el('input', { type: 'file', accept: 'image/*', class: 'hidden' });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCurrentImage({ id: 'local-' + Date.now(), imageUrl: url, mimeType: file.type, local: true });
    renderCanvas();
    regenerateCaption();
  });

  const imgActions = el('div', { class: 'rv-img-actions' }, [
    el('button', { class: 'btn btn-secondary',
                   onClick: () => { haptic('light'); pickAnotherFromDrive(); } }, '🎲 תמונה אחרת מהתיקייה'),
    el('button', { class: 'btn btn-secondary',
                   onClick: () => { haptic('light'); fileInput.click(); } }, '📁 העלה מהמכשיר')
  ]);
  root.appendChild(imgActions);
  root.appendChild(fileInput);
  root.appendChild(imgStatus);

  // -------- Editable fields --------
  const fieldsBlock = el('div', { class: 'rv-fields' });
  function renderFieldInputs() {
    fieldsBlock.replaceChildren();
    editableFields.forEach((f) => {
      const val = state.editableValues[f.key] || '';
      const input = f.multiline
        ? el('textarea', {
            class: 'rv-field-input', dir: 'rtl', rows: f.linesField ? 4 : 3, value: val,
            onInput: (e) => { setEditableValue(f.key, e.target.value); renderCanvas(); }
          })
        : el('input', {
            type: 'text', class: 'rv-field-input rv-field-input-single', dir: 'rtl', value: val,
            onInput: (e) => { setEditableValue(f.key, e.target.value); renderCanvas(); }
          });
      fieldsBlock.appendChild(el('div', { class: 'rv-field' }, [
        el('div', { class: 'rv-field-label' }, f.labelHe),
        input
      ]));
    });
  }
  renderFieldInputs();
  root.appendChild(fieldsBlock);

  // -------- Regenerate caption --------
  const regenBtn = el('button', { class: 'btn btn-secondary rv-regen' }, '🔄 צור טקסט חדש');
  regenBtn.addEventListener('click', () => { haptic('light'); regenerateCaption(true); });
  root.appendChild(regenBtn);

  // -------- Schedule + publish (button-style, no checkbox) --------
  const scheduleBlock = el('div', { class: 'rv-schedule-block hidden' });
  const scheduleInput = el('input', { type: 'datetime-local', class: 'rv-datetime' });
  const scheduleHint = el('div', { class: 'rv-schedule-hint' }, 'בחר תאריך ושעה לפרסום אוטומטי');
  scheduleBlock.appendChild(scheduleHint);
  scheduleBlock.appendChild(scheduleInput);

  const statusEl = el('div', { class: 'rv-status' });

  const publishBtn  = el('button', { class: 'btn btn-primary rv-action' }, '🚀 פרסם עכשיו');
  const scheduleBtn = el('button', { class: 'btn btn-secondary rv-action' }, '📅 תזמן לפרסום');
  const actionRow = el('div', { class: 'rv-action-row' }, [publishBtn, scheduleBtn]);

  const confirmRow = el('div', { class: 'rv-action-row hidden' });
  const cancelScheduleBtn  = el('button', { class: 'btn btn-secondary rv-action' }, '← ביטול');
  const confirmScheduleBtn = el('button', { class: 'btn btn-primary rv-action' }, '✅ אשר תזמון');
  confirmRow.appendChild(cancelScheduleBtn);
  confirmRow.appendChild(confirmScheduleBtn);

  publishBtn.addEventListener('click', () => { haptic('medium'); doSubmit(null); });
  scheduleBtn.addEventListener('click', () => {
    haptic('light');
    scheduleBlock.classList.remove('hidden');
    actionRow.classList.add('hidden');
    confirmRow.classList.remove('hidden');
  });
  cancelScheduleBtn.addEventListener('click', () => {
    scheduleBlock.classList.add('hidden');
    actionRow.classList.remove('hidden');
    confirmRow.classList.add('hidden');
    setScheduleAt(null);
    scheduleInput.value = '';
  });
  confirmScheduleBtn.addEventListener('click', () => {
    haptic('medium');
    const v = scheduleInput.value;
    if (!v) { statusEl.textContent = 'בחר תאריך ושעה'; return; }
    const iso = new Date(v).toISOString();
    if (new Date(iso).getTime() < Date.now()) {
      statusEl.textContent = 'בחר תאריך עתידי';
      return;
    }
    setScheduleAt(iso);
    doSubmit(iso);
  });

  root.appendChild(actionRow);
  root.appendChild(scheduleBlock);
  root.appendChild(confirmRow);
  root.appendChild(statusEl);

  // -------- Behaviors --------
  function pickAnotherFromDrive() {
    if (!state.selectedFolderId) {
      imgStatus.textContent = 'לא נבחרה תיקייה';
      return;
    }
    imgStatus.textContent = 'טוען תמונה חדשה…';
    pickRandomImage(state.selectedFolderId, state.excludeIds)
      .then((res) => {
        if (!res || !res.imageUrl) throw new Error('לא הוחזרה תמונה');
        setCurrentImage({ id: res.id, imageUrl: res.imageUrl, mimeType: res.mimeType });
        imgStatus.textContent = '';
        renderCanvas();
        regenerateCaption();
      })
      .catch((err) => { imgStatus.textContent = 'שגיאה: ' + err.message; });
  }

  function regenerateCaption(userInitiated = false) {
    const img = state.currentImage;
    if (!img) return;
    if (userInitiated) { regenBtn.disabled = true; regenBtn.textContent = 'מנסח…'; }
    else statusEl.textContent = 'מנסח טקסט מותאם…';
    return generateCaption({
      imageId: img.id,
      imageUrl: img.imageUrl,
      templateId: template.meta.id,
      templateType: template.meta.type,
      regenerate: userInitiated
    })
      .then((res) => {
        setGeneratedContent(res || {});
        renderFieldInputs();
        renderCanvas();
        if (!userInitiated) statusEl.textContent = '';
      })
      .catch((err) => {
        statusEl.textContent = 'שגיאה: ' + err.message;
      })
      .finally(() => {
        if (userInitiated) { regenBtn.disabled = false; regenBtn.textContent = '🔄 צור טקסט חדש'; }
      });
  }

  async function doSubmit(scheduleAt) {
    publishBtn.disabled = true;
    scheduleBtn.disabled = true;
    confirmScheduleBtn.disabled = true;
    statusEl.textContent = 'מרנדר תמונה…';
    try {
      const dims = FORMAT_DIMS[state.format] || FORMAT_DIMS.feed;
      const dataUrl = await renderCanvasToPng(canvasEl, dims);
      const base64 = dataUrlToBase64(dataUrl);
      statusEl.textContent = 'שולח ל-n8n…';
      await submitFinal({
        imageBase64: base64,
        caption: state.editableValues.caption || state.editableValues.quote || '',
        headline: state.editableValues.headline || '',
        templateId: template.meta.id,
        format: state.format,
        sourceImageId: state.currentImage ? state.currentImage.id : null,
        scheduleAt
      });
      statusEl.textContent = scheduleAt ? '✅ תוזמן בהצלחה' : '✅ נשלח לפרסום';
      if (onPublished) setTimeout(onPublished, 1200);
    } catch (err) {
      statusEl.textContent = 'שגיאה: ' + err.message;
      publishBtn.disabled = false;
      scheduleBtn.disabled = false;
      confirmScheduleBtn.disabled = false;
    }
  }

  // -------- Bootstrap on mount: pick image + generate caption --------
  if (!state.currentImage) {
    pickAnotherFromDrive();
  } else if (!state.generatedContent) {
    regenerateCaption();
  }

  return root;
}
