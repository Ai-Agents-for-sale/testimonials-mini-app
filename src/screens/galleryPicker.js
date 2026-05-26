import { el } from '../dom.js';
import { haptic } from '../telegram.js';
import { listImages } from '../api.js';
import { getState, setGalleryImages, setCurrentImage } from '../state.js';

// Full-folder gallery. Shows up to 30 thumbnails in a 3-column grid.
// Tapping a thumbnail picks that image and pops back to the review screen.
// The gallery is cached on state.galleryImages so navigating in/out
// doesn't re-fetch (n8n response is ~10-30MB).
export function galleryPickerScreen({ goBack, onPicked }) {
  const state = getState();

  const root = el('div', { class: 'screen' }, [
    el('div', { class: 'header' }, [
      el('button', {
        class: 'back-btn',
        onClick: () => { haptic('light'); goBack(); }
      }, '› חזרה'),
      el('span', { class: 'header-title right' }, 'בחר תמונה מהתיקייה')
    ])
  ]);

  const intro = el('div', { class: 'intro' }, [
    el('div', { class: 'intro-sub' }, 'בחר את התמונה שתופיע בפוסט. ניתן להחליף בכל שלב.')
  ]);
  root.appendChild(intro);

  const grid = el('div', { class: 'gallery-grid' });
  root.appendChild(grid);

  const status = el('div', { class: 'loading' }, 'טוען תמונות…');
  root.appendChild(status);

  function renderGrid(images) {
    grid.replaceChildren();
    if (!images.length) {
      status.textContent = 'אין תמונות בתיקייה';
      status.classList.add('error');
      return;
    }
    status.classList.add('hidden');
    images.forEach((img) => {
      const cell = el('div', { class: 'gallery-cell' }, [
        el('img', { class: 'gallery-img', src: img.imageUrl, loading: 'lazy' })
      ]);
      cell.addEventListener('click', () => {
        haptic('light');
        setCurrentImage({ id: img.id, imageUrl: img.imageUrl, mimeType: img.mimeType });
        if (onPicked) onPicked();
      });
      grid.appendChild(cell);
    });
  }

  // Use cached gallery if we've already fetched once this folder
  if (state.galleryImages && state.galleryImages.length) {
    renderGrid(state.galleryImages);
  } else {
    listImages(state.selectedFolderId)
      .then((res) => {
        const images = (res && res.images) || [];
        setGalleryImages(images);
        renderGrid(images);
      })
      .catch((err) => {
        status.textContent = 'שגיאה בטעינת התמונות: ' + err.message;
        status.classList.add('error');
      });
  }

  return root;
}
