import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { generateCaption, submitFinal } from '../api.js';
import { getTemplate } from '../templates/index.js';
import {
  getState,
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
      el('span', { class: 'header-title right' }, 'תצוגה מקדימה ופרסום')
    ])
  ]);

  // Format toggle (Feed vs Story)
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
    el('button', { class: 'rv-format-btn' + (state.format === 'feed' ? ' active' : ''), onClick: () => { haptic('light'); setFormatAndRender('feed'); } }, '📱 פיד 4:5'),
    el('button', { class: 'rv-format-btn' + (state.format === 'story' ? ' active' : ''), onClick: () => { haptic('light'); setFormatAndRender('story'); } }, '📰 סטורי 9:16')
  ]);
  formatBtns.feed  = formatBar.children[1];
  formatBtns.story = formatBar.children[2];
  root.appendChild(formatBar);

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

  // --- Editable fields block (one input per template field) ---
  const fieldsBlock = el('div', { class: 'rv-fields' });
  const fieldInputs = {};

  function renderFieldInputs() {
    fieldsBlock.replaceChildren();
    editableFields.forEach((f) => {
      const val = state.editableValues[f.key] || '';
      const input = f.multiline
        ? el('textarea', {
            class: 'rv-field-input',
            dir: 'rtl',
            rows: f.linesField ? 4 : 3,
            value: val,
            onInput: (e) => { setEditableValue(f.key, e.target.value); renderCanvas(); }
          })
        : el('input', {
            type: 'text',
            class: 'rv-field-input rv-field-input-single',
            dir: 'rtl',
            value: val,
            onInput: (e) => { setEditableValue(f.key, e.target.value); renderCanvas(); }
          });
      fieldInputs[f.key] = input;
      fieldsBlock.appendChild(el('div', { class: 'rv-field' }, [
        el('div', { class: 'rv-field-label' }, f.labelHe),
        input
      ]));
    });
  }
  renderFieldInputs();
  root.appendChild(fieldsBlock);

  // Regenerate (re-fills all fields from a new AI run)
  const regenBtn = el('button', { class: 'btn btn-secondary rv-regen' }, '🔄 צור טקסט חדש');
  regenBtn.addEventListener('click', () => {
    haptic('light');
    regenBtn.disabled = true;
    regenBtn.textContent = 'מנסח…';
    generateCaption({
      imageId: state.currentImage.id,
      imageUrl: state.currentImage.imageUrl,
      templateId: template.meta.id,
      templateType: template.meta.type,
      regenerate: true
    })
      .then((res) => {
        setGeneratedContent(res || {});
        renderFieldInputs();
        renderCanvas();
      })
      .catch((err) => { statusEl.textContent = 'שגיאה: ' + err.message; })
      .finally(() => { regenBtn.disabled = false; regenBtn.textContent = '🔄 צור טקסט חדש'; });
  });
  root.appendChild(regenBtn);

  // --- Schedule ---
  const scheduleInputs = el('div', { class: 'rv-schedule-inputs hidden' }, [
    el('input', {
      type: 'datetime-local',
      class: 'rv-datetime',
      onChange: (e) => {
        const v = e.target.value;
        setScheduleAt(v ? new Date(v).toISOString() : null);
      }
    })
  ]);
  root.appendChild(el('div', { class: 'rv-schedule' }, [
    el('label', { class: 'rv-schedule-label' }, [
      el('input', {
        type: 'checkbox',
        onChange: (e) => {
          scheduleInputs.classList.toggle('hidden', !e.target.checked);
          if (!e.target.checked) setScheduleAt(null);
        }
      }),
      el('span', {}, '📅 תזמן לפרסום מאוחר יותר')
    ]),
    scheduleInputs
  ]));

  const statusEl = el('div', { class: 'rv-status' });

  const publishBtn = el('button', { class: 'btn btn-primary rv-publish' }, '🚀 פרסם');
  publishBtn.addEventListener('click', async () => {
    haptic('medium');
    if (state.scheduleAt && new Date(state.scheduleAt).getTime() < Date.now()) {
      statusEl.textContent = 'בחר תאריך עתידי לתזמון';
      return;
    }
    publishBtn.disabled = true;
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
        scheduleAt: state.scheduleAt
      });
      statusEl.textContent = state.scheduleAt ? '✅ תוזמן בהצלחה' : '✅ נשלח לפרסום';
      if (onPublished) setTimeout(onPublished, 1200);
    } catch (err) {
      statusEl.textContent = 'שגיאה: ' + err.message;
      publishBtn.disabled = false;
    }
  });

  root.appendChild(publishBtn);
  root.appendChild(statusEl);

  return root;
}
