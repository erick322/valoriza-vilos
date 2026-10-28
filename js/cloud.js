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

  // Enlaces del correo con PKCE: al pedir el correo se guarda aquí un secreto (verifier) y se envía solo su hash.
  // El enlace vuelve con ?code= y Supabase entrega la sesión solo si se presenta ese secreto, así que un enlace
  // armado por otra persona no puede abrir su cuenta en este navegador.
  PKCE: 'valoriza-vilos:pkce',
  async challenge(type) {
    const b64 = (bytes) => btoa(String.fromCharCode.apply(null, new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const verifier = b64(crypto.getRandomValues(new Uint8Array(32)));
    localStorage.setItem(Cloud.PKCE, JSON.stringify({ verifier: verifier, type: type }));
    return { code_challenge: b64(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))), code_challenge_method: 's256' };
  },

  // Vuelta desde un enlace del correo (confirmar cuenta o recuperar contraseña).
  async fromUrl() {
    const q = new URLSearchParams(location.search);
    const h = new URLSearchParams(location.hash.slice(1));
    const code = q.get('code');
    const error = q.get('error_code') || q.get('error') || h.get('error_code') || h.get('error');
    // Los tokens sueltos en el # (flujo antiguo) se descartan sin usarlos: pueden venir de otra cuenta.
    if (!code && !error && !h.get('access_token')) return null;
    history.replaceState(null, '', location.pathname);
    if (error) return { error: error };
    const pending = JSON.parse(localStorage.getItem(Cloud.PKCE) || 'null');
    if (!code || !pending) return { error: 'foreign_link' };
    localStorage.removeItem(Cloud.PKCE);
    Cloud.keep(await Cloud.post('/auth/v1/token?grant_type=pkce', { auth_code: code, code_verifier: pending.verifier }));
    return { type: pending.type };
  },
  back() { return location.origin + location.pathname; },

  async signIn(email, password) { Cloud.keep(await Cloud.post('/auth/v1/token?grant_type=password', { email: email, password: password })); },
  // Si el proyecto pide confirmar el correo, no hay sesión hasta que la persona abre el enlace.
  async signUp(email, password, name) {
    const body = Object.assign({ email: email, password: password, data: { name: name } }, await Cloud.challenge('signup'));
    const r = await Cloud.post('/auth/v1/signup?redirect_to=' + encodeURIComponent(Cloud.back()), body);
    if (r.access_token) { localStorage.removeItem(Cloud.PKCE); Cloud.keep(r); }
    return !!r.access_token;
  },
  async recover(email) {
    return Cloud.post('/auth/v1/recover?redirect_to=' + encodeURIComponent(Cloud.back()), Object.assign({ email: email }, await Cloud.challenge('recovery')));
  },
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
