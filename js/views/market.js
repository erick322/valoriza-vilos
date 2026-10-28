// Precios de mercado de referencia (Chile 2026), ajustables por zona.
Views.marketItems = function (s) {
  const zone = s.zones.find((z) => z.id === s.marketZone) || { pct: '0' };
  const zf = 1 + U.n(zone.pct) / 100;
  const term = s.marketSearch.trim().toLowerCase();
  return Data.MARKET
    .filter((m) => (s.marketCat === 'all' || m.cat === s.marketCat) && (!term || m.name.toLowerCase().includes(term)))
    .map((m) => {
      const mn = m.min * zf, mx = m.max * zf;
      const avg = Math.round(((mn + mx) / 2) / 10) * 10;
      // Las unidades que no existen en el catálogo se guardan como "unidad" con el detalle en el nombre.
      const cUnit = (m.unit === 'm²' || m.unit === 'm³' || m.unit === 'unidad') ? m.unit : 'unidad';
      const cName = cUnit === m.unit ? m.name : m.name + ' (' + m.unit + (m.cat === 'jornal' ? ', jornal' : '') + ')';
      return { m: m, mn: mn, mx: mx, avg: avg, cUnit: cUnit, cName: cName, inCat: s.catalog.some((c) => c.name === cName) };
    });
};

Views.market = function (s) {
  const items = Views.marketItems(s);
  const cats = [{ id: 'all', name: 'Todos' }].concat(Object.keys(Data.MARKET_CATS).map((k) => ({ id: k, name: Data.MARKET_CATS[k] })));
  const zoneOpts = s.zones.map((z) => ({ value: z.id, label: z.name + ' (+' + z.pct + '%)' }));
  const cards = items.map((x, i) => {
    const m = x.m;
    return '<li class="mkt-card">' +
      '<div class="mkt-top"><div class="row-main"><span class="row-title wrap">' + U.esc(m.name) + '</span>' +
      '<span class="row-sub">por ' + U.esc(m.unit) + ' · ' + U.esc(Data.MARKET_CATS[m.cat]) + '</span></div>' +
      '<div class="row-end"><span class="mkt-avg">' + U.money(x.avg) + '</span><span class="row-meta">promedio</span></div></div>' +
      '<div class="mkt-range"><span>Mín. <span class="strong">' + U.money(x.mn) + '</span></span>' +
      '<span>Máx. <span class="strong">' + U.money(x.mx) + '</span></span>' +
      '<span class="doc-muted">dif. +' + Math.round(((m.max - m.min) / m.min) * 100) + '%</span></div>' +
      '<div class="mkt-foot"><span class="row-meta">' + U.esc(m.src || 'Obrahub · Santiago') + '</span>' +
      '<button type="button" class="btn-sm" data-click="addMarketItem" data-idx="' + i + '"' + (x.inCat ? ' disabled' : '') + '>' +
      (x.inCat ? 'En tu catálogo ✓' : 'Agregar al catálogo') + '</button></div></li>';
  }).join('');

  return '<div class="stack-14">' +
    '<div class="hero-card sm"><span class="hero-meta">Precios de referencia · Chile 2026</span>' +
    '<span class="hero-title">Materiales y mano de obra</span>' +
    '<span class="hero-text">Rangos referenciales de Chile. Ajústalos a tu zona para estimar los valores de tu región.</span></div>' +
    '<div class="grid-2">' +
    '<div><label class="lbl" for="m-buscar">Buscar</label><input id="m-buscar" class="inp" type="search" placeholder="Ej.: fierro" value="' + U.esc(s.marketSearch) + '" data-input="setMarketSearch"></div>' +
    '<div><label class="lbl" for="m-zona">Ajustar a zona</label><select id="m-zona" class="inp" data-change="setMarketZone">' + U.options(zoneOpts, s.marketZone) + '</select></div>' +
    '</div>' +
    '<div class="chips scroll" role="group" aria-label="Categorías">' + cats.map((c) =>
      '<button type="button" class="chip" data-click="setMarketCat" data-id="' + c.id + '" aria-pressed="' + (s.marketCat === c.id) + '">' + U.esc(c.name) + '</button>').join('') + '</div>' +
    (items.length ? '' : Views.empty('No hay materiales que coincidan con tu búsqueda.')) +
    '<ul class="stack-14">' + cards + '</ul>' +
    '<div class="footnotes">' +
    '<p><span class="bold">Materiales:</span> precios referenciales de Obrahub para Santiago 2026, con IVA. En regiones extremas pueden subir entre 8% y 20% por flete.</p>' +
    '<p><span class="bold">Mano de obra · jornal:</span> lo que se paga al trabajador por día (Obrahub, Chile 2026). Con contrato formal suma entre 35% y 40% por leyes sociales. En el norte y en el sur austral (Coyhaique, Punta Arenas) suele ser entre 15% y 35% más alto.</p>' +
    '<p><span class="bold">Mano de obra · tarifa:</span> lo que cobra un maestro independiente al cliente, por día de 8 horas o por m² (ObraMaestra, Chile 2026). Trabajos urgentes o de fin de semana: +20% a 40%.</p>' +
    '<p>Consultado el 24-10-2026. Son valores de referencia: confirma siempre antes de cotizar.</p>' +
    '</div></div>';
};
