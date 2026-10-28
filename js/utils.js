// Helpers compartidos: formato, fechas, colores y escape de HTML.
window.U = {
  esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },
  n(v) { const x = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isNaN(x) ? 0 : x; },
  days(v) { const d = U.n(v); return d > 0 ? d : 1; },
  money(v) { return '$' + Math.round(v || 0).toLocaleString('es-CL'); },
  pct(v) { return (Math.round(v * 10) / 10).toLocaleString('es-CL') + '%'; },
  code(num) { return 'COT-' + String(num).padStart(4, '0'); },
  fdate(s) { if (!s) return '—'; const p = s.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; },
  today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); },
  initials(name) {
    const w = (name || '?').trim().split(/\s+/);
    return U.esc((((w[0] || '')[0] || '') + ((w[1] || '')[0] || '')).toUpperCase());
  },
  // Marca la opción activa de un <select>.
  options(list, current) {
    return list.map((o) => {
      const v = typeof o === 'string' ? o : o.value;
      const label = typeof o === 'string' ? o : o.label;
      return '<option value="' + U.esc(v) + '"' + (String(v) === String(current) ? ' selected' : '') + '>' + U.esc(label) + '</option>';
    }).join('');
  },

  hexRgb(h) {
    const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
    if (!m) return [0, 0, 0];
    const v = parseInt(m[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  },
  rgbHex(c) { return '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join(''); },
  mix(a, b, t) { const x = U.hexRgb(a), y = U.hexRgb(b); return U.rgbHex(x.map((v, i) => v + (y[i] - v) * t)); },
  lum(h) {
    const c = U.hexRgb(h).map((v) => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  },
  contrast(a, b) { const l1 = U.lum(a), l2 = U.lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); },
  // Deriva los tonos de acento (oscuro, suave, borde, claro) desde el color principal.
  palette(th) {
    return {
      acc: th.acc, brand: th.brand, bg: th.bg,
      accD: U.mix(th.acc, '#000000', 0.25),
      accS: U.mix(th.acc, '#ffffff', 0.88),
      accB: U.mix(th.acc, '#ffffff', 0.7),
      accL: U.mix(th.acc, '#ffffff', 0.45)
    };
  }
};
