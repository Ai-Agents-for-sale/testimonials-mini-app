export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  // Defensive: accept null/undefined as "no attrs". Prior signature only
  // defaulted on undefined — `el('span', null, ...)` would Object.keys(null)
  // and crash the entire screen render, masquerading as "X isn't clickable".
  if (attrs == null) attrs = {};

  Object.keys(attrs).forEach((key) => {
    const value = attrs[key];
    if (value == null || value === false) return;

    if (key === 'class') {
      node.className = value;
    } else if (key === 'onClick') {
      node.addEventListener('click', value);
    } else if (key === 'onInput') {
      node.addEventListener('input', value);
    } else if (key === 'onChange') {
      node.addEventListener('change', value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.keys(value).forEach((k) => { node.dataset[k] = value[k]; });
    } else if (key in node && key !== 'list') {
      try { node[key] = value; } catch (_) { node.setAttribute(key, value); }
    } else {
      node.setAttribute(key, value);
    }
  });

  const append = (child) => {
    if (child == null || child === false) return;
    if (Array.isArray(child)) { child.forEach(append); return; }
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)));
      return;
    }
    node.appendChild(child);
  };
  append(children);

  return node;
}
