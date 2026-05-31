import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { fetchInit } from '../api.js';
import { getState, setBrand, setFolders, setSelectedFolder, resetAll } from '../state.js';

const FOLDER_EMOJI = ['📁', '📂', '🗂️', '📒', '📕', '📗', '📘', '📙'];

export function folderPickerScreen({ navigate }) {
  resetAll();

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'topbar' }, [
      el('div', { class: 'topbar-title' }, '⭐ הוכחות לקוחות')
    ]),
    el('div', { class: 'intro' }, [
      el('div', { class: 'intro-title' }, 'מאיזו תיקייה ניצור היום?'),
      el('div', { class: 'intro-sub' }, 'בחר את תיקיית הצילומים שממנה תוצא תמונה לפוסט')
    ])
  ]);

  const grid = el('div', { class: 'folder-grid' });
  root.appendChild(grid);

  const loading = el('div', { class: 'loading' }, 'טוען תיקיות…');
  root.appendChild(loading);

  function renderFolders() {
    grid.replaceChildren();
    const state = getState();
    state.folders.forEach((folder, i) => {
      const card = el('div', { class: 'folder-card' }, [
        el('div', { class: 'folder-emoji' }, FOLDER_EMOJI[i % FOLDER_EMOJI.length]),
        el('div', { class: 'folder-name' }, folder.name)
      ]);
      card.addEventListener('click', () => {
        haptic('light');
        setSelectedFolder(folder.id, folder.name);
        navigate('templates');
      });
      grid.appendChild(card);
    });
  }

  // Single 'init' call returns { brand, folders } together — saves one n8n
  // execution per session start vs. the legacy bootstrap + list-folders pair.
  fetchInit()
    .then((res) => {
      setBrand((res && res.brand) || {});
      setFolders((res && res.folders) || []);
      loading.classList.add('hidden');
      if (!getState().folders.length) {
        loading.classList.remove('hidden');
        loading.textContent = 'לא נמצאו תיקיות בהגדרות הלקוח. בדוק את ה-Monday/Drive.';
        loading.classList.add('error');
        return;
      }
      renderFolders();
    })
    .catch((err) => {
      loading.textContent = 'שגיאה: ' + err.message;
      loading.classList.add('error');
    });

  return root;
}
