// Datos de cada cuenta: la copia buena está en Supabase (Cloud); el navegador guarda una copia
// para abrir al instante, sin conexión y entre pestañas. Solo guarda los datos, no el estado de pantalla.
window.Store = {
  KEY: 'valoriza-vilos:v2',
  DATA_KEYS: ['theme', 'company', 'nextNum', 'supplierPrices', 'providers', 'zones', 'costs', 'catalog', 'quotes'],
  timer: null,

  cacheKey(user) { return Store.KEY + ':' + user.id; },
  get(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; /* bloqueado o dañado */ }
  },
  put(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; /* sin espacio o bloqueado */ }
  },
  pick(obj, fallback) {
    const out = {};
    Store.DATA_KEYS.forEach((k) => { out[k] = obj && obj[k] !== undefined ? obj[k] : fallback[k]; });
    return out;
  },

  // Copia local de la cuenta, o los datos de ejemplo si es la primera vez en este navegador.
  // Al salir, la copia local se borra para que quien use el navegador después no la lea.
  forget(user) { try { localStorage.removeItem(Store.cacheKey(user)); } catch (e) { /* bloqueado */ } },
  cached(user) { const c = Store.get(Store.cacheKey(user)); return Store.pick(c && c.data, Data.seed()); },

  load() {
    const state = Object.assign(Data.seed(), Data.ui());
    const s = Cloud.restore();
    if (s) Object.assign(state, Store.cached(s.user), { user: s.user, screen: 'list' });
    return state;
  },

  // synced: false marca cambios que aún no llegan a Supabase. Devuelve false si el navegador no dejó guardar.
  save(state, synced) {
    return Store.put(Store.cacheKey(state.user), { data: Store.pick(state, {}), synced: !!synced });
  },

  // rev cuenta los cambios locales: si se escribió algo mientras se enviaba, queda pendiente para el próximo envío.
  rev: 0,
  pushSoon() { Store.rev++; clearTimeout(Store.timer); Store.timer = setTimeout(Store.push, 800); },
  async push() {
    clearTimeout(Store.timer);
    const s = App.state, rev = Store.rev;
    if (!s.user) return;
    try {
      await Cloud.save(Store.pick(s, {}));
      if (rev === Store.rev && App.state.user) Store.save(App.state, true);
      App.syncStatus('');
    } catch (e) {
      App.syncStatus(e.code === 'no_session' ? 'expired' : 'error');
    }
  },

  // Al entrar: lo pendiente en este navegador se envía; si no hay nada pendiente, manda lo de Supabase.
  async pull(user) {
    try {
      const c = Store.get(Store.cacheKey(user));
      if (c && c.synced === false) return Store.push();
      const remote = await Cloud.load();
      if (remote) return App.setState(Store.pick(remote, Data.seed()), true);
      // Cuenta nueva en Supabase: se sube lo que hubiera en este navegador de la versión local, o los ejemplos.
      const local = Store.get('valoriza-vilos:v1:' + user.email);
      App.setState(Store.pick(local, Data.seed()));
    } catch (e) {
      App.syncStatus(e.code === 'no_session' ? 'expired' : 'error');
    }
  }
};
