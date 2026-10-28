// Proveedores: lista, comparación de precios y ficha con productos cotizados.
Views.contactLink = function (href, cls, label, inner) {
  const off = href === '#';
  return '<a class="' + cls + '" href="' + U.esc(href) + '"' + (off ? ' aria-disabled="true" tabindex="-1"' : '') +
    (href.indexOf('https:') === 0 ? ' target="_blank" rel="noopener"' : '') + (label ? ' aria-label="' + U.esc(label) + '"' : '') + '>' + inner + '</a>';
};

Views.providers = function (s) {
  const cmp = s.provView === 'compare';
  return '<div class="stack">' +
    '<div class="segmented">' +
    '<button type="button" class="seg-btn" data-click="setProvView" data-view="list" aria-pressed="' + !cmp + '">Proveedores</button>' +
    '<button type="button" class="seg-btn" data-click="setProvView" data-view="compare" aria-pressed="' + cmp + '">Comparar precios</button>' +
    '</div>' + (cmp ? Views.compare(s) : Views.providerList(s)) + '</div>';
};

Views.providerList = function (s) {
  const term = s.provSearch.trim().toLowerCase();
  const list = s.providers.filter((p) => !term || (p.name || '').toLowerCase().includes(term) || (p.rubro || '').toLowerCase().includes(term));
  const rows = list.map((p) => {
    const name = p.name || 'Sin nombre';
    const lk = Model.provLinks(p);
    const np = s.supplierPrices.filter((x) => x.providerId === p.id).length;
    return '<li class="prov-row">' +
      '<button type="button" class="prov-open row" data-click="openProvider" data-id="' + U.esc(p.id) + '">' +
      '<span class="avatar" aria-hidden="true">' + U.initials(p.name) + '</span>' +
      '<span class="prov-text"><span class="row-title">' + U.esc(name) + '</span>' +
      '<span class="row-sub ellipsis">' + U.esc(p.rubro || 'Sin rubro') + ' · ' + U.plural(np, 'producto', 'productos') + '</span></span>' +
      '</button>' +
      Views.contactLink(lk.tel, 'sq-action', 'Llamar a ' + name, icon('phone')) +
      Views.contactLink(lk.mail, 'sq-action', 'Escribir a ' + name, icon('mail')) +
      '</li>';
  }).join('');
  return '<div class="stack">' +
    '<div><label class="lbl" for="buscar-prov">Buscar</label>' +
    '<input id="buscar-prov" class="inp" type="search" placeholder="Nombre o rubro" value="' + U.esc(s.provSearch) + '" data-input="setProvSearch"></div>' +
    (list.length ? '' : Views.empty('No hay proveedores que mostrar.')) +
    '<ul class="list">' + rows + '</ul>' +
    '<button type="button" class="btnp" data-click="newProvider">' + icon('plus') + 'Nuevo proveedor</button></div>';
};

Views.compare = function (s) {
  const groups = Model.priceGroups(s);
  const term = s.cmpSearch.trim().toLowerCase();
  const list = Object.keys(groups).map((k) => groups[k])
    .filter((g) => !term || g.name.toLowerCase().includes(term))
    .sort((a, b) => (b.rows.length - a.rows.length) || a.name.localeCompare(b.name));
  const sections = list.map((g) => {
    const min = U.n(g.rows[0].price);
    const max = U.n(g.rows[g.rows.length - 1].price);
    const multi = g.rows.length > 1;
    const rows = g.rows.map((r, i) => {
      const v = U.n(r.price);
      const best = multi && i === 0;
      const diff = best ? 'Mejor precio' : (multi ? '+' + U.pct(min > 0 ? ((v - min) / min) * 100 : 0) : '');
      return '<li><button type="button" class="cmp-row' + (best ? ' best' : '') + '" data-click="openProvider" data-id="' + U.esc(r.providerId) + '">' +
        '<span class="cmp-line"><span class="cmp-name">' + U.esc(Model.provName(s, r.providerId)) + '</span><span class="cmp-price">' + U.money(v) + '</span></span>' +
        '<span class="cmp-line"><span class="bar"><span class="bar-fill" style="width:' + (max > 0 ? (v / max) * 100 : 0).toFixed(1) + '%"></span></span>' +
        '<span class="cmp-diff">' + diff + '</span></span>' +
        '<span class="row-meta">Cotizado el ' + U.fdate(r.date) + '</span></button></li>';
    }).join('');
    const saving = multi
      ? 'Ahorras hasta ' + U.money(max - min) + ' por ' + U.esc(g.unit) + ' comprando a ' + U.esc(Model.provName(s, g.rows[0].providerId))
      : 'Solo un proveedor cotizado: pide otra cotización para comparar.';
    return '<section class="card compact gap-8">' +
      '<div class="section-head"><h2 class="row-title bold">' + U.esc(g.name) + '</h2><span class="count">por ' + U.esc(g.unit) + '</span></div>' +
      '<ul class="stack-8">' + rows + '</ul><span class="saving">' + saving + '</span></section>';
  }).join('');
  return '<div class="stack-12">' +
    '<div><label class="lbl" for="buscar-cmp">Buscar producto</label>' +
    '<input id="buscar-cmp" class="inp" type="search" placeholder="Ej.: cemento" value="' + U.esc(s.cmpSearch) + '" data-input="setCmpSearch"></div>' +
    (list.length ? '' : Views.empty('Registra productos cotizados en la ficha de cada proveedor para compararlos aquí.')) +
    sections + '</div>';
};

Views.providerEdit = function (s) {
  const p = Model.currentProvider(s);
  if (!p) return Views.providers(s);
  const lk = Model.provLinks(p);
  const f = (id, key, label, attrs) =>
    '<div><label class="lbl" for="' + id + '">' + label + '</label>' +
    '<input id="' + id + '" class="inp" ' + attrs + ' value="' + U.esc(p[key]) + '" data-input="setProv" data-key="' + key + '"></div>';
  const groups = Model.priceGroups(s);
  const prods = s.supplierPrices.filter((sp) => sp.providerId === p.id);
  const prodRows = prods.map((sp) => {
    const g = groups[Model.spKey(sp)];
    let badge = '';
    if (g && g.rows.length > 1) {
      const min = U.n(g.rows[0].price);
      badge = g.rows[0].id === sp.id
        ? '<span class="pill best">Mejor precio</span>'
        : '<span class="pill worse">+' + U.pct(min > 0 ? ((U.n(sp.price) - min) / min) * 100 : 0) + ' vs ' + U.esc(Model.provName(s, g.rows[0].providerId)) + '</span>';
    } else if (g) badge = '<span class="pill neutral">Sin otro proveedor para comparar</span>';
    const id = U.esc(sp.id);
    return '<li class="sp-card">' +
      '<div class="field-row"><div class="grow"><label class="lbl" for="sp-n-' + id + '">Producto</label>' +
      '<input id="sp-n-' + id + '" class="inp" list="productos" placeholder="Ej.: Cemento saco 25 kg" value="' + U.esc(sp.product) + '" data-input="setSP" data-id="' + id + '" data-key="product"></div>' +
      '<button type="button" class="icbtn" aria-label="Eliminar producto cotizado" data-click="removeSP" data-id="' + id + '">' + icon('trash') + '</button></div>' +
      '<div class="grid-2 tight">' +
      '<div><label class="lbl" for="sp-u-' + id + '">Unidad</label><select id="sp-u-' + id + '" class="inp" data-change="setSP" data-id="' + id + '" data-key="unit">' + U.options(Data.SUPPLY_UNITS, sp.unit) + '</select></div>' +
      '<div><label class="lbl" for="sp-p-' + id + '">Precio</label><input id="sp-p-' + id + '" class="inp" type="number" min="0" step="any" inputmode="decimal" placeholder="0" value="' + U.esc(sp.price) + '" data-input="setSP" data-id="' + id + '" data-key="price"></div>' +
      '</div>' +
      '<div><label class="lbl" for="sp-d-' + id + '">Fecha de cotización</label><input id="sp-d-' + id + '" class="inp" type="date" value="' + U.esc(sp.date) + '" data-change="setSP" data-id="' + id + '" data-key="date"></div>' +
      badge + '</li>';
  }).join('');
  const names = {};
  s.supplierPrices.forEach((sp) => { const t = (sp.product || '').trim(); if (t) names[t] = true; });
  s.catalog.forEach((c) => { const t = (c.name || '').trim(); if (t) names[t] = true; });
  const links = s.costs.filter((k) => k.providerId === p.id).map((k) =>
    '<li><button type="button" class="sub-row row" data-click="openCost" data-id="' + k.id + '">' +
    '<span class="sub-row-title">' + U.esc(k.name || 'Sin nombre') + '</span>' +
    '<span class="row-sub">Materiales ' + U.money(U.n(k.materiales)) + ' / ' + U.esc(k.unit) + '</span></button></li>').join('');

  return '<div class="stack">' +
    '<div class="contact-grid">' +
    Views.contactLink(lk.tel, 'contact-btn', '', icon('phone') + 'Llamar') +
    Views.contactLink(lk.wa, 'contact-btn', '', icon('chat') + 'WhatsApp') +
    Views.contactLink(lk.mail, 'contact-btn', '', icon('mail') + 'Correo') +
    '</div>' +
    '<section class="card" aria-label="Datos del proveedor">' +
    f('pv-nombre', 'name', 'Nombre o razón social', 'placeholder="Nombre del proveedor"') +
    '<div class="grid-2">' + f('pv-rut', 'rut', 'RUT', 'placeholder="12.345.678-9"') + f('pv-rubro', 'rubro', 'Rubro', 'placeholder="Ej.: Hormigón"') + '</div>' +
    f('pv-contacto', 'contacto', 'Persona de contacto', 'placeholder="Nombre"') +
    '<div class="grid-2">' + f('pv-tel', 'telefono', 'Teléfono', 'type="tel" placeholder="+56 9 …"') + f('pv-correo', 'correo', 'Correo', 'type="email" placeholder="ventas@…"') + '</div>' +
    f('pv-dir', 'direccion', 'Dirección', 'placeholder="Calle, número, ciudad"') +
    '<div><label class="lbl" for="pv-notas">Notas (condiciones, plazos de entrega, descuentos)</label>' +
    '<textarea id="pv-notas" class="inp" rows="3" data-input="setProv" data-key="notas">' + U.esc(p.notas) + '</textarea></div>' +
    '</section>' +
    '<section class="card gap-10"><div class="section-head"><h2 class="h2 sm">Productos cotizados</h2><span class="count">' + U.plural(prods.length, 'producto', 'productos') + '</span></div>' +
    (prods.length ? '' : '<p class="lead">Registra los precios que te cotizó este proveedor para compararlos con los demás.</p>') +
    '<ul class="stack-10">' + prodRows + '</ul>' +
    '<button type="button" class="btn2" data-click="addSupplierPrice">' + icon('plus') + 'Agregar producto cotizado</button>' +
    '<datalist id="productos">' + Object.keys(names).sort().map((n) => '<option value="' + U.esc(n) + '"></option>').join('') + '</datalist>' +
    '</section>' +
    '<section class="card gap-10"><h2 class="h2 sm">Partidas que abastece</h2>' +
    (links ? '<ul class="stack-10">' + links + '</ul>' : '<p class="lead">Ningún análisis de costo usa este proveedor todavía. Asígnalo desde Costos.</p>') +
    '</section>' +
    '<button type="button" class="danger-link" data-click="deleteProvider">Eliminar proveedor</button>' +
    '</div>';
};
