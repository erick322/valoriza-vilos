// Datos fijos (paletas, precios de mercado) y datos de ejemplo iniciales.
window.Data = {
  UNITS: ['m²', 'm³', 'ml', 'unidad', 'global'],
  SUPPLY_UNITS: ['m²', 'm³', 'ml', 'kg', 'saco', 'unidad', 'global'],

  PRESETS: [
    { name: 'Turquesa', acc: '#0e7c80', brand: '#172024', bg: '#f3f5f5' },
    { name: 'Plateado', acc: '#4f5b66', brand: '#1e2329', bg: '#f4f5f6' },
    { name: 'Bosque', acc: '#2f7a4b', brand: '#18241c', bg: '#f3f6f3' },
    { name: 'Azul obra', acc: '#1f5fad', brand: '#141c28', bg: '#f3f5f8' },
    { name: 'Terracota', acc: '#b4532a', brand: '#261a16', bg: '#f7f4f2' },
    { name: 'Grafito', acc: '#3d4a52', brand: '#0f1316', bg: '#eef0f1' }
  ],

  MARKET_CATS: {
    jornal: 'Mano de obra: jornal', tarifa: 'Mano de obra: tarifa', cemento: 'Cemento y morteros',
    hormigon: 'Hormigón', albanileria: 'Albañilería', acero: 'Fierro y mallas', terminaciones: 'Terminaciones'
  },

  MARKET: [
    { cat: 'jornal', name: 'Ayudante / jornal', unit: 'día', min: 30000, max: 40000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Albañil de 1ª', unit: 'día', min: 45000, max: 60000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Maestro mayor', unit: 'día', min: 60000, max: 85000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Carpintero (madera / moldaje)', unit: 'día', min: 50000, max: 70000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Gasfíter', unit: 'día', min: 55000, max: 85000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Eléctrico autorizado SEC', unit: 'día', min: 55000, max: 90000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Pintor', unit: 'día', min: 45000, max: 65000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Ceramista', unit: 'día', min: 55000, max: 80000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Maestro de techumbre', unit: 'día', min: 60000, max: 85000, src: 'Obrahub · pago al trabajador' },
    { cat: 'jornal', name: 'Jefe de obra (capataz)', unit: 'día', min: 75000, max: 110000, src: 'Obrahub · pago al trabajador' },
    { cat: 'tarifa', name: 'Albañil', unit: 'día', min: 70000, max: 100000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Carpintero', unit: 'día', min: 80000, max: 120000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Pintor', unit: 'día', min: 60000, max: 90000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Gasfíter', unit: 'día', min: 85000, max: 120000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Electricista', unit: 'día', min: 90000, max: 130000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Techador', unit: 'día', min: 90000, max: 130000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Maestro de obras', unit: 'día', min: 90000, max: 140000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Albañilería (mano de obra)', unit: 'm²', min: 12000, max: 25000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Pintura (mano de obra)', unit: 'm²', min: 2500, max: 5000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'tarifa', name: 'Techumbre (mano de obra)', unit: 'm²', min: 8000, max: 15000, src: 'ObraMaestra · cobro al cliente' },
    { cat: 'cemento', name: 'Cemento Bío-Bío especial', unit: 'saco 25 kg', min: 4500, max: 5500 },
    { cat: 'cemento', name: 'Cemento Polpaico portland', unit: 'saco 25 kg', min: 4800, max: 5800 },
    { cat: 'cemento', name: 'Cemento Melón gris', unit: 'saco 25 kg', min: 4300, max: 5300 },
    { cat: 'cemento', name: 'Cal hidratada', unit: 'saco 25 kg', min: 3500, max: 4200 },
    { cat: 'cemento', name: 'Mortero predosificado', unit: 'saco 25 kg', min: 4000, max: 4800 },
    { cat: 'hormigon', name: 'Hormigón premezclado H-20', unit: 'm³', min: 85000, max: 105000 },
    { cat: 'hormigon', name: 'Hormigón premezclado H-25', unit: 'm³', min: 95000, max: 115000 },
    { cat: 'hormigon', name: 'Hormigón premezclado H-30', unit: 'm³', min: 105000, max: 130000 },
    { cat: 'hormigon', name: 'Bombeo de hormigón', unit: 'm³', min: 12000, max: 18000 },
    { cat: 'albanileria', name: 'Ladrillo princesa', unit: 'unidad', min: 350, max: 450 },
    { cat: 'albanileria', name: 'Ladrillo fiscal hecho a mano', unit: 'unidad', min: 280, max: 380 },
    { cat: 'albanileria', name: 'Ladrillo princesa multex', unit: 'unidad', min: 400, max: 520 },
    { cat: 'albanileria', name: 'Bloque de hormigón 20×20×40', unit: 'unidad', min: 850, max: 1100 },
    { cat: 'albanileria', name: 'Bloque de hormigón 15×20×40', unit: 'unidad', min: 700, max: 900 },
    { cat: 'acero', name: 'Fierro 8 mm', unit: 'barra 12 m', min: 5500, max: 7000 },
    { cat: 'acero', name: 'Fierro 10 mm', unit: 'barra 12 m', min: 8500, max: 10500 },
    { cat: 'acero', name: 'Fierro 12 mm', unit: 'barra 12 m', min: 12500, max: 15500 },
    { cat: 'acero', name: 'Fierro 16 mm', unit: 'barra 12 m', min: 22000, max: 27000 },
    { cat: 'acero', name: 'Fierro 20 mm', unit: 'barra 12 m', min: 35000, max: 42000 },
    { cat: 'acero', name: 'Malla electrosoldada C-92', unit: 'plancha 6×2,4 m', min: 32000, max: 40000 },
    { cat: 'terminaciones', name: 'Látex muro interior', unit: 'galón', min: 18000, max: 28000 },
    { cat: 'terminaciones', name: 'Esmalte sintético', unit: 'galón', min: 22000, max: 34000 },
    { cat: 'terminaciones', name: 'Cerámica piso 45×45', unit: 'm²', min: 6500, max: 14000 },
    { cat: 'terminaciones', name: 'Porcelanato 60×60', unit: 'm²', min: 12000, max: 22000 },
    { cat: 'terminaciones', name: 'Adhesivo cerámico', unit: 'saco 25 kg', min: 5500, max: 7500 }
  ],

  // Datos guardados del usuario (se persisten en el navegador).
  seed() {
    return {
      theme: Object.assign({}, Data.PRESETS[0]),
      company: {
        name: 'Constructora Ejemplo SpA', giro: 'Construcción y remodelaciones', rut: '76.000.000-0',
        direccion: 'Av. Ejemplo 123, Los Vilos', telefono: '+56 9 0000 0000', correo: 'contacto@ejemplo.cl', web: 'www.ejemplo.cl',
        responsable: '', cargo: 'Jefe de proyectos', validez: '15', pago: '50% anticipo y 50% contra entrega',
        condiciones: 'Valores en pesos chilenos.\nNo incluye trabajos no detallados en esta cotización.', logo: ''
      },
      user: null,
      nextNum: 3,
      supplierPrices: [
        { id: 'sp1', providerId: 'p1', product: 'Hormigón H25', unit: 'm³', price: '98000', date: '2026-10-14' },
        { id: 'sp2', providerId: 'p1', product: 'Cemento saco 25 kg', unit: 'saco', price: '5600', date: '2026-10-14' },
        { id: 'sp3', providerId: 'p1', product: 'Arena gruesa', unit: 'm³', price: '22000', date: '2026-10-14' },
        { id: 'sp4', providerId: 'p2', product: 'Cemento saco 25 kg', unit: 'saco', price: '5200', date: '2026-10-18' },
        { id: 'sp5', providerId: 'p2', product: 'Fierro 10 mm x 6 m', unit: 'unidad', price: '7800', date: '2026-10-18' },
        { id: 'sp6', providerId: 'p2', product: 'Arena gruesa', unit: 'm³', price: '24500', date: '2026-10-18' },
        { id: 'sp7', providerId: 'p2', product: 'Hormigón H25', unit: 'm³', price: '104000', date: '2026-10-18' }
      ],
      providers: [
        { id: 'p1', name: 'Hormigones del Sur (ejemplo)', rut: '', rubro: 'Hormigón y áridos', contacto: '[NOMBRE CONTACTO]', telefono: '', correo: '', direccion: '', notas: '' },
        { id: 'p2', name: 'Ferretería Central (ejemplo)', rut: '', rubro: 'Ferretería y fijaciones', contacto: '', telefono: '', correo: '', direccion: '', notas: '' },
        { id: 'p3', name: 'Transportes Patagonia (ejemplo)', rut: '', rubro: 'Flete y transporte', contacto: '', telefono: '', correo: '', direccion: '', notas: '' }
      ],
      zones: [
        { id: 'z1', name: 'Zona Centro', pct: '0' },
        { id: 'z2', name: 'Zona Norte', pct: '10' },
        { id: 'z3', name: 'Zona Sur', pct: '8' },
        { id: 'z4', name: 'Zona Austral', pct: '15' }
      ],
      costs: [
        { id: 201, name: 'Loza de concreto', unit: 'm²', zoneId: 'z4', providerId: 'p1', materiales: '28000', flete: '2500', transporte: '1800', depreciacion: '1200', gestion: '900', utilidad: '20' }
      ],
      catalog: [
        { id: 1, name: 'Pintura muro interior', unit: 'm²', price: '4500' },
        { id: 2, name: 'Instalación cerámica de piso', unit: 'm²', price: '12900' },
        { id: 3, name: 'Guardapolvo MDF', unit: 'ml', price: '3200' },
        { id: 4, name: 'Arriendo de andamio', unit: 'unidad', price: '8000' },
        { id: 5, name: 'Instalación de puerta', unit: 'unidad', price: '45000' }
      ],
      quotes: [
        { id: 101, num: 1, client: 'Cliente de ejemplo', email: '', date: '2026-10-20', items: [
          { name: 'Pintura muro interior', unit: 'm²', qty: '120', days: '1', price: '4500' },
          { name: 'Arriendo de andamio', unit: 'unidad', qty: '2', days: '5', price: '8000' }
        ] },
        { id: 102, num: 2, client: 'Otro cliente', email: '', date: '2026-10-22', items: [
          { name: 'Instalación cerámica de piso', unit: 'm²', qty: '35', days: '1', price: '12900' },
          { name: 'Guardapolvo MDF', unit: 'ml', qty: '28', days: '1', price: '3200' }
        ] }
      ]
    };
  },

  // Estado de interfaz: no se persiste.
  ui() {
    return {
      screen: 'login', picker: false, userMenu: false,
      loginEmail: '', loginPass: '', showPass: false, authError: '', authInfo: '', authBusy: false, saveError: '',
      reg: { name: '', email: '', pass: '', pass2: '' },
      currentId: null, currentCostId: null, currentProviderId: null, savedCostId: null,
      search: '', provSearch: '', provView: 'list', cmpSearch: '',
      marketCat: 'all', marketSearch: '', marketZone: 'z1',
      draft: { name: '', unit: 'm²', price: '' },
      logoError: '', sheetFit: true
    };
  }
};
