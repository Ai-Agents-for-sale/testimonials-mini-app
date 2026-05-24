import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { pickRandomImage, generateCaption } from '../api.js';
import { getTemplate } from '../templates/index.js';
import { getState, setCurrentImage, setGeneratedContent } from '../state.js';

export function composeScreen({ navigate, goBack }) {
  const state = getState();
  const template = getTemplate(state.templateId);

  if (!template) {
    setTimeout(goBack, 0);
    return el('div', {}, 'אין תבנית נבחרת');
  }

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'header' }, [
      el('button', { class: 'back-btn', onClick: () => { haptic('light'); goBack(); } }, '› חזרה'),
      el('span', { class: 'header-title right' }, template.meta.nameHe)
    ]),
    el('div', { class: 'intro' }, [
      el('div', { class: 'intro-title' }, 'בחר תמונה מהתיקייה'),
      el('div', { class: 'intro-sub' }, 'תמונה נבחרה רנדומלית. אפשר להחליף.')
    ])
  ]);

  const previewWrap = el('div', { class: 'cmp-preview' }, [
    el('div', { class: 'cmp-preview-empty' }, 'טוען תמונה…')
  ]);
  root.appendChild(previewWrap);

  const actions = el('div', { class: 'cmp-actions' }, [
    el('button', { class: 'btn btn-secondary', onClick: () => { haptic('light'); rerollImage(); } }, '🎲 תמונה אחרת'),
    el('button', { class: 'btn btn-secondary', onClick: () => { haptic('light'); fileInput.click(); } }, '📁 בחר ידנית')
  ]);
  root.appendChild(actions);

  const fileInput = el('input', { type: 'file', accept: 'image/*', class: 'hidden' });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCurrentImage({ id: 'local-' + Date.now(), imageUrl: url, mimeType: file.type, local: true });
    renderPreview();
  });
  root.appendChild(fileInput);

  const createBtn = el('button', { class: 'btn btn-primary cmp-create' }, '✍️ צור פוסט');
  createBtn.addEventListener('click', () => { haptic('medium'); triggerCreate(); });
  root.appendChild(createBtn);

  const status = el('div', { class: 'cmp-status' });
  root.appendChild(status);

  function renderPreview() {
    previewWrap.replaceChildren();
    const img = state.currentImage;
    if (!img) {
      previewWrap.appendChild(el('div', { class: 'cmp-preview-empty' }, 'אין תמונה'));
      return;
    }
    previewWrap.appendChild(el('img', { class: 'cmp-preview-img', src: img.imageUrl }));
  }

  function rerollImage() {
    previewWrap.replaceChildren(el('div', { class: 'cmp-preview-empty' }, 'טוען תמונה…'));
    pickRandomImage(state.excludeIds)
      .then((res) => {
        if (!res || !res.imageUrl) throw new Error('לא הוחזרה תמונה');
        setCurrentImage({ id: res.id, imageUrl: res.imageUrl, mimeType: res.mimeType });
        renderPreview();
      })
      .catch((err) => {
        previewWrap.replaceChildren(el('div', { class: 'cmp-preview-empty error' }, 'שגיאה: ' + err.message));
      });
  }

  function triggerCreate() {
    const img = state.currentImage;
    if (!img) { status.textContent = 'בחר תמונה לפני יצירת הפוסט'; return; }
    status.textContent = 'מנסח טקסט מותאם…';
    createBtn.disabled = true;

    generateCaption({
      imageId: img.id,
      imageUrl: img.imageUrl,
      templateId: template.meta.id,
      templateType: template.meta.type,
      regenerate: false
    })
      .then((res) => {
        setGeneratedContent(res || {});
        navigate('review');
      })
      .catch((err) => {
        status.textContent = 'שגיאה בניסוח: ' + err.message;
        createBtn.disabled = false;
      });
  }

  rerollImage();
  return root;
}
