// Inicio de sesión, registro y nueva contraseña (con Supabase Auth).
Views.authMessages = function (s, withInfo) {
  let out = '';
  if (s.authError) out += '<p class="alert" role="alert">' + U.esc(s.authError) + '</p>';
  if (withInfo && s.authInfo) out += '<p class="notice" role="status">' + U.esc(s.authInfo) + '</p>';
  return out;
};

// Mientras se espera al servidor, el botón queda desactivado para no enviar dos veces.
Views.submit = function (s, label, busyLabel) {
  return '<button type="submit" class="btnp btn-block"' + (s.authBusy ? ' disabled aria-busy="true"' : '') + '>' + (s.authBusy ? busyLabel : label) + '</button>';
};

Views.regField = function (s, id, key, label, attrs) {
  return '<div><label class="lbl" for="' + id + '">' + label + '</label>' +
    '<input id="' + id + '" class="inp" ' + attrs + ' value="' + U.esc(s.reg[key]) + '" data-input="setReg" data-key="' + key + '"></div>';
};

Views.newPass = function (s) {
  const type = s.showPass ? 'text' : 'password';
  return '<div class="auth scroll">' +
    '<div class="auth-head"><div class="who-text"><span class="auth-eyebrow">Valoriza Vilos</span><h1 class="auth-head-title">Nueva contraseña</h1></div></div>' +
    '<form class="auth-sheet reg" data-submit="submitNewPass" novalidate>' +
    '<p class="lead">Elige una contraseña nueva para ' + U.esc(s.user.email) + '.</p>' +
    Views.regField(s, 'np-pass', 'pass', 'Contraseña nueva', 'type="' + type + '" autocomplete="new-password" placeholder="Mínimo 8 caracteres"') +
    Views.regField(s, 'np-pass2', 'pass2', 'Repite la contraseña', 'type="' + type + '" autocomplete="new-password" placeholder="Repite la contraseña"') +
    Views.authMessages(s, false) +
    Views.submit(s, 'Guardar contraseña', 'Guardando…') +
    '</form></div>';
};

Views.login = function (s) {
  return '<div class="auth scroll">' +
    '<div class="auth-hero">' +
    '<img src="assets/logo.png" alt="Logo" class="auth-logo">' +
    '<span class="auth-title">Valoriza Vilos</span>' +
    '<span class="auth-sub">Cotizaciones, costos y proveedores en tu bolsillo</span>' +
    '</div>' +
    '<form class="auth-sheet" data-submit="submitLogin" novalidate>' +
    '<h1 class="h1">Inicia sesión</h1>' +
    '<div><label class="lbl" for="l-email">Correo</label>' +
    '<input id="l-email" class="inp" type="email" autocomplete="email" placeholder="tu@correo.cl" value="' + U.esc(s.loginEmail) + '" data-input="setLoginEmail"></div>' +
    '<div><label class="lbl" for="l-pass">Contraseña</label><div class="pass-field">' +
    '<input id="l-pass" class="inp" type="' + (s.showPass ? 'text' : 'password') + '" autocomplete="current-password" placeholder="Tu contraseña" value="' + U.esc(s.loginPass) + '" data-input="setLoginPass">' +
    '<button type="button" class="pass-toggle" data-click="togglePass" aria-label="' + (s.showPass ? 'Ocultar contraseña' : 'Mostrar contraseña') + '">' + icon('eye') + '</button>' +
    '</div></div>' +
    Views.authMessages(s, true) +
    Views.submit(s, 'Ingresar', 'Ingresando…') +
    '<button type="button" class="linkbtn" data-click="forgotPass"' + (s.authBusy ? ' disabled' : '') + '>¿Olvidaste tu contraseña?</button>' +
    '<div class="grow"></div>' +
    '<div class="auth-switch"><span>¿No tienes cuenta?</span><button type="button" class="linkbtn strong" data-click="goRegister">Crear cuenta</button></div>' +
    '</form></div>';
};

Views.register = function (s) {
  const type = s.showPass ? 'text' : 'password';
  return '<div class="auth scroll">' +
    '<div class="auth-head">' +
    '<button type="button" class="auth-back" data-click="goLogin" aria-label="Volver al inicio de sesión">' + icon('back') + '</button>' +
    '<div class="who-text"><span class="auth-eyebrow">Valoriza Vilos</span><h1 class="auth-head-title">Crea tu cuenta</h1></div>' +
    '</div>' +
    '<form class="auth-sheet reg" data-submit="submitRegister" novalidate>' +
    '<p class="lead">Cada usuario tiene su propio acceso para crear cotizaciones, análisis de costos y fichas de proveedores.</p>' +
    Views.regField(s, 'r-name', 'name', 'Nombre completo', 'autocomplete="name" placeholder="Tu nombre"') +
    Views.regField(s, 'r-email', 'email', 'Correo', 'type="email" autocomplete="email" placeholder="tu@correo.cl"') +
    Views.regField(s, 'r-pass', 'pass', 'Contraseña', 'type="' + type + '" autocomplete="new-password" placeholder="Mínimo 8 caracteres"') +
    Views.regField(s, 'r-pass2', 'pass2', 'Repite la contraseña', 'type="' + type + '" autocomplete="new-password" placeholder="Repite la contraseña"') +
    Views.authMessages(s, false) +
    Views.submit(s, 'Crear cuenta', 'Creando cuenta…') +
    '<div class="auth-switch"><span>¿Ya tienes cuenta?</span><button type="button" class="linkbtn strong" data-click="goLogin">Inicia sesión</button></div>' +
    '</form></div>';
};
