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

  const root = el('div', { class: 'screen' });

  // ============================================================
  // View renderers — swap into `root` based on async state
  // ============================================================

  function renderLoading() {
    root.replaceChildren(
      el('div', { class: 'screen-state screen-state-loading' }, [
        el('div', { class: 'state-emoji pulse' }, '🎨'),
        el('div', { class: 'state-title' }, 'מכין לך את הפוסט…'),
        el('div', { class: 'state-sub' }, 'שולף תמונה מהתיקייה ויוצר טקסט שיווקי'),
        el('div', { class: 'state-bar' }, [el('div', { class: 'state-bar-fill' })])
      ])
    );
  }

  function renderEmptyFolder() {
    root.replaceChildren(
      el('div', { class: 'screen-state screen-state-empty' }, [
        el('div', { class: 'state-emoji' }, '📭'),
        el('div', { class: 'state-title' }, 'אין תמונות בתיקייה הזו'),
        el('div', { class: 'state-sub' }, 'התיקייה ' + (state.selectedFolderName || '') + ' לא מכילה צילומים. בחר תיקייה אחרת.'),
        el('button', {
          class: 'btn btn-primary state-action',
          onClick: () => { haptic('light'); goBack(); }
        }, '← חזרה לתבניות'),
        el('button', {
          class: 'btn btn-secondary state-action',
          onClick: () => { haptic('light'); goBack(); setTimeout(goBack, 50); }
        }, '🗂️ בחר תיקייה אחרת')
      ])
    );
  }

  function renderError(message) {
    root.replaceChildren(
      el('div', { class: 'screen-state screen-state-error' }, [
        el('div', { class: 'state-emoji' }, '⚠️'),
        el('div', { class: 'state-title' }, 'שגיאה'),
        el('div', { class: 'state-sub' }, message || 'משהו השתבש'),
        el('button', {
          class: 'btn btn-primary state-action',
          onClick: () => { haptic('light'); renderLoading(); loadInitial(); }
        }, '🔁 נסה שוב'),
        el('button', {
          class: 'btn btn-secondary state-action',
          onClick: () => { haptic('light'); goBack(); }
        }, '← חזרה')
      ])
    );
  }

  function renderReview() {
    root.replaceChildren(buildReviewView());
  }

  // ============================================================
  // The actual review UI (built once we have image + content)
  // ============================================================

  let canvasEl = null;
  let stage = null;
  let canvasWrap = null;
  let captionsBlockEl = null;
  let statusEl = null;
  let regenBtn = null;
  let publishBtn = null;
  let scheduleBtn = null;
  let confirmScheduleBtn = null;

  function buildReviewView() {
    const wrap = el('div', {}, [
      el('div', { class: 'header' }, [
        el('button', { class: 'back-btn', onClick: () => { haptic('light'); goBack(); } }, '› חזרה'),
        el('span', { class: 'header-title right' }, template.meta.nameHe)
      ])
    ]);

    // --- Format toggle ---
    const formatBtns = {};
    function setFormatAndRender(f) {
      setFormat(f);
      Object.keys(formatBtns).forEach((k) => formatBtns[k].classList.toggle('active', k === f));
      applyStageFormat();
      renderCanvas();
    }
    const formatBar = el('div', { class: 'rv-format-bar' }, [
      el('div', { class: 'rv-format-label' }, 'פורמט:'),
      el('button', {
        class: 'rv-format-btn' + (state.format === 'feed' ? ' active' : ''),
        onClick: () => { haptic('light'); setFormatAndRender('feed'); }
      }, '📱 פיד 4:5'),
      el('button', {
        class: 'rv-format-btn' + (state.format === 'story' ? ' active' : ''),
        onClick: () => { haptic('light'); setFormatAndRender('story'); }
      }, '📰 סטורי 9:16')
    ]);
    formatBtns.feed = formatBar.children[1];
    formatBtns.story = formatBar.children[2];
    wrap.appendChild(formatBar);

    // --- Stage ---
    stage = el('div', { class: 'rv-stage' });
    canvasWrap = el('div', { class: 'rv-canvas-scale' });
    stage.appendChild(canvasWrap);
    wrap.appendChild(stage);

    // --- Image actions ---
    const imgStatus = el('div', { class: 'rv-img-status' });
    const fileInput = el('input', { type: 'file', accept: 'image/*', class: 'hidden' });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setCurrentImage({ id: 'local-' + Date.now(), imageUrl: url, mimeType: file.type, local: true });
      renderCanvas();
      regenerateCaptionInline(imgStatus);
    });
    wrap.appendChild(el('div', { class: 'rv-img-actions' }, [
      el('button', {
        class: 'btn btn-secondary',
        onClick: () => { haptic('light'); rerollInline(imgStatus); }
      }, '🎲 תמונה אחרת מהתיקייה'),
      el('button', {
        class: 'btn btn-secondary',
        onClick: () => { haptic('light'); fileInput.click(); }
      }, '📁 העלה מהמכשיר')
    ]));
    wrap.appendChild(fileInput);
    wrap.appendChild(imgStatus);

    // --- Editable fields ---
    captionsBlockEl = el('div', { class: 'rv-fields' });
    renderFieldInputs();
    wrap.appendChild(captionsBlockEl);

    // --- Regenerate ---
    regenBtn = el('button', { class: 'btn btn-secondary rv-regen' }, '🔄 צור טקסט חדש');
    regenBtn.addEventListener('click', () => { haptic('light'); regenerateCaptionInline(null, true); });
    wrap.appendChild(regenBtn);

    // --- Action buttons ---
    statusEl = el('div', { class: 'rv-status' });
    publishBtn  = el('button', { class: 'btn btn-primary rv-action' }, '🚀 פרסם עכשיו');
    scheduleBtn = el('button', { class: 'btn btn-secondary rv-action' }, '📅 תזמן לפרסום');
    const actionRow = el('div', { class: 'rv-action-row' }, [publishBtn, scheduleBtn]);

    const scheduleBlock = el('div', { class: 'rv-schedule-block hidden' });
    const scheduleInput = el('input', { type: 'datetime-local', class: 'rv-datetime' });
    scheduleBlock.appendChild(el('div', { class: 'rv-schedule-hint' }, 'בחר תאריך ושעה לפרסום אוטומטי'));
    scheduleBlock.appendChild(scheduleInput);

    const confirmRow = el('div', { class: 'rv-action-row hidden' });
    const cancelBtn = el('button', { class: 'btn btn-secondary rv-action' }, '← ביטול');
    confirmScheduleBtn = el('button', { class: 'btn btn-primary rv-action' }, '✅ אשר תזמון');
    confirmRow.appendChild(cancelBtn);
    confirmRow.appendChild(confirmScheduleBtn);

    publishBtn.addEventListener('click', () => { haptic('medium'); doSubmit(null); });
    scheduleBtn.addEventListener('click', () => {
      haptic('light');
      scheduleBlock.classList.remove('hidden');
      actionRow.classList.add('hidden');
      confirmRow.classList.remove('hidden');
    });
    cancelBtn.addEventListener('click', () => {
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
      if (new Date(iso).getTime() < Date.now()) { statusEl.textContent = 'בחר תאריך עתידי'; return; }
      setScheduleAt(iso);
      doSubmit(iso);
    });

    wrap.appendChild(actionRow);
    wrap.appendChild(scheduleBlock);
    wrap.appendChild(confirmRow);
    wrap.appendChild(statusEl);

    // Sync stage to format after DOM insert
    setTimeout(() => { applyStageFormat(); syncScale(); renderCanvas(); }, 0);
    window.addEventListener('resize', syncScale);

    return wrap;
  }

  // ============================================================
  // Canvas + fields helpers (run after buildReviewView)
  // ============================================================

  function applyStageFormat() {
    if (!stage) return;
    const dims = FORMAT_DIMS[state.format] || FORMAT_DIMS.feed;
    stage.style.aspectRatio = dims.w + ' / ' + dims.h;
    if (canvasWrap) canvasWrap.style.height = dims.h + 'px';
    syncScale();
  }

  function syncScale() {
    if (!stage) return;
    const w = stage.clientWidth;
    if (!w) return;
    stage.style.setProperty('--canvas-scale', String(w / 1080));
  }

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
    if (!canvasWrap) return;
    canvasWrap.replaceChildren();
    canvasEl = template.render({
      content: buildContent(),
      brand: state.brand || {},
      format: state.format
    });
    canvasWrap.appendChild(canvasEl);
  }

  function renderFieldInputs() {
    if (!captionsBlockEl) return;
    captionsBlockEl.replaceChildren();
    const fields = (template.meta && template.meta.editableFields) || [];
    fields.forEach((f) => {
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
      captionsBlockEl.appendChild(el('div', { class: 'rv-field' }, [
        el('div', { class: 'rv-field-label' }, f.labelHe),
        input
      ]));
    });
  }

  // ============================================================
  // Behaviors
  // ============================================================

  function rerollInline(statusNode) {
    if (!state.selectedFolderId) { if (statusNode) statusNode.textContent = 'לא נבחרה תיקייה'; return; }
    if (statusNode) statusNode.textContent = 'טוען תמונה חדשה…';
    pickRandomImage(state.selectedFolderId, state.excludeIds)
      .then((res) => {
        if (res && res.empty) { if (statusNode) statusNode.textContent = 'אין עוד תמונות חדשות בתיקייה'; return; }
        if (!res || !res.imageUrl) throw new Error('לא הוחזרה תמונה');
        setCurrentImage({ id: res.id, imageUrl: res.imageUrl, mimeType: res.mimeType });
        if (statusNode) statusNode.textContent = '';
        renderCanvas();
        regenerateCaptionInline(statusNode);
      })
      .catch((err) => { if (statusNode) statusNode.textContent = 'שגיאה: ' + err.message; });
  }

  function regenerateCaptionInline(statusNode, userInitiated = false) {
    const img = state.currentImage;
    if (!img) return Promise.resolve();
    if (userInitiated && regenBtn) { regenBtn.disabled = true; regenBtn.textContent = 'מנסח…'; }
    else if (statusNode) statusNode.textContent = 'מנסח טקסט מותאם…';
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
        if (statusNode) statusNode.textContent = '';
      })
      .catch((err) => {
        if (statusEl) statusEl.textContent = 'שגיאה: ' + err.message;
      })
      .finally(() => {
        if (userInitiated && regenBtn) { regenBtn.disabled = false; regenBtn.textContent = '🔄 צור טקסט חדש'; }
      });
  }

  async function doSubmit(scheduleAt) {
    if (!publishBtn || !scheduleBtn || !confirmScheduleBtn || !statusEl) return;
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
      if (onPublished) setTimeout(onPublished, 1000);
    } catch (err) {
      statusEl.textContent = 'שגיאה: ' + err.message;
      publishBtn.disabled = false;
      scheduleBtn.disabled = false;
      confirmScheduleBtn.disabled = false;
    }
  }

  // ============================================================
  // Initial load — sequential: image first, then caption
  // ============================================================

  async function loadInitial() {
    try {
      if (!state.selectedFolderId) {
        renderError('לא נבחרה תיקייה');
        return;
      }
      const img = await pickRandomImage(state.selectedFolderId, []);
      if (img && img.empty) {
        renderEmptyFolder();
        return;
      }
      if (!img || !img.imageUrl) {
        renderError('לא הוחזרה תמונה מהתיקייה');
        return;
      }
      setCurrentImage({ id: img.id, imageUrl: img.imageUrl, mimeType: img.mimeType });

      const content = await generateCaption({
        imageId: img.id,
        imageUrl: img.imageUrl,
        templateId: template.meta.id,
        templateType: template.meta.type,
        regenerate: false
      });
      setGeneratedContent(content || {});

      renderReview();
    } catch (err) {
      renderError(err.message || String(err));
    }
  }

  // Boot
  renderLoading();
  loadInitial();

  return root;
}
