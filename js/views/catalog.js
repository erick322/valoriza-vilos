// Catálogo de ítems reutilizables para las cotizaciones.
Views.catalog = function (s) {
  const d = s.draft;
  const items = s.catalog.map((c) =>
    '<li class="cat-card">' +
    '<div class="cat-top"><input id="cat-n-' + c.id + '" class="inp inp-strong" aria-label="Nombre del ítem" value="' + U.esc(c.name) + '" data-input="setCat" data-id="' + c.id + '" data-key="name">' +
    '<button type="button" class="icbtn" aria-label="Eliminar del catálogo" data-click="removeCat" data-id="' + c.id + '">' + icon('trash') + '</button></div>' +
    '<div class="grid-2 tight">' +
    '<select id="cat-u-' + c.id + '" class="inp" aria-label="Unidad" data-change="setCat" data-id="' + c.id + '" data-key="unit">' + U.options(Data.UNITS, c.unit) + '</select>' +
    '<input id="cat-p-' + c.id + '" class="inp" type="number" min="0" step="any" inputmode="decimal" aria-label="Precio" value="' + U.esc(c.price) + '" data-input="setCat" data-id="' + c.id + '" data-key="price">' +
    '</div></li>').join('');

  return '<div class="stack">' +
    '<form class="card" data-submit="addToCatalog"><h2 class="h2 sm">Nuevo ítem</h2>' +
    '<div><label class="lbl" for="cat-nombre">Nombre</label>' +
    '<input id="cat-nombre" class="inp" placeholder="Ej.: Pintura muro exterior" value="' + U.esc(d.name) + '" data-input="setDraft" data-key="name"></div>' +
    '<div class="grid-2">' +
    '<div><label class="lbl" for="cat-unidad">Unidad</label><select id="cat-unidad" class="inp" data-change="setDraft" data-key="unit">' + U.options(Data.UNITS, d.unit) + '</select></div>' +
    '<div><label class="lbl" for="cat-precio">Precio</label><input id="cat-precio" class="inp" type="number" min="0" step="any" inputmode="decimal" placeholder="0" value="' + U.esc(d.price) + '" data-input="setDraft" data-key="price"></div>' +
    '</div>' +
    '<button type="submit" class="btnp">' + icon('plus') + 'Agregar al catálogo</button></form>' +
    '<div class="section-head"><h2 class="h2">Mis ítems</h2><span class="count">' + U.plural(s.catalog.length, 'ítem', 'ítems') + '</span></div>' +
    '<ul class="stack-10">' + items + '</ul></div>';
};
