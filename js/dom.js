// Actualiza el DOM existente para que coincida con el nuevo HTML, sin reemplazar nodos que no cambian.
// Así un campo en edición conserva el foco, el cursor y el scroll en cada render.
window.Dom = {
  patch(container, html) {
    const next = document.createElement('div');
    next.innerHTML = html;
    Dom.children(container, next);
  },

  same(a, b) {
    if (a.nodeType !== b.nodeType) return false;
    if (a.nodeType !== 1) return true;
    return a.tagName === b.tagName && (a.id || '') === (b.id || '');
  },

  children(from, to) {
    const a = Array.from(from.childNodes);
    const b = Array.from(to.childNodes);
    b.forEach((node, i) => {
      const cur = a[i];
      if (!cur) from.appendChild(node);
      else if (!Dom.same(cur, node)) from.replaceChild(node, cur);
      else if (cur.nodeType === 1) Dom.element(cur, node);
      else if (cur.nodeValue !== node.nodeValue) cur.nodeValue = node.nodeValue;
    });
    for (let i = b.length; i < a.length; i++) a[i].remove();
  },

  element(from, to) {
    Array.from(from.attributes).forEach((at) => { if (!to.hasAttribute(at.name)) from.removeAttribute(at.name); });
    Array.from(to.attributes).forEach((at) => { if (from.getAttribute(at.name) !== at.value) from.setAttribute(at.name, at.value); });

    const tag = from.tagName;
    const focused = from === document.activeElement;
    if (tag === 'TEXTAREA') {
      if (!focused && from.value !== to.value) from.value = to.value;
      return;
    }
    Dom.children(from, to);
    if (tag === 'INPUT' && from.type !== 'file' && !focused && from.value !== to.value) from.value = to.value;
    if (tag === 'SELECT' && from.value !== to.value) from.value = to.value;
  }
};
