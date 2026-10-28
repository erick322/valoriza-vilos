// Conexión con Supabase: cuentas (Auth) y los datos de cada usuario (tabla app_data, protegida por RLS).
// Se usa la API REST directamente; la clave publicable puede ir en el navegador.
window.Cloud = {
  URL: 'https://jrmqekojefcoanpzoxku.supabase.co',
  KEY: 'sb_publishable_blu7lebnLy40mnSHTtFVvA_iXFq5kWD',
  SESSION: 'valoriza-vilos:session',
  session: null,

  async call(path, opts, auth) {
    const headers = Object.assign({ apikey: Cloud.KEY, 'Content-Type': 'application/json' }, opts.headers);
    if (auth) headers.Authorization = 'Bearer ' + (await Cloud.token());
    let res;
    try { res = await fetch(Cloud.URL + path, Object.assign({}, opts, { headers: headers })); } catch (e) { throw Object.assign(new Error('offline'), { code: 'offline' }); }
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) throw Object.assign(new Error((body && (body.msg || body.message || body.error_description)) || 'Error ' + res.status), { status: res.status, code: body && (body.error_code || body.code) });
    return body;
  },
  post(path, body, auth, headers) { return Cloud.call(path, { method: 'POST', body: JSON.stringify(body), headers: headers }, auth); },

  // Guarda la sesión (tokens y datos de la cuenta) en el navegador, como hace la librería oficial.
  keep(t) {
    if (t) {
      const u = t.user || Cloud.session.user;
      Cloud.session = {
        access_token: t.access_token, refresh_token: t.refresh_token,
        expires_at: t.expires_at || Math.floor(Date.now() / 1000) + Number(t.expires_in || 3600),
        user: { id: u.id, email: u.email, name: (u.user_metadata && u.user_metadata.name) || u.name || '' }
      };
      localStorage.setItem(Cloud.SESSION, JSON.stringify(Cloud.session));
    } else {
      Cloud.session = null;
      localStorage.removeItem(Cloud.SESSION);
    }
  },
  restore() {
    try { Cloud.session = JSON.parse(localStorage.getItem(Cloud.SESSION) || 'null'); } catch (e) { Cloud.session = null; }
    return Cloud.session;
  },
  async token() {
    const s = Cloud.session;
    if (!s) throw Object.assign(new Error('Sin sesión'), { code: 'no_session' });
    if (s.expires_at - 60 < Date.now() / 1000) {
      try { Cloud.keep(await Cloud.post('/auth/v1/token?grant_type=refresh_token', { refresh_token: s.refresh_token })); } catch (e) {
        if (e.code !== 'offline') { Cloud.keep(null); e.code = 'no_session'; }
        throw e;
      }
    }
    return Cloud.session.access_token;
  },

  // Vuelta desde un enlace del correo (confirmar cuenta o recuperar contraseña): los tokens vienen en el #.
  async fromUrl() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (!h.get('access_token') && !h.get('error')) return null;
    history.replaceState(null, '', location.pathname + location.search);
    if (h.get('error')) return { error: h.get('error_code') || h.get('error') };
    const t = { access_token: h.get('access_token'), refresh_token: h.get('refresh_token'), expires_at: Number(h.get('expires_at')) || 0, expires_in: h.get('expires_in') };
    t.user = await Cloud.call('/auth/v1/user', { headers: { Authorization: 'Bearer ' + t.access_token } });
    Cloud.keep(t);
    return { type: h.get('type') };
  },
  back() { return location.origin + location.pathname; },

  async signIn(email, password) { Cloud.keep(await Cloud.post('/auth/v1/token?grant_type=password', { email: email, password: password })); },
  // Si el proyecto pide confirmar el correo, no hay sesión hasta que la persona abre el enlace.
  async signUp(email, password, name) {
    const r = await Cloud.post('/auth/v1/signup?redirect_to=' + encodeURIComponent(Cloud.back()), { email: email, password: password, data: { name: name } });
    if (r.access_token) Cloud.keep(r);
    return !!r.access_token;
  },
  recover(email) { return Cloud.post('/auth/v1/recover?redirect_to=' + encodeURIComponent(Cloud.back()), { email: email }); },
  setPassword(password) { return Cloud.call('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password: password }) }, true); },
  async signOut() {
    try { await Cloud.post('/auth/v1/logout', {}, true); } catch (e) { /* sin conexión: igual se cierra aquí */ }
    Cloud.keep(null);
  },

  async load() {
    const rows = await Cloud.call('/rest/v1/app_data?select=data', { method: 'GET' }, true);
    return rows.length ? rows[0].data : null;
  },
  save(data) {
    return Cloud.post('/rest/v1/app_data?on_conflict=user_id', { user_id: Cloud.session.user.id, data: data }, true,
      { Prefer: 'resolution=merge-duplicates,return=minimal' });
  }
};
