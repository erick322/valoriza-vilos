// Cálculos de negocio: totales, análisis de costo y comparación de proveedores.
window.Model = {
  // Cada línea se redondea al peso, para que la suma de la hoja cuadre con el neto.
  lineOf(it) { return Math.round(U.n(it.qty) * U.n(it.price) * U.days(it.days)); },

  calc(q) {
    const neto = q.items.reduce((a, it) => a + Model.lineOf(it), 0);
    const iva = Math.round(neto * 0.19);
    return { neto: neto, iva: iva, total: neto + iva };
  },

  costCalc(k, zones) {
    const z = zones.find((x) => x.id === k.zoneId) || { name: 'Sin zona', pct: '0' };
    const parts = [
      { label: 'Materiales', v: U.n(k.materiales) },
      { label: 'Flete', v: U.n(k.flete) },
      { label: 'Transporte', v: U.n(k.transporte) },
      { label: 'Depreciación de herramientas', v: U.n(k.depreciacion) },
      { label: 'Gestión de compra', v: U.n(k.gestion) }
    ];
    const directo = parts.reduce((a, p) => a + p.v, 0);
    const zonaPct = U.n(z.pct);
    const zona = directo * zonaPct / 100;
    const costo = directo + zona;
    const utilPct = U.n(k.utilidad);
    const util = costo * utilPct / 100;
    return { parts: parts, zoneName: z.name, directo: directo, zonaPct: zonaPct, zona: zona, costo: costo, utilPct: utilPct, util: util, sugerido: costo + util };
  },

  current(s) { return s.quotes.find((q) => q.id === s.currentId) || null; },
  currentCost(s) { return s.costs.find((k) => k.id === s.currentCostId) || null; },
  currentProvider(s) { return s.providers.find((p) => p.id === s.currentProviderId) || null; },

  provName(s, id) {
    const p = s.providers.find((x) => x.id === id);
    return p ? (p.name || 'Sin nombre') : 'Proveedor eliminado';
  },

  provLinks(p) {
    let digits = (p.telefono || '').replace(/[^0-9]/g, '');
    // Un número chileno escrito sin código de país (9 1234 5678) necesita el 56 delante.
    if (digits.length === 9 && digits.indexOf('56') !== 0) digits = '56' + digits;
    return {
      tel: digits ? 'tel:+' + digits : '#',
      wa: digits ? 'https://wa.me/' + digits : '#',
      mail: p.correo ? 'mailto:' + p.correo : '#'
    };
  },

  spKey(sp) { return (sp.product || '').trim().toLowerCase() + '|' + sp.unit; },

  // Agrupa los precios cotizados por producto+unidad, ordenados de menor a mayor.
  priceGroups(s) {
    const groups = {};
    s.supplierPrices.forEach((sp) => {
      if (!(sp.product || '').trim() || !(U.n(sp.price) > 0)) return;
      const k = Model.spKey(sp);
      if (!groups[k]) groups[k] = { name: sp.product.trim(), unit: sp.unit, rows: [] };
      groups[k].rows.push(sp);
    });
    Object.keys(groups).forEach((k) => groups[k].rows.sort((a, b) => U.n(a.price) - U.n(b.price)));
    return groups;
  },

  docValid(q, validez) {
    if (!q || !q.date) return '—';
    const p = q.date.split('-').map(Number);
    if (p.length !== 3) return '—';
    const d = new Date(p[0], p[1] - 1, p[2] + (parseInt(validez, 10) || 0));
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  },

  responsable(s) { return s.company.responsable || (s.user ? s.user.name : ''); },

  mailto(s, q) {
    const co = s.company;
    const t = Model.calc(q);
    const lines = [
      'Estimado/a ' + (q.client || 'cliente') + ':', '',
      'Adjuntamos el detalle de la cotización ' + U.code(q.num) + ' (' + U.fdate(q.date) + ').', ''
    ];
    q.items.forEach((it) => {
      lines.push('• ' + (it.name || 'Ítem') + ' — ' + (it.qty || 0) + ' ' + it.unit + ' × ' + U.days(it.days) + ' día(s): ' + U.money(Model.lineOf(it)));
    });
    lines.push('', 'Neto: ' + U.money(t.neto), 'IVA 19%: ' + U.money(t.iva), 'Total: ' + U.money(t.total), '', 'Saludos,', Model.responsable(s), co.name, co.telefono);
    return 'mailto:' + encodeURIComponent(q.email || '') +
      '?subject=' + encodeURIComponent('Cotización ' + U.code(q.num) + ' — ' + co.name) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }
};
