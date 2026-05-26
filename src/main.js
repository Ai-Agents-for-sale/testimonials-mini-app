import './styles.css';
import { initTelegram } from './telegram.js';
import { folderPickerScreen } from './screens/folderPicker.js';
import { templatesScreen } from './screens/templates.js';
import { reviewScreen } from './screens/review.js';
import { galleryPickerScreen } from './screens/galleryPicker.js';
import { doneScreen } from './screens/done.js';

initTelegram();

const root = document.getElementById('app');
const stack = ['folders'];

const SCREENS = {
  folders:   () => folderPickerScreen({ navigate, goBack }),
  templates: () => templatesScreen({ navigate, goBack }),
  review:    () => reviewScreen({ navigate, goBack, onPublished: () => navigate('done', true) }),
  gallery:   () => galleryPickerScreen({ goBack, onPicked: () => goBack() }),
  done:      () => doneScreen({ navigate, goBack })
};

function render() {
  if (!root) return;
  const name = stack[stack.length - 1];
  const factory = SCREENS[name] || SCREENS.folders;
  root.replaceChildren(factory());
  window.scrollTo(0, 0);
}

function navigate(name, replace = false) {
  if (replace) stack.length = 0;
  stack.push(name);
  render();
}

function goBack() {
  if (stack.length > 1) stack.pop();
  else { stack.length = 0; stack.push('folders'); }
  render();
}

render();
