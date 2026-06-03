import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { pickRandomImage, generateCaption, submitFinal, fetchReviewStart } from '../api.js';
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
import { autofitCanvas } from '../autofit.js';

const FORMAT_DIMS = {
  feed:  { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 }
};

export function reviewScreen({ navigate, goBack, onPublished }) {
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

  function renderLoading(customTitle) {
    root.replaceChildren(
      el('div', { class: 'screen-state screen-state-loading' }, [
        el('div', { class: 'state-emoji pulse' }, '🎨'),
        el('div', { class: 'state-title' }, customTitle || 'מכין לך את הפוסט…'),
        el('div', { class: 'state-sub' }, customTitle
          ? 'המודל מנתח את התמונה ויוצר טקסט חדש מותאם'
          : 'שולף תמונה מהתיקייה ויוצר טקסט שיווקי'),
        el('div', { class: 'state-bar' }, [el('div', { class: 'state-bar-fill' })])
      ])
    );
  }

  function renderEmptyFolder() {
    // Popup-style modal: dim backdrop + centered card with two actions.
    // Tapping the backdrop closes the popup and pops back to folders.
    const backdrop = el('div', { class: 'popup-backdrop' });
    const card = el('div', { class: 'popup-card' }, [
      el('div', { class: 'popup-emoji' }, '📭'),
      el('div', { class: 'popup-title' }, 'אין תמונות בתיקייה הזו'),
      el('div', { class: 'popup-sub' },
        'התיקייה "' + (state.selectedFolderName || '') + '" לא מכילה צילומים. בחר תיקייה אחרת כדי להמשיך.'),
      el('div', { class: 'popup-actions' }, [
        el('button', {
          class: 'btn btn-primary popup-btn',
          onClick: () => { haptic('light'); goBack(); setTimeout(goBack, 30); }
        }, '🗂️ בחר תיקייה אחרת'),
        el('button', {
          class: 'btn btn-secondary popup-btn',
          onClick: () => { haptic('light'); goBack(); }
        }, '← חזרה לתבניות')
      ])
    ]);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) { haptic('light'); goBack(); setTimeout(goBack, 30); }
    });
    backdrop.appendChild(card);

    // Keep the loading view dimmed underneath so the popup truly feels overlaid.
    root.replaceChildren(
      el('div', { class: 'screen-state screen-state-loading dimmed' }, [
        el('div', { class: 'state-emoji' }, '🎨'),
        el('div', { class: 'state-title' }, 'מכין לך את הפוסט…')
      ]),
      backdrop
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
        onClick: () => { haptic('light'); if (navigate) navigate('gallery'); }
      }, '🖼️ בחר תמונה אחרת'),
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

    publishBtn.addEventListener('click', () => { haptic('medium'); doSubmit(null); });
    scheduleBtn.addEventListener('click', () => { haptic('light'); openScheduleModal(); });

    wrap.appendChild(actionRow);
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
    // Shrink-to-fit any text marked with data-fit-max so long content
    // doesn't push the image off the canvas.
    autofitCanvas(canvasEl);
  }

  function renderFieldInputs() {
    if (!captionsBlockEl) return;
    captionsBlockEl.replaceChildren();
    const fields = (template.meta && template.meta.editableFields) || [];
    fields.forEach((f) => {
      const val = state.editableValues[f.key] || '';
      // Show the template default as a placeholder hint so the user can
      // see what would look right here without it filling the canvas.
      const placeholder = f.default || '';
      const input = f.multiline
        ? el('textarea', {
            class: 'rv-field-input', dir: 'rtl', rows: f.linesField ? 4 : 3, value: val,
            placeholder,
            onInput: (e) => { setEditableValue(f.key, e.target.value); renderCanvas(); }
          })
        : el('input', {
            type: 'text', class: 'rv-field-input rv-field-input-single', dir: 'rtl', value: val,
            placeholder,
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
    // For user-initiated regen, swap the whole review to a loading screen
    // so it's unmistakable that something is happening. For inline regen
    // (after image swap), the caller already shows a status line.
    if (userInitiated) {
      renderLoading(userInitiated ? 'מנסח טקסט חדש לתמונה…' : null);
    } else if (statusNode) {
      statusNode.textContent = 'מנסח טקסט מותאם…';
    }
    return generateCaption({
      imageId: img.id,
      imageUrl: img.imageUrl,
      templateId: template.meta.id,
      templateType: template.meta.type,
      regenerate: userInitiated
    })
      .then((res) => {
        setGeneratedContent(res || {});
        if (userInitiated) {
          renderReview();
        } else {
          renderFieldInputs();
          renderCanvas();
          if (statusNode) statusNode.textContent = '';
        }
      })
      .catch((err) => {
        if (userInitiated) {
          renderError(err.message || String(err));
        } else if (statusEl) {
          statusEl.textContent = 'שגיאה: ' + err.message;
        }
      });
  }

  async function doSubmit(scheduleAt) {
    if (!publishBtn || !scheduleBtn || !statusEl) return;
    publishBtn.disabled = true;
    scheduleBtn.disabled = true;
    statusEl.textContent = 'מרנדר תמונה…';
    try {
      const dims = FORMAT_DIMS[state.format] || FORMAT_DIMS.feed;
      // Make sure any pending autofit RAFs have settled before snapshotting.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
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
    }
  }

  // ============================================================
  // Schedule modal — full-screen date + time picker
  // ============================================================

  function openScheduleModal() {
    const now = new Date();
    // Default to tomorrow 09:00 in the user's local timezone so the picker
    // opens with something sensible already filled in.
    const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    const tmrwStr  = tmrw.getFullYear() + '-' + pad(tmrw.getMonth() + 1) + '-' + pad(tmrw.getDate());

    const dateInput = el('input', { type: 'date', class: 'rv-modal-input', value: tmrwStr, min: todayStr });
    const timeInput = el('input', { type: 'time', class: 'rv-modal-input', value: '09:00' });
    const errorMsg = el('div', { class: 'rv-modal-error' }, '');

    function close() { backdrop.remove(); }

    const confirmBtn = el('button', { class: 'btn btn-primary popup-btn' }, '✅ אשר תזמון');
    const cancelBtn  = el('button', { class: 'btn btn-secondary popup-btn' }, '← ביטול');
    cancelBtn.addEventListener('click', () => { haptic('light'); close(); });
    confirmBtn.addEventListener('click', () => {
      const d = dateInput.value;
      const t = timeInput.value;
      if (!d || !t) { errorMsg.textContent = 'בחר תאריך ושעה'; return; }
      const combined = new Date(d + 'T' + t);
      if (isNaN(combined.getTime())) { errorMsg.textContent = 'תאריך/שעה לא תקינים'; return; }
      if (combined.getTime() < Date.now()) { errorMsg.textContent = 'בחר זמן עתידי'; return; }
      haptic('medium');
      const iso = combined.toISOString();
      setScheduleAt(iso);
      close();
      doSubmit(iso);
    });

    const card = el('div', { class: 'popup-card rv-schedule-modal' }, [
      el('div', { class: 'popup-emoji' }, '📅'),
      el('div', { class: 'popup-title' }, 'תזמן לפרסום'),
      el('div', { class: 'popup-sub' }, 'בחר את התאריך והשעה שבהם הפוסט יפורסם אוטומטית'),
      el('div', { class: 'rv-modal-pickers' }, [
        el('label', { class: 'rv-modal-label' }, [
          el('span', { class: 'rv-modal-label-text' }, 'תאריך'),
          dateInput
        ]),
        el('label', { class: 'rv-modal-label' }, [
          el('span', { class: 'rv-modal-label-text' }, 'שעה'),
          timeInput
        ])
      ]),
      errorMsg,
      el('div', { class: 'popup-actions' }, [confirmBtn, cancelBtn])
    ]);

    const backdrop = el('div', { class: 'popup-backdrop' });
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) { haptic('light'); close(); } });
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
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

      // If we already have a current image (entered review from gallery
      // picker or after a local upload), regenerate the caption for THAT
      // image instead of picking a fresh random one.
      if (state.currentImage && state.currentImage.imageUrl) {
        const content = await generateCaption({
          imageId: state.currentImage.id,
          imageUrl: state.currentImage.imageUrl,
          templateId: template.meta.id,
          templateType: template.meta.type,
          regenerate: false
        });
        setGeneratedContent(content || {});
        renderReview();
        return;
      }

      // First entry from templates: single 'review-start' call picks a
      // random image AND generates the caption in one n8n execution,
      // saving one round-trip vs. the legacy pick-image + caption pair.
      const res = await fetchReviewStart({
        folderId: state.selectedFolderId,
        templateId: template.meta.id,
        templateType: template.meta.type
      });
      if (res && res.empty) {
        renderEmptyFolder();
        return;
      }
      const img = res && res.image;
      if (!img || !img.imageUrl) {
        renderError('לא הוחזרה תמונה מהתיקייה');
        return;
      }
      setCurrentImage({ id: img.id, imageUrl: img.imageUrl, mimeType: img.mimeType });
      setGeneratedContent((res && res.content) || {});

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
