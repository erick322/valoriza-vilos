// Punto de entrada: estado, render y delegación de eventos.
(function () {
  const root = document.getElementById('app');
  let state = Store.load();

  function render() {
    if (!state.user && state.screen !== 'login' && state.screen !== 'register') state.screen = 'login';
    Dom.patch(root, Views.app(state));
  }
  const dataChanged = (a, b) => Store.DATA_KEYS.some((k) => a[k] !== b[k]);

  window.App = {
    get state() { return state; },
    // mode: sin valor = cambio del usuario (se guarda y se envía a Supabase);
    // 'remote' = datos que llegan de Supabase (se guardan como ya enviados); 'view' = no se guarda nada.
    setState(patch, mode) {
      const prev = state;
      const p = typeof patch === 'function' ? patch(state) : patch;
      state = Object.assign({}, state, p);
      if (mode !== 'view' && state.user && dataChanged(prev, state)) {
        const ok = Store.save(state, mode === 'remote');
        if (!ok) state.saveError = 'local';
        else if (state.saveError === 'local') state.saveError = '';
        if (mode !== 'remote') Store.pushSoon();
      }
      render();
      if (state.screen !== prev.screen) {
        const main = root.querySelector('.main');
        if (main) main.scrollTop = 0;
      }
      if (state.userMenu && !prev.userMenu) {
        const first = document.getElementById('menu-first');
        if (first) first.focus();
      }
    },
    // '' guardado · 'error' sin conexión con Supabase · 'expired' sesión vencida · 'local' navegador sin espacio
    syncStatus(code) { if (state.saveError !== code) App.setState({ saveError: code }, 'view'); }
  };

  root.addEventListener('input', (e) => {
    const el = e.target;
    const a = el.dataset && el.dataset.input;
    if (a && Actions[a]) Actions[a](el.value, el.dataset);
  });
  root.addEventListener('change', (e) => {
    const el = e.target;
    const a = el.dataset && el.dataset.change;
    if (a && Actions[a]) Actions[a](el.type === 'file' ? el : el.value, el.dataset);
  });
  root.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="#"]');
    if (link) e.preventDefault();
    const el = e.target.closest('[data-click]');
    if (!el || !root.contains(el)) return;
    const a = el.dataset.click;
    if (Actions[a]) Actions[a](el.dataset);
  });
  root.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-submit]');
    if (!f) return;
    e.preventDefault();
    Actions[f.dataset.submit]();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') Actions.escape(); });
  // Otra pestaña guardó: se toman sus datos para no pisarlos en el próximo envío.
  // Si abrió o cerró sesión, se recarga la página para quedar con la misma cuenta (un token renovado solo se toma).
  window.addEventListener('storage', (e) => {
    if (e.key === Cloud.SESSION || e.key === null) {
      const s = Cloud.restore();
      return (s && s.user.id) !== (state.user && state.user.id) ? location.reload() : undefined;
    }
    if (!state.user || e.key !== Store.cacheKey(state.user)) return;
    state = Object.assign({}, state, Store.cached(state.user));
    render();
  });
  window.addEventListener('online', () => { if (state.user && state.saveError === 'error') Store.push(); });

  // Instalación como app: el navegador avisa cuando se puede instalar y se guarda ese aviso para el botón.
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    App.setState({ canInstall: true }, 'view');
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; App.setState({ canInstall: false }, 'view'); });
  App.install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') { installPrompt = null; App.setState({ canInstall: false, userMenu: false }, 'view'); }
  };
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { /* sin modo offline */ });

  render();
  // Vuelta desde un enlace del correo, o sesión ya abierta: se trae lo guardado en Supabase.
  Cloud.fromUrl().then((r) => {
    if (!r) return state.user && Store.pull(state.user);
    if (r.error) return App.setState({ authError: r.error === 'otp_expired' ? 'El enlace del correo expiró. Pide uno nuevo.' : 'No se pudo usar el enlace del correo.' }, 'view');
    Actions.enterSession(r.type === 'recovery' ? 'newPass' : 'list');
  }).catch(() => App.setState({ authError: 'No se pudo usar el enlace del correo. Pide uno nuevo.' }, 'view'));
})();
