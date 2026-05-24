import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { generateCaption, submitFinal } from '../api.js';
import { getTemplate } from '../templates/index.js';
import { getState, setGeneratedContent, setCaptionDraft, setScheduleAt } from '../state.js';
import { renderCanvasToPng, dataUrlToBase64 } from '../png.js';

export function reviewScreen({ goBack, onPublished }) {
  const state = getState();
  const template = getTemplate(state.templateId);

  if (!template) {
    setTimeout(goBack, 0);
    return el('div', {}, 'אין תבנית נבחרת');
  }

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'header' }, [
      el('button', { class: 'back-btn', onClick: () => { haptic('light'); goBack(); } }, '› חזרה'),
      el('span', { class: 'header-title right' }, 'תצוגה מקדימה ופרסום')
    ])
  ]);

  const stage = el('div', { class: 'rv-stage' });
  const canvasWrap = el('div', { class: 'rv-canvas-scale' });
  stage.appendChild(canvasWrap);
  root.appendChild(stage);

  function syncScale() {
    const w = stage.clientWidth;
    if (!w) return;
    stage.style.setProperty('--canvas-scale', String(w / 1080));
  }
  setTimeout(syncScale, 0);
  window.addEventListener('resize', syncScale);

  let canvasEl = null;

  function buildContent() {
    const img = state.currentImage;
    const generated = state.generatedContent || {};
    return {
      headline:       generated.headline,
      subline:        generated.subline,
      subHeadline:    generated.subHeadline,
      caption:        state.captionDraft,
      captionLines:   generated.captionLines,
      statLine:       generated.statLine,
      quote:          generated.quote,
      authorName:     generated.authorName,
      authorRole:     generated.authorRole,
      backgroundUrl:  generated.backgroundUrl,
      sourceImageUrl: img ? img.imageUrl : null
    };
  }

  function renderCanvas() {
    canvasWrap.replaceChildren();
    canvasEl = template.render({ content: buildContent(), brand: state.brand || {} });
    canvasWrap.appendChild(canvasEl);
  }

  renderCanvas();

  const captionInput = el('textarea', {
    class: 'rv-caption-input',
    dir: 'rtl',
    value: state.captionDraft,
    onInput: (e) => { setCaptionDraft(e.target.value); renderCanvas(); }
  });

  const regenBtn = el('button', { class: 'btn btn-secondary' }, '🔄 צור טקסט חדש');
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
        captionInput.value = state.captionDraft;
        renderCanvas();
      })
      .catch((err) => { statusEl.textContent = 'שגיאה: ' + err.message; })
      .finally(() => { regenBtn.disabled = false; regenBtn.textContent = '🔄 צור טקסט חדש'; });
  });

  root.appendChild(el('div', { class: 'rv-caption-block' }, [
    el('div', { class: 'rv-label' }, 'טקסט הפוסט (ניתן לעריכה)'),
    captionInput,
    regenBtn
  ]));

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
      statusEl.textContent = 'בחר תאריך עתידי לתזמון'; return;
    }
    publishBtn.disabled = true;
    statusEl.textContent = 'מרנדר תמונה…';

    try {
      const dataUrl = await renderCanvasToPng(canvasEl);
      const base64 = dataUrlToBase64(dataUrl);

      statusEl.textContent = 'שולח ל-n8n…';
      await submitFinal({
        imageBase64: base64,
        caption: state.captionDraft,
        headline: (state.generatedContent && state.generatedContent.headline) || '',
        templateId: template.meta.id,
        sourceImageId: state.currentImage ? state.currentImage.id : null,
        scheduleAt: state.scheduleAt
      });
      statusEl.textContent = state.scheduleAt ? '✅ תוזמן בהצלחה' : '✅ נשלח לפרסום';
      if (onPublished) onPublished();
    } catch (err) {
      statusEl.textContent = 'שגיאה: ' + err.message;
      publishBtn.disabled = false;
    }
  });

  root.appendChild(publishBtn);
  root.appendChild(statusEl);

  return root;
}
