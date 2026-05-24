import './styles.css';
import { initTelegram } from './telegram.js';
import { templatesScreen } from './screens/templates.js';
import { reviewScreen } from './screens/review.js';

initTelegram();

const root = document.getElementById('app');
const stack = ['templates'];

const SCREENS = {
  templates: () => templatesScreen({ navigate, goBack }),
  review:    () => reviewScreen({ goBack, onPublished: () => navigate('templates', true) })
};

function render() {
  if (!root) return;
  const name = stack[stack.length - 1];
  const factory = SCREENS[name] || SCREENS.templates;
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
  else { stack.length = 0; stack.push('templates'); }
  render();
}

render();
