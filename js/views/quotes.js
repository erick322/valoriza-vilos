// Cotizaciones: lista, edición y hoja tamaño carta.
Views.list = function (s) {
  const term = s.search.trim().toLowerCase();
  const quotes = s.quotes
    .filter((q) => !term || (q.client || '').toLowerCase().includes(term) || U.code(q.num).toLowerCase().includes(term))
    .slice().sort((a, b) => b.num - a.num);
  const sum = s.quotes.reduce((a, q) => a + Model.calc(q).total, 0);
  const rows = quotes.map((q) =>
    '<li><button type="button" class="row-card row" data-click="openQuote" data-id="' + q.id + '">' +
    '<span class="tile-icon">' + icon('doc') + '</span>' +
    '<span class="row-main"><span class="row-title">' + U.esc(q.client || 'Sin cliente') + '</span>' +
    '<span class="row-sub">' + U.code(q.num) + ' · ' + U.fdate(q.date) + '</span></span>' +
    '<span class="row-end"><span class="row-amount">' + U.money(Model.calc(q).total) + '</span>' +
    '<span class="row-meta">' + U.plural(q.items.length, 'ítem', 'ítems') + '</span></span>' +
    '</button></li>').join('');
  return '<div class="stack pad-fab">' +
    '<div class="hero-card"><span class="hero-label">Total cotizado (con IVA)</span>' +
    '<span class="hero-amount">' + U.money(sum) + '</span>' +
    '<span class="hero-meta">' + U.plural(s.quotes.length, 'cotización', 'cotizaciones') + '</span></div>' +
    '<div><label class="lbl" for="buscar">Buscar</label>' +
    '<input id="buscar" class="inp" type="search" placeholder="Cliente o N° de cotización" value="' + U.esc(s.search) + '" data-input="setSearch"></div>' +
    (quotes.length ? '' : Views.empty('No hay cotizaciones que mostrar. Toca «Nueva» para crear la primera.', true)) +
    '<ul class="list">' + rows + '</ul></div>';
};

Views.edit = function (s) {
  const q = Model.current(s);
  if (!q) return Views.list(s);
  const qf = (id, key, label, attrs) =>
    '<div><label class="lbl" for="' + id + '">' + label + '</label>' +
    '<input id="' + id + '" class="inp" ' + attrs + ' value="' + U.esc(q[key] || '') + '" data-input="setQuoteField" data-key="' + key + '"></div>';
  const items = q.items.map((it, i) => {
    const f = (prefix, key, label, attrs) =>
      '<div><label class="lbl" for="' + prefix + '-' + i + '">' + label + '</label>' +
      '<input id="' + prefix + '-' + i + '" class="inp" ' + attrs + ' value="' + U.esc(it[key]) + '" data-input="setItem" data-idx="' + i + '" data-key="' + key + '"></div>';
    return '<li class="card compact">' +
      '<div class="field-row"><div class="grow">' +
      '<label class="lbl" for="n-' + i + '">Descripción</label>' +
      '<input id="n-' + i + '" class="inp" placeholder="Producto o servicio" value="' + U.esc(it.name) + '" data-input="setItem" data-idx="' + i + '" data-key="name">' +
      '</div><button type="button" class="icbtn" aria-label="Eliminar producto" data-click="removeItem" data-idx="' + i + '">' + icon('trash') + '</button></div>' +
      '<div class="grid-3">' +
      '<div><label class="lbl" for="u-' + i + '">Unidad</label>' +
      '<select id="u-' + i + '" class="inp" data-change="setItem" data-idx="' + i + '" data-key="unit">' + U.options(Data.UNITS, it.unit) + '</select></div>' +
      f('c', 'qty', 'Cantidad', 'type="number" min="0" step="any" inputmode="decimal"') +
      f('d', 'days', 'Días', 'type="number" min="1" step="1" inputmode="numeric"') +
      '</div>' +
      '<div class="grid-2 tight align-end">' +
      f('p', 'price', 'Precio unitario', 'type="number" min="0" step="any" inputmode="decimal"') +
      '<div class="subtotal"><span class="subtotal-label">Subtotal</span><span class="subtotal-value">' + U.money(Model.lineOf(it)) + '</span></div>' +
      '</div></li>';
  }).join('');

  return '<div class="stack">' +
    '<section class="card" aria-label="Datos del cliente">' +
    qf('f-cliente', 'client', 'Cliente', 'placeholder="Nombre del cliente"') +
    qf('f-correo', 'email', 'Correo del cliente', 'type="email" placeholder="cliente@correo.cl"') +
    '<div class="grid-2">' +
    qf('f-rut', 'rut', 'RUT del cliente', 'placeholder="12.345.678-9"') +
    qf('f-obra', 'obra', 'Obra / dirección', 'placeholder="Dirección de la obra"') +
    '</div><div class="grid-2">' +
    '<div><label class="lbl" for="f-fecha">Fecha</label>' +
    '<input id="f-fecha" class="inp" type="date" value="' + U.esc(q.date) + '" data-change="setQuoteField" data-key="date"></div>' +
    '<div><span class="lbl">N° cotización</span><div class="code-pill">' + U.code(q.num) + '</div></div>' +
    '</div></section>' +
    '<div class="section-head"><h2 class="h2">Productos</h2><span class="count">' + U.plural(q.items.length, 'ítem', 'ítems') + '</span></div>' +
    (q.items.length ? '' : Views.empty('Aún no hay productos. Agrégalos desde tu catálogo o crea uno en blanco.')) +
    '<ul class="stack">' + items + '</ul>' +
    '<div class="btn-row">' +
    '<button type="button" class="btn2" data-click="openPicker">' + icon('box') + 'Desde catálogo</button>' +
    '<button type="button" class="btn2" data-click="addBlank">' + icon('plus') + 'Ítem en blanco</button>' +
    '</div>' +
    '<button type="button" class="danger-link" data-click="deleteQuote">Eliminar cotización</button>' +
    '</div>';
};

Views.preview = function (s) {
  const q = Model.current(s);
  if (!q) return Views.list(s);
  const co = s.company;
  const t = Model.calc(q);
  const resp = Model.responsable(s) || '—';
  const code = U.code(q.num);
  const e = U.esc;
  const logo = co.logo
    ? '<img class="doc-logo" src="' + e(co.logo) + '" alt="Logo de la empresa">'
    : '<div class="doc-mono">' + U.initials(co.name) + '</div>';
  const rows = q.items.map((it, i) =>
    '<div class="doc-tr' + (i % 2 === 1 ? ' alt' : '') + '" role="row">' +
    '<span class="doc-muted" role="cell">' + (i + 1) + '</span><span role="cell">' + e(it.name || 'Sin descripción') + '</span>' +
    '<span role="cell">' + e(it.unit) + '</span><span class="num" role="cell">' + e(it.qty || 0) + '</span>' +
    '<span class="num" role="cell">' + U.days(it.days) + '</span><span class="num" role="cell">' + U.money(U.n(it.price)) + '</span>' +
    '<span class="num strong" role="cell">' + U.money(Model.lineOf(it)) + '</span></div>').join('');

  return '<div class="stack-10">' +
    '<div class="sheet-tools"><span class="note">Hoja tamaño carta</span>' +
    '<button type="button" class="btn-sm" data-click="toggleZoom">' + (s.sheetFit ? 'Ver tamaño real' : 'Ajustar a pantalla') + '</button></div>' +
    '<div class="paper-wrap scroll">' +
    '<article class="doc' + (s.sheetFit ? ' fit' : '') + '" aria-label="Cotización ' + code + '">' +
    '<header class="doc-head"><div class="doc-brand">' + logo +
    '<div class="doc-co"><span class="doc-co-name">' + e(co.name) + '</span>' +
    '<span class="doc-muted">' + e(co.giro) + '</span><span>RUT ' + e(co.rut) + '</span>' +
    '<span>' + e(co.direccion) + '</span><span>' + e(co.telefono) + ' · ' + e(co.correo) + '</span>' +
    '<span class="doc-acc">' + e(co.web) + '</span></div></div>' +
    '<div class="doc-badge"><div class="doc-badge-title">COTIZACIÓN</div>' +
    '<div class="doc-badge-body"><span class="doc-badge-num">N° ' + code + '</span>' +
    '<span class="doc-muted">Emitida el ' + U.fdate(q.date) + '</span></div></div></header>' +

    '<div class="grid-2 gap-12">' +
    '<div class="doc-box"><span class="doc-kicker">DATOS DEL CLIENTE</span><dl class="doc-dl">' +
    '<dt>Señor(es)</dt><dd class="strong">' + e(q.client || '—') + '</dd>' +
    '<dt>RUT</dt><dd>' + e(q.rut || '—') + '</dd>' +
    '<dt>Obra</dt><dd>' + e(q.obra || '—') + '</dd>' +
    '<dt>Correo</dt><dd>' + e(q.email || '—') + '</dd></dl></div>' +
    '<div class="doc-box"><span class="doc-kicker">CONDICIONES COMERCIALES</span><dl class="doc-dl wide">' +
    '<dt>Fecha</dt><dd>' + U.fdate(q.date) + '</dd>' +
    '<dt>Válida hasta</dt><dd class="strong">' + Model.docValid(q, co.validez) + '</dd>' +
    '<dt>Forma de pago</dt><dd>' + e(co.pago) + '</dd>' +
    '<dt>Atendido por</dt><dd>' + e(resp) + '</dd></dl></div></div>' +

    '<div class="doc-table" role="table" aria-label="Detalle de productos">' +
    '<div class="doc-tr th" role="row"><span role="columnheader">N°</span><span role="columnheader">Descripción</span><span role="columnheader">Unidad</span>' +
    '<span class="num" role="columnheader">Cant.</span><span class="num" role="columnheader">Días</span>' +
    '<span class="num" role="columnheader">P. unitario</span><span class="num" role="columnheader">Total</span></div>' +
    rows + (q.items.length ? '' : '<div class="doc-empty">Esta cotización aún no tiene productos.</div>') + '</div>' +

    '<div class="doc-foot"><div class="doc-obs"><span class="doc-kicker">OBSERVACIONES</span>' +
    '<span class="doc-obs-text">' + e(co.condiciones) + '</span></div>' +
    '<div class="doc-totals"><div><span class="doc-muted">Subtotal neto</span><span>' + U.money(t.neto) + '</span></div>' +
    '<div><span class="doc-muted">IVA (19%)</span><span>' + U.money(t.iva) + '</span></div>' +
    '<div class="total"><span>TOTAL</span><span>' + U.money(t.total) + '</span></div></div></div>' +

    '<div class="grow"></div>' +
    '<div class="doc-sign"><div><div class="doc-sign-line"></div><span class="bold">' + e(resp) + '</span>' +
    '<span class="doc-muted">' + e(co.cargo) + '</span><span class="doc-muted">' + e(co.name) + '</span></div></div>' +
    '<footer class="doc-footer"><span>' + e(co.name) + ' · RUT ' + e(co.rut) + '</span>' +
    '<span>' + e(co.telefono) + ' · ' + e(co.correo) + '</span></footer>' +
    '</article></div></div>';
};
