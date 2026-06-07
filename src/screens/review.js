import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { pickRandomImage, generateCaption, submitFinal, fetchReviewStart, uploadImagesToFolder, getCloudinaryUploadSignature } from '../api.js';
import { getTemplate } from '../templates/index.js';
import {
  getState,
  setCurrentImage,
  setGeneratedContent,
  setEditableValue,
  setFormat,
  setScheduleAt,
  adjustSize,
  getFieldScale
} from '../state.js';
import { buildCanvasHtmlDoc } from '../cloudRender.js';
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
    // Three-way: upload images to the folder (persisted in Drive), continue
    // without an image and use a one-off device upload for this run, or
    // pick a different folder.
    const backdrop = el('div', { class: 'popup-backdrop' });

    // Hidden multi-file picker fed by the upload button.
    const fileInput = el('input', {
      type: 'file', accept: 'image/*', multiple: true, class: 'hidden'
    });

    function continueWithoutImage() {
      backdrop.remove();
      // Render a bare review view; the user's existing 'Upload from device'
      // button handles the one-off image for this run.
      setCurrentImage(null);
      setGeneratedContent({});
      renderReview();
    }

    // Client-side compress to a Blob (NOT base64). Returns the blob + a
    // .jpg filename. The Blob is pushed straight to Cloudinary via FormData
    // — Cloudinary handles file uploads natively, so there's no payload-
    // inflation problem the way base64-through-n8n-webhook had.
    async function compressImage(file, maxSize = 1600, quality = 0.85) {
      const objUrl = URL.createObjectURL(file);
      try {
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.onload  = () => resolve(i);
          i.onerror = () => reject(new Error('לא ניתן לקרוא את התמונה ' + file.name));
          i.src = objUrl;
        });
        const w0 = img.naturalWidth, h0 = img.naturalHeight;
        const ratio = Math.min(maxSize / w0, maxSize / h0, 1);
        const w = Math.max(1, Math.round(w0 * ratio));
        const h = Math.max(1, Math.round(h0 * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Compression failed')), 'image/jpeg', quality);
        });
        const baseName = (file.name || 'photo').replace(/\.[^.]+$/, '');
        return { blob, name: baseName + '.jpg' };
      } finally {
        URL.revokeObjectURL(objUrl);
      }
    }

    // Push a compressed image straight to Cloudinary using the signature we
    // got from n8n. Cloudinary returns a secure_url that we hand back to
    // n8n in the final upload-to-folder call. Direct browser → Cloudinary
    // sidesteps n8n's webhook payload limit entirely.
    async function uploadOneToCloudinary(blob, name, sig) {
      const fd = new FormData();
      fd.append('file', blob, name);
      fd.append('api_key',   String(sig.apiKey));
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', String(sig.signature));
      fd.append('folder',    String(sig.folder));
      const res = await fetch(sig.uploadUrl, { method: 'POST', body: fd });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error('Cloudinary ' + res.status + ': ' + t.slice(0, 200));
      }
      const json = await res.json();
      return { url: json.secure_url, name };
    }

    function renderProgress(stage) {
      const c = backdrop.querySelector('.popup-card');
      if (!c) return;
      c.replaceChildren(
        el('div', { class: 'popup-emoji pulse' }, '📤'),
        el('div', { class: 'popup-title' }, 'מעלה תמונות לתיקייה…'),
        el('div', { class: 'popup-sub' }, stage || ''),
        el('div', { class: 'state-bar' }, [el('div', { class: 'state-bar-fill' })])
      );
    }

    function showUploadError(messages) {
      const c = backdrop.querySelector('.popup-card');
      if (!c) return;
      c.replaceChildren(
        el('div', { class: 'popup-emoji' }, '⚠️'),
        el('div', { class: 'popup-title' }, 'שגיאה בהעלאה'),
        el('div', { class: 'popup-sub' }, (messages || []).join('\n') || 'משהו השתבש'),
        el('div', { class: 'popup-actions' }, [
          el('button', {
            class: 'btn btn-secondary popup-btn',
            onClick: () => { backdrop.remove(); renderEmptyFolder(); }
          }, '← חזרה')
        ])
      );
    }

    async function uploadFilesToFolder(files) {
      // 1. Get a Cloudinary signature from n8n (tiny request).
      let sig;
      renderProgress('מתחיל…');
      try {
        sig = await getCloudinaryUploadSignature();
      } catch (err) {
        console.error('[upload-to-folder] get-sig failed:', err);
        showUploadError([(err && err.message) || 'שגיאה בקבלת הרשאת העלאה']);
        return;
      }

      // 2. Compress each file + upload straight to Cloudinary.
      const uploaded = [];
      const errors = [];
      for (let i = 0; i < files.length; i++) {
        renderProgress('מעלה ' + (i + 1) + ' מתוך ' + files.length);
        try {
          const { blob, name } = await compressImage(files[i]);
          const result = await uploadOneToCloudinary(blob, name, sig);
          uploaded.push(result);
        } catch (err) {
          console.error('[upload-to-folder] cloudinary upload failed:', files[i].name, err);
          errors.push((files[i].name || ('#' + (i + 1))) + ': ' + ((err && err.message) || String(err)));
        }
      }

      if (!uploaded.length) {
        showUploadError(errors.length ? errors.slice(0, 3) : ['לא הועלו תמונות']);
        return;
      }

      // 3. Hand n8n the list of URLs; it downloads + writes to Drive.
      renderProgress('שולח לתיקייה…');
      try {
        await uploadImagesToFolder(state.selectedFolderId, uploaded);
        backdrop.remove();
        renderLoading();
        loadInitial();
      } catch (err) {
        console.error('[upload-to-folder] urls→folder failed:', err);
        showUploadError([(err && err.message) || 'שגיאה בשליחת ה-URLs לשרת']);
      }
    }

    fileInput.addEventListener('change', () => {
      const files = Array.from(fileInput.files || []);
      if (!files.length) return;
      uploadFilesToFolder(files);
    });

    const card = el('div', { class: 'popup-card' }, [
      el('div', { class: 'popup-emoji' }, '📭'),
      el('div', { class: 'popup-title' }, 'אין תמונות בתיקייה'),
      el('div', { class: 'popup-sub' },
        'התיקייה "' + (state.selectedFolderName || '') + '" ריקה. איך תרצה להמשיך?'),
      el('div', { class: 'popup-actions' }, [
        el('button', {
          class: 'btn btn-primary popup-btn',
          onClick: () => { haptic('light'); fileInput.click(); }
        }, '📤 העלה תמונות לתיקייה'),
        el('button', {
          class: 'btn btn-secondary popup-btn',
          onClick: () => { haptic('light'); continueWithoutImage(); }
        }, '✏️ המשך בלי תמונה'),
        el('button', {
          class: 'btn btn-secondary popup-btn',
          onClick: () => { haptic('light'); backdrop.remove(); goBack(); setTimeout(goBack, 30); }
        }, '🗂️ בחר תיקייה אחרת')
      ])
    ]);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) { haptic('light'); backdrop.remove(); goBack(); setTimeout(goBack, 30); }
    });
    backdrop.appendChild(card);
    backdrop.appendChild(fileInput);

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
  let sizesBlockEl = null;
  let statusEl = null;
  let regenBtn = null;
  let publishBtn = null;
  let scheduleBtn = null;
  let editPanelOpen = false;

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

    // --- Editing panel (text + size + regen). Collapsed by default so the
    //     review screen feels clean; user opens it via the toggle below. ---
    captionsBlockEl = el('div', { class: 'rv-fields' });
    renderFieldInputs();
    sizesBlockEl = el('div', { class: 'rv-sizes' });
    renderSizeControls();
    regenBtn = el('button', { class: 'btn btn-secondary rv-regen' }, '🔄 צור טקסט חדש');
    regenBtn.addEventListener('click', () => { haptic('light'); regenerateCaptionInline(null, true); });

    const editPanel = el('div', {
      class: editPanelOpen ? 'rv-edit-panel' : 'rv-edit-panel hidden'
    }, [captionsBlockEl, sizesBlockEl, regenBtn]);

    const editToggleBtn = el('button', {
      class: 'btn btn-secondary rv-edit-toggle'
    }, editPanelOpen ? 'סגור עריכה ✕' : 'בצע שינויים ✏️');
    editToggleBtn.addEventListener('click', () => {
      haptic('light');
      editPanelOpen = !editPanelOpen;
      editPanel.classList.toggle('hidden', !editPanelOpen);
      editToggleBtn.textContent = editPanelOpen ? 'סגור עריכה ✕' : 'בצע שינויים ✏️';
    });

    wrap.appendChild(editToggleBtn);
    wrap.appendChild(editPanel);

    // --- Action buttons ---
    statusEl = el('div', { class: 'rv-status' });
    publishBtn  = el('button', { class: 'btn btn-primary rv-action' }, '🚀 פרסם עכשיו');
    scheduleBtn = el('button', { class: 'btn btn-secondary rv-action' }, '📅 תזמן לפרסום');
    const actionRow = el('div', { class: 'rv-action-row' }, [publishBtn, scheduleBtn]);

    publishBtn.addEventListener('click', () => {
      haptic('medium');
      // Feed posts get a caption review step (the text that lands under the
      // photo on Instagram); stories skip straight through.
      if (state.format === 'feed') openCaptionReviewModal(() => doSubmit(null));
      else doSubmit(null);
    });
    scheduleBtn.addEventListener('click', () => {
      haptic('light');
      if (state.format === 'feed') openCaptionReviewModal(() => openScheduleModal());
      else openScheduleModal();
    });

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
    const h = stage.clientHeight;
    if (!w || !h) return;
    const dims = FORMAT_DIMS[state.format] || FORMAT_DIMS.feed;
    // Pick the TIGHTER constraint: when the stage's max-height clamps below
    // what the aspect-ratio would dictate, height becomes the binding axis
    // and we shrink the canvas to fit vertically; otherwise width wins.
    const scaleW = w / 1080;
    const scaleH = h / dims.h;
    stage.style.setProperty('--canvas-scale', String(Math.min(scaleW, scaleH)));
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
    // Apply user's per-field size adjustments first — for text this just
    // bumps data-fit-max, so autofit's own shrink pass below still wins
    // if the new size would overflow.
    applyUserScales(canvasEl);
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
  // Size controls — +/- per editable text field + image
  // ============================================================

  function buildSizeRow(key, label) {
    const plus  = el('button', { class: 'rv-size-btn', type: 'button' }, '+');
    const minus = el('button', { class: 'rv-size-btn', type: 'button' }, '−');
    plus.addEventListener('click',  () => { haptic('light'); adjustSize(key, +1); renderCanvas(); });
    minus.addEventListener('click', () => { haptic('light'); adjustSize(key, -1); renderCanvas(); });
    return el('div', { class: 'rv-size-row' }, [
      el('div', { class: 'rv-size-label' }, label),
      el('div', { class: 'rv-size-btns' }, [plus, minus])
    ]);
  }

  function renderSizeControls() {
    if (!sizesBlockEl) return;
    sizesBlockEl.replaceChildren();
    sizesBlockEl.appendChild(el('div', { class: 'rv-sizes-title' }, 'גודל'));
    const fields = (template.meta && template.meta.editableFields) || [];
    fields.forEach((f) => sizesBlockEl.appendChild(buildSizeRow(f.key, f.labelHe)));
    // One always-present row for the image itself.
    sizesBlockEl.appendChild(buildSizeRow('image', 'תמונה'));
  }

  // Apply the user's size adjustments to the freshly-rendered canvas BEFORE
  // autofit runs. For text: bump the element's data-fit-max so autofit
  // honours the new ceiling (it'll still shrink if the bigger size would
  // make the canvas overflow). For the image wrapper: CSS transform: scale.
  function applyUserScales(canvasEl) {
    if (!template || !template.meta) return;
    const fields = template.meta.editableFields || [];
    fields.forEach((f) => {
      const scale = getFieldScale(f.key);
      if (scale === 1) return;
      canvasEl.querySelectorAll(`[data-field="${f.key}"]`).forEach((node) => {
        const fitMax = parseFloat(node.dataset.fitMax);
        if (!isNaN(fitMax)) {
          node.dataset.fitMax = (fitMax * scale).toFixed(1);
        } else {
          const computed = parseFloat(getComputedStyle(node).fontSize);
          if (!isNaN(computed)) node.style.fontSize = (computed * scale) + 'px';
        }
      });
    });

    const imgScale = getFieldScale('image');
    if (imgScale !== 1) {
      canvasEl.querySelectorAll('[data-field="image"]').forEach((wrap) => {
        wrap.style.transform = `scale(${imgScale})`;
        wrap.style.transformOrigin = 'center';
      });
    }
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
    // No intermediate "preparing / sending / rendering" text — buttons are
    // disabled to signal work is in progress, and on success we navigate
    // straight to the done screen. Failures still surface via the catch.
    statusEl.textContent = '';
    try {
      const dims = FORMAT_DIMS[state.format] || FORMAT_DIMS.feed;
      // Let any pending autofit RAFs settle before grabbing the HTML.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const html = buildCanvasHtmlDoc(canvasEl);
      await submitFinal({
        html,
        viewportWidth: dims.w,
        viewportHeight: dims.h,
        caption: state.editableValues.caption || state.editableValues.quote || '',
        headline: state.editableValues.headline || '',
        templateId: template.meta.id,
        format: state.format,
        sourceImageId: state.currentImage ? state.currentImage.id : null,
        scheduleAt
      });
      if (onPublished) onPublished();
    } catch (err) {
      // html-to-image and a few fetch/abort paths reject with Events
      // (no `.message`) or plain objects. Surface SOMETHING useful so
      // the user doesn't see a bare "שגיאה: undefined".
      const msg = (err && typeof err.message === 'string' && err.message)
        || (err && typeof err === 'string' && err)
        || (err && err.name)
        || (err && err.toString && err.toString())
        || 'משהו השתבש בעיבוד';
      statusEl.textContent = 'שגיאה: ' + msg;
      publishBtn.disabled = false;
      scheduleBtn.disabled = false;
      console.error('[publish] failed:', err);
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
  // Caption review modal — feed format only. Lets the user review +
  // edit the Instagram caption (the text that appears under the post)
  // before the actual publish/schedule step runs.
  // ============================================================

  function openCaptionReviewModal(onConfirm) {
    const initial = state.editableValues.caption
      || state.editableValues.quote
      || state.editableValues.captionLines
      || '';

    const textarea = el('textarea', {
      class: 'rv-caption-modal-textarea', dir: 'rtl', rows: 9, value: initial,
      placeholder: 'הכיתוב שיופיע מתחת לתמונה באינסטגרם…'
    });

    function close() { backdrop.remove(); }

    const confirmBtn = el('button', { class: 'btn btn-primary popup-btn' }, 'אישור והמשך');
    const cancelBtn  = el('button', { class: 'btn btn-secondary popup-btn' }, 'חזרה');
    cancelBtn.addEventListener('click', () => { haptic('light'); close(); });
    confirmBtn.addEventListener('click', () => {
      haptic('medium');
      setEditableValue('caption', textarea.value);
      close();
      onConfirm();
    });

    const card = el('div', { class: 'popup-card rv-caption-modal' }, [
      el('div', { class: 'popup-emoji' }, '📝'),
      el('div', { class: 'popup-title' }, 'בדוק את הכיתוב לפוסט'),
      el('div', { class: 'popup-sub' }, 'הכיתוב הזה יופיע מתחת לתמונה באינסטגרם. אפשר לערוך לפני שמפרסמים.'),
      textarea,
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
