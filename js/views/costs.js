// Balance de costos: lista de análisis, recargos por zona y detalle de un análisis.
Views.costs = function (s) {
  const rows = s.costs.map((k) => {
    const r = Model.costCalc(k, s.zones);
    return '<li><button type="button" class="row-card row" data-click="openCost" data-id="' + k.id + '">' +
      '<span class="tile-icon">' + icon('calc') + '</span>' +
      '<span class="row-main"><span class="row-title">' + U.esc(k.name || 'Sin nombre') + '</span>' +
      '<span class="row-sub">Por ' + U.esc(k.unit) + ' · ' + U.esc(r.zoneName) + '</span></span>' +
      '<span class="row-end"><span class="row-amount acc">' + U.money(r.sugerido) + '</span><span class="row-meta">sugerido</span></span>' +
      '</button></li>';
  }).join('');
  const zones = s.zones.map((z) =>
    '<li class="zone-row">' +
    '<input class="inp" id="z-n-' + z.id + '" aria-label="Nombre de la zona" value="' + U.esc(z.name) + '" data-input="setZone" data-id="' + z.id + '" data-key="name">' +
    '<div class="suffix"><input class="inp" id="z-p-' + z.id + '" type="number" step="any" inputmode="decimal" aria-label="Porcentaje de recargo" value="' + U.esc(z.pct) + '" data-input="setZone" data-id="' + z.id + '" data-key="pct">' +
    '<span class="suffix-mark" aria-hidden="true">%</span></div>' +
    '<button type="button" class="icbtn" aria-label="Eliminar zona" data-click="removeZone" data-id="' + z.id + '">' + icon('trash') + '</button>' +
    '</li>').join('');

  return '<div class="stack">' +
    '<p class="lead">Calcula el costo real por unidad de cada partida y obtén un precio sugerido para tus cotizaciones.</p>' +
    (s.costs.length ? '' : Views.empty('Aún no tienes análisis de costos.')) +
    '<ul class="list">' + rows + '</ul>' +
    '<button type="button" class="btnp" data-click="newCost">' + icon('plus') + 'Nuevo análisis de costo</button>' +
    '<section class="card gap-10"><div class="card-head tight"><h2 class="h2 sm">Recargo por zona o región</h2>' +
    '<span class="note">Se suma al costo directo de cada análisis.</span></div>' +
    '<ul class="stack-10">' + zones + '</ul>' +
    '<button type="button" class="btn2" data-click="addZone">' + icon('plus') + 'Agregar zona</button>' +
    '</section></div>';
};

Views.costEdit = function (s) {
  const k = Model.currentCost(s);
  if (!k) return Views.costs(s);
  const cc = Model.costCalc(k, s.zones);
  const num = (id, key, label) =>
    '<div><label class="lbl" for="' + id + '">' + label + '</label>' +
    '<input id="' + id + '" class="inp" type="number" min="0" step="any" inputmode="decimal" placeholder="0" value="' + U.esc(k[key]) + '" data-input="setCost" data-key="' + key + '"></div>';
  const zoneOpts = s.zones.map((z) => ({ value: z.id, label: z.name + ' (' + z.pct + '%)' }));
  const provOpts = [{ value: '', label: 'Sin proveedor' }].concat(s.providers.map((p) => ({ value: p.id, label: p.name || 'Sin nombre' })));
  const bars = cc.parts.map((p) => {
    const share = cc.directo > 0 ? (p.v / cc.directo) * 100 : 0;
    return '<li class="bar-row"><div class="bar-head"><span>' + p.label + '</span>' +
      '<span><span class="doc-muted">' + U.pct(share) + '</span>  <span class="strong">' + U.money(p.v) + '</span></span></div>' +
      '<span class="bar"><span class="bar-fill" style="width:' + share.toFixed(1) + '%"></span></span></li>';
  }).join('');

  return '<div class="stack">' +
    '<section class="card">' +
    '<div><label class="lbl" for="k-nombre">Partida</label>' +
    '<input id="k-nombre" class="inp" placeholder="Ej.: Loza de concreto" value="' + U.esc(k.name) + '" data-input="setCost" data-key="name"></div>' +
    '<div class="grid-2">' +
    '<div><label class="lbl" for="k-unidad">Unidad</label><select id="k-unidad" class="inp" data-change="setCost" data-key="unit">' + U.options(Data.UNITS, k.unit) + '</select></div>' +
    '<div><label class="lbl" for="k-zona">Zona / región</label><select id="k-zona" class="inp" data-change="setCost" data-key="zoneId">' + U.options(zoneOpts, k.zoneId) + '</select></div>' +
    '</div>' +
    '<div><label class="lbl" for="k-prov">Proveedor de materiales</label><select id="k-prov" class="inp" data-change="setCost" data-key="providerId">' + U.options(provOpts, k.providerId || '') + '</select></div>' +
    '</section>' +
    '<section class="card"><h2 class="h2 sm">Costos por ' + U.esc(k.unit) + '</h2><div class="grid-2">' +
    num('k-mat', 'materiales', 'Materiales') + num('k-flete', 'flete', 'Flete') +
    num('k-transp', 'transporte', 'Transporte') + num('k-dep', 'depreciacion', 'Depreciación herram.') +
    num('k-gest', 'gestion', 'Gestión de compra') + num('k-util', 'utilidad', 'Margen utilidad %') +
    '</div></section>' +
    '<section class="card"><h2 class="h2 sm">Balance de costos</h2><ul class="stack-12">' + bars + '</ul>' +
    '<dl class="summary">' +
    '<div><dt>Costo directo</dt><dd>' + U.money(cc.directo) + '</dd></div>' +
    '<div><dt>Recargo zona (' + U.pct(cc.zonaPct) + ')</dt><dd>' + U.money(cc.zona) + '</dd></div>' +
    '<div><dt>Costo total</dt><dd class="bold">' + U.money(cc.costo) + '</dd></div>' +
    '<div><dt>Utilidad (' + U.pct(cc.utilPct) + ')</dt><dd>' + U.money(cc.util) + '</dd></div>' +
    '</dl></section>' +
    '<button type="button" class="danger-link" data-click="deleteCost">Eliminar análisis</button>' +
    '</div>';
};

Views.costBar = function (s) {
  const k = Model.currentCost(s);
  const cc = Model.costCalc(k, s.zones);
  const inCatalog = s.catalog.some((c) => c.costId === k.id);
  const label = s.savedCostId === k.id ? 'Guardado en catálogo ✓' : (inCatalog ? 'Actualizar precio en catálogo' : 'Guardar en catálogo');
  return '<div class="bottom-bar"><div class="totals">' +
    '<div class="totals-side"><span>Costo total ' + U.money(cc.costo) + '</span><span>por ' + U.esc(k.unit) + '</span></div>' +
    '<div class="totals-main"><span class="totals-label">Precio sugerido</span><span class="totals-value acc">' + U.money(cc.sugerido) + '</span></div>' +
    '</div><button type="button" class="btnp" data-click="saveCostToCatalog">' + icon('box') + '<span aria-live="polite">' + label + '</span></button></div>';
};
