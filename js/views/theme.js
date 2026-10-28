// Diseño y datos de empresa: logo, datos para la hoja, paletas y colores personalizados.
Views.theme = function (s) {
  const co = s.company;
  const pal = U.palette(s.theme);
  const f = (id, key, label, attrs) =>
    '<div><label class="lbl" for="' + id + '">' + label + '</label>' +
    '<input id="' + id + '" class="inp" ' + attrs + ' value="' + U.esc(co[key]) + '" data-input="setCo" data-key="' + key + '"></div>';

  const warns = [];
  if (U.contrast(pal.acc, '#ffffff') < 4.5) warns.push('El color principal es muy claro: el texto blanco de los botones se leerá mal.');
  if (U.contrast(pal.brand, '#ffffff') < 4.5) warns.push('El color de marca es muy claro para el texto blanco que va encima.');
  if (U.contrast(pal.bg, '#172024') < 7) warns.push('El fondo de la app es muy oscuro para el texto.');

  const presets = Data.PRESETS.map((p, i) => {
    const on = p.acc === s.theme.acc && p.brand === s.theme.brand && p.bg === s.theme.bg;
    return '<button type="button" class="preset" data-click="pickPreset" data-idx="' + i + '" aria-pressed="' + on + '">' +
      '<span class="swatches" aria-hidden="true"><span class="swatch" style="background:' + p.brand + '"></span>' +
      '<span class="swatch" style="background:' + p.acc + '"></span><span class="swatch bg" style="background:' + p.bg + '"></span></span>' +
      '<span class="preset-name">' + p.name + '</span></button>';
  }).join('');

  const color = (id, key, name, hint) =>
    '<div class="color-row"><label for="' + id + '" class="color-label"><span class="color-name">' + name + '</span><span class="small">' + hint + '</span></label>' +
    '<div class="color-ctrl"><span class="hex">' + s.theme[key] + '</span>' +
    '<input id="' + id + '" class="color-inp" type="color" value="' + s.theme[key] + '" data-change="setThemeColor" data-key="' + key + '"></div></div>';

  return '<div class="stack">' +
    '<section class="card">' +
    '<div class="card-head"><h2 class="h2 sm">Tu empresa</h2><span class="note">Tu logo y estos datos aparecen en la hoja de cada cotización.</span></div>' +
    '<div class="logo-row"><div class="logo-box">' +
    (co.logo ? '<img src="' + U.esc(co.logo) + '" alt="Logo de tu empresa">' : '<span>' + U.initials(co.name) + '</span>') +
    '</div><div class="logo-actions">' +
    '<input id="logo-file" class="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" data-change="onLogo">' +
    '<label for="logo-file" class="btn2">' + icon('upload') + (co.logo ? 'Cambiar logo' : 'Subir logo') + '</label>' +
    (co.logo ? '<button type="button" class="remove-logo" data-click="removeLogo">Quitar logo</button>' : '') +
    '<span class="small">PNG o JPG, ideal con fondo transparente. Máximo 2 MB.</span>' +
    '</div></div>' +
    (s.logoError ? '<p class="alert" role="alert">' + U.esc(s.logoError) + '</p>' : '') +
    f('co-name', 'name', 'Nombre o razón social', 'placeholder="Tu empresa SpA"') +
    '<div class="grid-2">' + f('co-rut', 'rut', 'RUT', 'placeholder="76.123.456-7"') + f('co-giro', 'giro', 'Giro', 'placeholder="Construcción"') + '</div>' +
    f('co-dir', 'direccion', 'Dirección', 'placeholder="Calle, número, ciudad"') +
    '<div class="grid-2">' + f('co-tel', 'telefono', 'Teléfono', 'type="tel" placeholder="+56 9 …"') + f('co-mail', 'correo', 'Correo', 'type="email" placeholder="contacto@…"') + '</div>' +
    f('co-web', 'web', 'Sitio web', 'placeholder="www.tuempresa.cl"') +
    '<div class="grid-2">' + f('co-resp', 'responsable', 'Responsable', 'placeholder="' + U.esc(s.user.name) + '"') + f('co-cargo', 'cargo', 'Cargo', 'placeholder="Jefe de proyectos"') + '</div>' +
    '<h3 class="h3">Condiciones de la cotización</h3>' +
    '<div class="cond-grid">' + f('co-val', 'validez', 'Validez (días)', 'type="number" min="1" step="1" inputmode="numeric"') + f('co-pago', 'pago', 'Forma de pago', 'placeholder="Ej.: 50% anticipo"') + '</div>' +
    '<div><label class="lbl" for="co-cond">Observaciones (aparecen en cada cotización)</label>' +
    '<textarea id="co-cond" class="inp" rows="3" data-input="setCo" data-key="condiciones">' + U.esc(co.condiciones) + '</textarea></div>' +
    '</section>' +

    '<h2 class="h2 sm colors-title">Colores de la app</h2>' +
    '<section class="pal-preview" aria-label="Vista previa de la paleta" style="background:' + pal.bg + '">' +
    '<div class="pal-head" style="background:' + pal.brand + '"><img src="assets/logo.png" alt="">' +
    '<div class="who-text"><span class="small" style="color:var(--on-brand-3)">Vista previa</span><span class="hero-title" style="font-size:17px;color:#fff">Valoriza Vilos</span></div></div>' +
    '<div class="pal-body"><div class="btn-row" style="gap:8px"><span class="pill best">Mejor precio</span><span class="pill outline">Catálogo</span></div>' +
    '<div class="pal-card"><span class="sub-row-title">COT-0001</span><span class="row-amount acc">$1.234.567</span></div>' +
    '<span class="pal-btn" aria-hidden="true" style="background:' + pal.acc + '">Botón principal</span></div>' +
    '</section>' +

    '<section class="card"><div class="section-head"><h2 class="h2 sm">Paletas</h2><span class="count">' + U.esc(s.theme.name) + '</span></div>' +
    '<div class="presets">' + presets + '</div></section>' +

    '<section class="card gap-14"><div class="card-head"><h2 class="h2 sm">Personalizar</h2>' +
    '<span class="note">Elige tus propios colores. Los tonos claros y oscuros se calculan solos.</span></div>' +
    color('c-acc', 'acc', 'Color principal', 'Botones, enlaces y destacados') +
    color('c-brand', 'brand', 'Color de marca', 'Inicio de sesión, logo y tarjetas oscuras') +
    color('c-bg', 'bg', 'Fondo de la app', 'Color de fondo de las pantallas') +
    (warns.length ? '<p class="warn" role="status">' + warns.join('\n') + '</p>' : '') +
    '</section>' +
    '<button type="button" class="btn2 btn-block" data-click="resetTheme">Restablecer colores originales</button>' +
    '</div>';
};
