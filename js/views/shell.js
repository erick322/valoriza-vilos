// Estructura general: encabezado, navegación, barras inferiores y capas (menú de cuenta, catálogo).
window.Views = {};

Views.TAB_SCREENS = ['list', 'costs', 'market', 'providers', 'catalog'];
Views.BACK_SCREENS = ['theme', 'edit', 'preview', 'costEdit', 'providerEdit'];

Views.empty = function (text, lg) {
  return '<div class="empty' + (lg ? ' lg' : '') + '">' + text + '</div>';
};

Views.app = function (s) {
  const p = U.palette(s.theme);
  const vars = '--acc:' + p.acc + ';--acc-d:' + p.accD + ';--acc-s:' + p.accS + ';--acc-b:' + p.accB +
    ';--acc-l:' + p.accL + ';--brand:' + p.brand + ';--bg:' + p.bg;
  let body;
  if (s.screen === 'login') body = Views.login(s);
  else if (s.screen === 'register') body = Views.register(s);
  else if (s.screen === 'newPass') body = Views.newPass(s);
  else body = Views.header(s) + '<main class="main scroll" id="main">' +
    Views.syncNote(s) +
    Views.screen(s) + '</main>' +
    Views.footer(s) + Views.picker(s) + Views.userMenu(s);
  return '<div class="app" style="' + vars + '">' + body + '</div>';
};

Views.title = function (s) {
  const cur = Model.current(s), ck = Model.currentCost(s), pv = Model.currentProvider(s);
  const titles = {
    market: 'Precios de mercado', theme: 'Diseño y empresa', list: 'Cotizaciones', catalog: 'Catálogo',
    providers: 'Proveedores', providerEdit: pv ? (pv.name || 'Proveedor') : 'Proveedor',
    costs: 'Balance de costos', costEdit: ck ? (ck.name || 'Análisis de costo') : 'Análisis de costo',
    edit: cur ? U.code(cur.num) : 'Cotización', preview: 'Vista previa'
  };
  return titles[s.screen] || '';
};

Views.header = function (s) {
  const lead = Views.BACK_SCREENS.includes(s.screen)
    ? '<button type="button" class="icon-btn" data-click="goBack" aria-label="Volver">' + icon('back') + '</button>'
    : '<div class="brand-badge"><img src="assets/logo.png" alt="Logo"></div>';
  return '<header class="topbar">' + lead +
    '<div class="topbar-text"><span class="topbar-eyebrow">Viloriza</span>' +
    '<h1 class="topbar-title">' + U.esc(Views.title(s)) + '</h1></div>' +
    '<button type="button" class="avatar-btn" data-click="toggleUserMenu" aria-label="Cuenta de ' + U.esc(s.user.name) +
    '" aria-expanded="' + (s.userMenu ? 'true' : 'false') + '" aria-haspopup="dialog">' + U.initials(s.user.name || s.user.email) + '</button>' +
    '</header>';
};

Views.screen = function (s) {
  const map = {
    list: Views.list, edit: Views.edit, preview: Views.preview, costs: Views.costs, costEdit: Views.costEdit,
    providers: Views.providers, providerEdit: Views.providerEdit, market: Views.market, theme: Views.theme, catalog: Views.catalog
  };
  return (map[s.screen] || Views.list)(s);
};

Views.footer = function (s) {
  let out = '';
  if (s.screen === 'list') {
    out += '<button type="button" class="fab" data-click="newQuote">' + icon('plus') + 'Nueva</button>';
  }
  if (s.screen === 'edit' && Model.current(s)) {
    const t = Model.calc(Model.current(s));
    out += '<div class="bottom-bar"><div class="totals">' +
      '<div class="totals-side"><span>Neto ' + U.money(t.neto) + '</span><span>IVA 19% ' + U.money(t.iva) + '</span></div>' +
      '<div class="totals-main"><span class="totals-label">Total</span><span class="totals-value">' + U.money(t.total) + '</span></div>' +
      '</div><button type="button" class="btnp" data-click="goPreview">' + icon('eye') + 'Vista previa</button></div>';
  }
  if (s.screen === 'costEdit' && Model.currentCost(s)) out += Views.costBar(s);
  if (s.screen === 'preview' && Model.current(s)) {
    out += '<div class="bottom-bar row-dir">' +
      '<button type="button" class="btn2" data-click="goEdit">Editar</button>' +
      '<a class="btnp wide" href="' + U.esc(Model.mailto(s, Model.current(s))) + '">' + icon('send') + 'Enviar por correo</a></div>';
  }
  if (Views.TAB_SCREENS.includes(s.screen)) out += Views.nav(s);
  return out;
};

Views.nav = function (s) {
  const tabs = [
    ['list', 'goList', 'docTab', 'Cotizaciones'],
    ['costs', 'goCosts', 'calc', 'Costos'],
    ['market', 'goMarket', 'trend', 'Mercado'],
    ['providers', 'goProviders', 'truck', 'Proveedores'],
    ['catalog', 'goCatalog', 'box', 'Catálogo']
  ];
  return '<nav class="nav" aria-label="Secciones">' + tabs.map((t) =>
    '<button type="button" class="tab" data-click="' + t[1] + '"' + (s.screen === t[0] ? ' aria-current="page"' : '') + '>' +
    icon(t[2]) + t[3] + '</button>').join('') + '</nav>';
};

Views.userMenu = function (s) {
  if (!s.userMenu) return '';
  return '<div class="layer">' +
    '<button type="button" class="scrim" data-click="toggleUserMenu" aria-label="Cerrar menú de cuenta"></button>' +
    '<div class="popover" role="dialog" aria-label="Cuenta">' +
    '<div class="who"><span class="avatar" aria-hidden="true">' + U.initials(s.user.name || s.user.email) + '</span>' +
    '<div class="who-text"><span class="who-name ellipsis">' + U.esc(s.user.name) + '</span>' +
    '<span class="who-mail ellipsis">' + U.esc(s.user.email) + '</span></div></div>' +
    '<button type="button" class="btn2 btn-block" data-click="goTheme" id="menu-first">' + icon('palette') + 'Diseño y datos de empresa</button>' +
    Views.install(s) +
    '<button type="button" class="btn2 btn-block danger" data-click="logout">' + icon('logout') + 'Cerrar sesión</button>' +
    '</div></div>';
};

Views.picker = function (s) {
  if (!s.picker || s.screen !== 'edit') return '';
  const rows = s.catalog.map((c) =>
    '<li><button type="button" class="pick-row row" data-click="pickCatalog" data-id="' + c.id + '">' +
    '<span class="row-main"><span class="row-title">' + U.esc(c.name) + '</span>' +
    '<span class="row-sub">' + U.money(U.n(c.price)) + ' / ' + U.esc(c.unit) + '</span></span>' +
    '<span class="pick-add" aria-hidden="true">' + icon('plus') + '</span></button></li>').join('');
  return '<div class="sheet-layer">' +
    '<button type="button" class="sheet-close" data-click="closePicker" aria-label="Cerrar catálogo"></button>' +
    '<div class="sheet scroll" role="dialog" aria-labelledby="picker-title">' +
    '<div class="grabber" aria-hidden="true"></div>' +
    '<h2 class="sheet-title" id="picker-title">Agregar desde catálogo</h2>' +
    (s.catalog.length ? '' : '<p class="lead">Tu catálogo está vacío. Agrega ítems en la pestaña Catálogo.</p>') +
    '<ul class="stack-8">' + rows + '</ul></div></div>';
};

// Aviso cuando los cambios no llegaron a Supabase (quedan en este navegador y se reintentan).
Views.syncNote = function (s) {
  const text = {
    error: 'Sin conexión con la nube: tus cambios quedan en este navegador y se enviarán cuando vuelva internet.',
    expired: 'Tu sesión venció. Cierra sesión y vuelve a entrar para guardar en la nube; tus cambios quedan en este navegador.',
    local: 'No se pudieron guardar los últimos cambios: el navegador no tiene espacio o bloquea el almacenamiento.'
  }[s.saveError];
  return text ? '<p class="alert" role="alert">' + text + '</p>' : '';
};

// Instalar en el teléfono: Chrome (Android y computador) ofrece el botón; en iPhone se hace desde Compartir.
Views.install = function (s) {
  if (s.canInstall) return '<button type="button" class="btn2 btn-block" data-click="install">' + icon('download') + 'Instalar en este teléfono</button>';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone;
  return ios ? '<p class="small install-hint">Para instalarla en tu iPhone: toca Compartir y luego «Agregar a pantalla de inicio».</p>' : '';
};
