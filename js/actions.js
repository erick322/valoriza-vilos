// Acciones de la interfaz. Los campos llaman (valor, dataset); los botones llaman (dataset).
(function () {
  const set = (p, mode) => App.setState(p, mode);
  const st = () => App.state;
  const byId = (id) => (x) => String(x.id) === String(id);
  const notId = (id) => (x) => String(x.id) !== String(id);
  const patchIn = (list, id, key, val) => list.map((x) => (String(x.id) === String(id) ? Object.assign({}, x, { [key]: val }) : x));
  const setQ = (fn) => set((s) => ({ quotes: s.quotes.map((q) => (q.id === s.currentId ? fn(q) : q)) }));
  const nav = (screen) => () => set({ screen: screen, picker: false, userMenu: false });
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Mensajes de Supabase Auth en palabras simples.
  const authMsg = (e) => ({
    invalid_credentials: 'Correo o contraseña incorrectos.',
    email_not_confirmed: 'Confirma tu correo antes de entrar: abre el enlace que te enviamos.',
    user_already_exists: 'Ya existe una cuenta con ese correo.',
    email_exists: 'Ya existe una cuenta con ese correo.',
    weak_password: 'La contraseña es muy débil. Usa al menos 8 caracteres, con letras y números.',
    same_password: 'La nueva contraseña debe ser distinta de la anterior.',
    over_email_send_rate_limit: 'Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo.',
    over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
    offline: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.'
  })[e.code] || 'No se pudo completar: ' + e.message;
  // Envía al servidor sin permitir doble clic, y muestra el error si falla.
  const busy = async (fn) => {
    if (st().authBusy) return;
    set({ authBusy: true, authError: '', authInfo: '' }, 'view');
    try { await fn(); } catch (e) { set({ authError: authMsg(e) }, 'view'); }
    set({ authBusy: false }, 'view');
  };
  const passErr = (r) => (r.pass.length < 8 ? 'La contraseña debe tener al menos 8 caracteres.' : (r.pass !== r.pass2 ? 'Las contraseñas no coinciden.' : ''));

  window.Actions = {
    // Acceso (Supabase Auth)
    setLoginEmail: (v) => set({ loginEmail: v, authError: '' }),
    setLoginPass: (v) => set({ loginPass: v, authError: '' }),
    togglePass: () => set((s) => ({ showPass: !s.showPass })),
    goRegister: () => set({ screen: 'register', authError: '', authInfo: '' }),
    goLogin: () => set({ screen: 'login', authError: '', authInfo: '' }),
    setReg: (v, d) => set((s) => ({ reg: Object.assign({}, s.reg, { [d.key]: v }), authError: '' })),
    // Abre la sesión de Supabase con la copia local de esa cuenta y luego trae lo guardado en la nube.
    enterSession(screen) {
      const u = Cloud.session.user;
      set(Object.assign(Data.ui(), Store.cached(u), { user: u, screen: screen || 'list' }), 'view');
      Store.pull(u);
    },
    submitLogin() {
      const s = st();
      const email = s.loginEmail.trim().toLowerCase();
      if (!email || !s.loginPass) return set({ authError: 'Ingresa tu correo y tu contraseña.', authInfo: '' });
      return busy(async () => {
        await Cloud.signIn(email, s.loginPass);
        Actions.enterSession();
      });
    },
    forgotPass() {
      const email = st().loginEmail.trim().toLowerCase();
      if (!EMAIL.test(email)) return set({ authError: 'Escribe tu correo arriba para recuperar la contraseña.', authInfo: '' });
      return busy(async () => {
        await Cloud.recover(email);
        set({ authInfo: 'Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña.' }, 'view');
      });
    },
    submitRegister() {
      const r = st().reg;
      const email = r.email.trim().toLowerCase();
      const err = !r.name.trim() ? 'Escribe tu nombre.' : (!EMAIL.test(email) ? 'Escribe un correo válido.' : passErr(r));
      if (err) return set({ authError: err });
      return busy(async () => {
        if (await Cloud.signUp(email, r.pass, r.name.trim())) return Actions.enterSession();
        set({ screen: 'login', loginEmail: email, reg: Data.ui().reg, authInfo: 'Te enviamos un correo a ' + email + '. Ábrelo para confirmar tu cuenta y luego inicia sesión.' }, 'view');
      });
    },
    // Vuelta desde el correo de recuperación: la sesión ya está abierta, falta la nueva contraseña.
    submitNewPass() {
      const err = passErr(st().reg);
      if (err) return set({ authError: err });
      return busy(async () => {
        await Cloud.setPassword(st().reg.pass);
        set({ screen: 'list', reg: Data.ui().reg }, 'view');
      });
    },
    toggleUserMenu: () => set((s) => ({ userMenu: !s.userMenu })),
    async logout() {
      // Se envía lo pendiente antes de salir; si no hay conexión, se avisa para no perderlo.
      if (st().saveError || Store.timer) await Store.push();
      const pending = !!st().saveError;
      if (pending && !window.confirm('Hay cambios que aún no se guardan en la nube. Si sales, quedan solo en este navegador. ¿Salir igual?')) return;
      if (!pending) Store.forget(st().user);
      await Cloud.signOut();
      set(Object.assign(Data.seed(), Data.ui()), 'view');
    },
    escape() {
      const s = st();
      if (s.userMenu) set({ userMenu: false });
      else if (s.picker) set({ picker: false });
    },

    // Navegación
    goList: nav('list'), goCosts: nav('costs'), goMarket: nav('market'), goProviders: nav('providers'),
    goCatalog: nav('catalog'), goTheme: nav('theme'), goPreview: nav('preview'), goEdit: nav('edit'),
    goBack() {
      const back = { preview: 'edit', costEdit: 'costs', providerEdit: 'providers' };
      set({ screen: back[st().screen] || 'list', picker: false });
    },

    // Cotizaciones
    setSearch: (v) => set({ search: v }),
    openQuote: (d) => set({ screen: 'edit', currentId: Number(d.id), picker: false }),
    newQuote() {
      const id = Date.now();
      set((s) => ({
        quotes: s.quotes.concat([{ id: id, num: s.nextNum, client: '', email: '', date: U.today(), items: [] }]),
        nextNum: s.nextNum + 1, currentId: id, screen: 'edit', search: ''
      }));
    },
    setQuoteField: (v, d) => setQ((q) => Object.assign({}, q, { [d.key]: v })),
    setItem: (v, d) => setQ((q) => Object.assign({}, q, {
      items: q.items.map((it, j) => (j === Number(d.idx) ? Object.assign({}, it, { [d.key]: v }) : it))
    })),
    removeItem: (d) => setQ((q) => Object.assign({}, q, { items: q.items.filter((_, j) => j !== Number(d.idx)) })),
    addBlank: () => setQ((q) => Object.assign({}, q, { items: q.items.concat([{ name: '', unit: 'unidad', qty: '1', days: '1', price: '' }]) })),
    openPicker: () => set({ picker: true }),
    closePicker: () => set({ picker: false }),
    pickCatalog(d) {
      const c = st().catalog.find(byId(d.id));
      if (!c) return;
      setQ((q) => Object.assign({}, q, { items: q.items.concat([{ name: c.name, unit: c.unit, qty: '1', days: '1', price: c.price }]) }));
      set({ picker: false });
    },
    deleteQuote() {
      if (!window.confirm('¿Eliminar esta cotización? No se puede deshacer.')) return;
      set((s) => ({ quotes: s.quotes.filter((q) => q.id !== s.currentId), currentId: null, screen: 'list' }));
    },
    toggleZoom: () => set((s) => ({ sheetFit: !s.sheetFit })),

    // Costos
    openCost: (d) => set({ screen: 'costEdit', currentCostId: Number(d.id), savedCostId: null }),
    newCost() {
      const id = Date.now();
      set((s) => ({
        costs: s.costs.concat([{ id: id, name: '', unit: 'm²', zoneId: s.zones.length ? s.zones[0].id : '', providerId: '', materiales: '', flete: '', transporte: '', depreciacion: '', gestion: '', utilidad: '' }]),
        currentCostId: id, screen: 'costEdit', savedCostId: null
      }));
    },
    setCost: (v, d) => set((s) => ({ savedCostId: null, costs: patchIn(s.costs, s.currentCostId, d.key, v) })),
    deleteCost() {
      if (!window.confirm('¿Eliminar este análisis de costo?')) return;
      set((s) => ({ costs: s.costs.filter((k) => k.id !== s.currentCostId), currentCostId: null, screen: 'costs' }));
    },
    saveCostToCatalog() {
      const s = st();
      const k = Model.currentCost(s);
      if (!k) return;
      const price = String(Math.round(Model.costCalc(k, s.zones).sugerido));
      const name = k.name || 'Sin nombre';
      const exists = s.catalog.some((c) => c.costId === k.id);
      const catalog = exists
        ? s.catalog.map((c) => (c.costId === k.id ? Object.assign({}, c, { name: name, unit: k.unit, price: price }) : c))
        : [{ id: Date.now(), costId: k.id, name: name, unit: k.unit, price: price }].concat(s.catalog);
      set({ catalog: catalog, savedCostId: k.id });
    },
    setZone: (v, d) => set((s) => ({ zones: patchIn(s.zones, d.id, d.key, v) })),
    removeZone(d) {
      const s = st();
      const used = s.costs.filter((k) => String(k.zoneId) === String(d.id)).length;
      const zones = s.zones.filter(notId(d.id));
      const to = zones.length ? zones[0] : null;
      const msg = used
        ? '¿Eliminar esta zona? ' + U.plural(used, 'análisis de costo pasa', 'análisis de costo pasan') + ' a ' + (to ? '«' + to.name + '»' : 'sin zona (0%)') + '.'
        : '¿Eliminar esta zona?';
      if (!window.confirm(msg)) return;
      const toId = to ? to.id : '';
      set({
        zones: zones,
        costs: s.costs.map((k) => (String(k.zoneId) === String(d.id) ? Object.assign({}, k, { zoneId: toId }) : k)),
        marketZone: String(s.marketZone) === String(d.id) ? toId : s.marketZone
      });
    },
    addZone: () => set((s) => ({ zones: s.zones.concat([{ id: 'z' + Date.now(), name: 'Nueva zona', pct: '0' }]) })),

    // Proveedores
    setProvView: (d) => set({ provView: d.view }),
    setProvSearch: (v) => set({ provSearch: v }),
    setCmpSearch: (v) => set({ cmpSearch: v }),
    openProvider: (d) => set({ screen: 'providerEdit', currentProviderId: d.id }),
    newProvider() {
      const id = 'p' + Date.now();
      set((s) => ({
        providers: s.providers.concat([{ id: id, name: '', rut: '', rubro: '', contacto: '', telefono: '', correo: '', direccion: '', notas: '' }]),
        currentProviderId: id, screen: 'providerEdit', provSearch: ''
      }));
    },
    setProv: (v, d) => set((s) => ({ providers: patchIn(s.providers, s.currentProviderId, d.key, v) })),
    deleteProvider() {
      if (!window.confirm('¿Eliminar este proveedor y sus precios cotizados?')) return;
      set((s) => {
        const id = s.currentProviderId;
        return {
          providers: s.providers.filter((p) => p.id !== id),
          supplierPrices: s.supplierPrices.filter((x) => x.providerId !== id),
          costs: s.costs.map((k) => (k.providerId === id ? Object.assign({}, k, { providerId: '' }) : k)),
          currentProviderId: null, screen: 'providers'
        };
      });
    },
    addSupplierPrice: () => set((s) => ({
      supplierPrices: s.supplierPrices.concat([{ id: 'sp' + Date.now(), providerId: s.currentProviderId, product: '', unit: 'unidad', price: '', date: U.today() }])
    })),
    setSP: (v, d) => set((s) => ({ supplierPrices: patchIn(s.supplierPrices, d.id, d.key, v) })),
    removeSP: (d) => set((s) => ({ supplierPrices: s.supplierPrices.filter(notId(d.id)) })),

    // Mercado
    setMarketSearch: (v) => set({ marketSearch: v }),
    setMarketZone: (v) => set({ marketZone: v }),
    setMarketCat: (d) => set({ marketCat: d.id }),
    addMarketItem(d) {
      const x = Views.marketItems(st())[Number(d.idx)];
      if (!x || x.inCat) return;
      set((s) => ({ catalog: [{ id: Date.now(), name: x.cName, unit: x.cUnit, price: String(x.avg) }].concat(s.catalog) }));
    },

    // Diseño y empresa
    setCo: (v, d) => set((s) => ({ company: Object.assign({}, s.company, { [d.key]: v }) })),
    onLogo(input) {
      const f = input.files && input.files[0];
      input.value = '';
      if (!f) return;
      if (!/^image\//.test(f.type)) return set({ logoError: 'El archivo debe ser una imagen (PNG, JPG, WEBP o SVG).' });
      if (f.size > 2 * 1024 * 1024) return set({ logoError: 'El logo pesa más de 2 MB. Usa una imagen más liviana.' });
      const setLogo = (url) => set((s) => ({ company: Object.assign({}, s.company, { logo: url }), logoError: '' }));
      const r = new FileReader();
      r.onload = () => {
        if (f.type === 'image/svg+xml') return setLogo(r.result);
        // Se achica a 400 px como máximo: el logo se guarda con cada cambio y uno pesado hace lenta la app.
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, 400 / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k);
          c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          setLogo(c.toDataURL('image/png'));
        };
        img.onerror = () => set({ logoError: 'No se pudo leer la imagen. Prueba con otro archivo.' });
        img.src = r.result;
      };
      r.readAsDataURL(f);
    },
    removeLogo: () => set((s) => ({ company: Object.assign({}, s.company, { logo: '' }) })),
    pickPreset: (d) => set({ theme: Object.assign({}, Data.PRESETS[Number(d.idx)]) }),
    setThemeColor: (v, d) => set((s) => ({ theme: Object.assign({}, s.theme, { [d.key]: v, name: 'Personalizada' }) })),
    resetTheme: () => set({ theme: Object.assign({}, Data.PRESETS[0]) }),

    // Catálogo
    setDraft: (v, d) => set((s) => ({ draft: Object.assign({}, s.draft, { [d.key]: v }) })),
    addToCatalog() {
      const d = st().draft;
      if (!d.name.trim()) return;
      set((s) => ({
        catalog: [{ id: Date.now(), name: d.name.trim(), unit: d.unit, price: d.price || '0' }].concat(s.catalog),
        draft: { name: '', unit: d.unit, price: '' }
      }));
    },
    setCat: (v, d) => set((s) => ({ catalog: patchIn(s.catalog, d.id, d.key, v) })),
    removeCat: (d) => set((s) => ({ catalog: s.catalog.filter(notId(d.id)) }))
  };
})();
