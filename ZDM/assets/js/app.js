// --- ZM GLOBAL STATE ---
let products = [];
let cart = [];
let wishlist = JSON.parse(localStorage.getItem('zm_wishlist')) || [];
let _focusTrapCleanup = null;
let _lastFocusedElement = null;

// --- UTILIDAD DE SANITIZACIÓN DE INPUTS ---
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML.trim();
}

// --- DOM ELEMENTS ---
const header = document.getElementById('header');
const catalogGrid = document.getElementById('catalog-grid');
const featuredGrid = document.getElementById('featured-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartBadge = document.getElementById('cart-badge');
const checkoutBtn = document.getElementById('checkout-btn');

// Checkout Modals
const checkoutModal = document.getElementById('checkout-modal');
const checkoutModalClose = document.getElementById('checkout-modal-close');
const checkoutWABtn = document.getElementById('checkout-wa-btn');
const checkoutGatewayBtn = document.getElementById('checkout-gateway-btn');

// Gateway Modal
const gatewayModal = document.getElementById('gateway-modal');
const gatewayModalClose = document.getElementById('gateway-modal-close');
const gatewayForm = document.getElementById('gateway-form');
const gatewayTotalPrice = document.getElementById('gateway-total-price');
const paySubmitBtn = document.getElementById('pay-submit-btn');

// Success Modal
const successModal = document.getElementById('success-modal');
const successCloseBtn = document.getElementById('success-close-btn');
const successClientName = document.getElementById('success-client-name');
const successTxId = document.getElementById('success-tx-id');
const successAmount = document.getElementById('success-amount');

// --- 1. INITIALIZE & FETCH PRODUCTS ---
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  fetchProducts();
  setupEventListeners();
  handlePaymentReturnStatus();
});

// Catálogo de respaldo para ejecución local directa (file://) sin servidor local (evita bloqueos de CORS)
// Precios convertidos a pesos chilenos (CLP)
const fallbackProducts = [
  {
    "id": 1,
    "sku": "ZM-GTR-01",
    "nombre": "Guitarra Clásica de Concierto 'Aura'",
    "estado": "Usado (Excelente)",
    "categoria": "Instrumentos",
    "precio": 1250000,
    "stock": 1,
    "descripcion": "Tapa de abeto alemán macizo de grano fino que proporciona una proyección sublime y claridad cristalina. Aros y fondo de palisandro de Madagascar para una riqueza armónica sin igual. Barnizada al estilo tradicional de goma laca para permitir la libre vibración de la madera.",
    "foto": "assets/acoustic_guitar.png",
    "destacado": true
  },
  {
    "id": 2,
    "sku": "ZM-SAX-02",
    "nombre": "Saxofón Alto Laqueado 'Consonante'",
    "estado": "Nuevo",
    "categoria": "Instrumentos",
    "precio": 1890000,
    "stock": 1,
    "descripcion": "Saxofón alto profesional de latón dorado. Llave de Fa# agudo integrada y zapatillas de cuero premium con resonadores metálicos. Ofrece un tono cálido y equilibrado con excelente proyección y afinación precisa en todo su registro.",
    "foto": "assets/saxophone.png",
    "destacado": true
  },
  {
    "id": 3,
    "sku": "ZM-UKU-03",
    "nombre": "Ukelele Soprano de Caoba 'Brisa'",
    "estado": "Nuevo",
    "categoria": "Instrumentos",
    "precio": 125000,
    "stock": 5,
    "descripcion": "Ukelele soprano construido en caoba de alta calidad. Mástil suave y cómodo con diapasón de palisandro. Cuerdas Aquila Nylgut instaladas de fábrica para un tono dulce, brillante y resonante. Ideal para principiantes y músicos en movimiento.",
    "foto": "assets/ukulele.png",
    "destacado": true
  },
  {
    "id": 4,
    "sku": "ZM-ATR-04",
    "nombre": "Atril de Orquesta Ajustable 'Hércules'",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 65000,
    "stock": 8,
    "descripcion": "Atril de partituras metálico reforzado para uso en orquestas y estudios. Bandeja desmontable y altura regulable mediante perillas antideslizantes. Estructura de trípode con patas de goma que brindan una estabilidad máxima en cualquier superficie.",
    "foto": "assets/music_stand.png",
    "destacado": false
  },
  {
    "id": 5,
    "sku": "ZM-AFI-05",
    "nombre": "Afinador de Pinza Cromático 'Aura Clip'",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 15000,
    "stock": 15,
    "descripcion": "Afinador digital cromático tipo clip de alta precisión. Pantalla LCD bicolor retroiluminada de alta visibilidad que gira 360 grados. Detección rápida mediante vibración piezoeléctrica, ideal para guitarras, ukeleles y vientos.",
    "foto": "assets/tuner.png",
    "destacado": false
  },
  {
    "id": 6,
    "sku": "ZM-STR-06",
    "nombre": "Correa de Cuero de Concierto ZM",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 85000,
    "stock": 10,
    "descripcion": "Confeccionada a mano con cuero de curtido vegetal de primera calidad. 7 cm de ancho para distribuir el peso del instrumento de forma óptima durante largas sesiones de ensayo. Costura de hilo encerado en tono dorado y reverso acolchado de gamuza suave.",
    "foto": "assets/leather_strap.png",
    "destacado": false
  },
  {
    "id": 7,
    "sku": "ZM-JAZ-07",
    "nombre": "Bajo Eléctrico Jazz 'Groove Master'",
    "estado": "Usado (Excelente)",
    "categoria": "Instrumentos",
    "precio": 980000,
    "stock": 1,
    "descripcion": "Bajo eléctrico estilo Jazz con cuerpo de aliso y mástil de arce atornillado. Dos cápsulas de bobina simple que ofrecen un tono versátil con graves profundos y agudos cristalinos. Acabado sunburst vintage con herrajes cromados.",
    "foto": "assets/jazz_bass.png",
    "destacado": true
  },
  {
    "id": 8,
    "sku": "ZM-TEL-08",
    "nombre": "Telecaster Vintage '74 Edición Especial",
    "estado": "Usado (Excelente)",
    "categoria": "Instrumentos",
    "precio": 2350000,
    "stock": 1,
    "descripcion": "Guitarra eléctrica Telecaster de 1974 en condición excepcional. Cuerpo de fresno con acabado natural desgatado por el uso que le otorga un carácter único. Cápsulas originales de bobina simple con ese twang inconfundible.",
    "foto": "assets/telecaster_1974.png",
    "destacado": true
  },
  {
    "id": 9,
    "sku": "ZM-FUZ-09",
    "nombre": "Pedal de Distorsión Fuzz 'Magma'",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 78000,
    "stock": 6,
    "descripcion": "Pedal de efecto fuzz analógico con circuito de germanio que entrega un tono cálido, grueso y saturado. Controles de volumen, ganancia y tono para esculpir desde un overdrive suave hasta una distorsión masiva.",
    "foto": "assets/fuzz_pedal.png",
    "destacado": false
  },
  {
    "id": 10,
    "sku": "ZM-AMP-10",
    "nombre": "Amplificador Combo Vintage 'Thunder 30W'",
    "estado": "Usado (Bueno)",
    "categoria": "Instrumentos",
    "precio": 450000,
    "stock": 1,
    "descripcion": "Amplificador combo valvular de 30 watts con parlante de 12 pulgadas. Dos canales con reverberación de resorte. Tono clásico británico con cuerpo robusto recubierto en vinilo negro y rejilla dorada.",
    "foto": "assets/marshall_amplifier.png",
    "destacado": false
  },
  {
    "id": 11,
    "sku": "ZM-CUE-11",
    "nombre": "Set de Cuerdas Nylon para Guitarra Clásica",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 8500,
    "stock": 25,
    "descripcion": "Juego completo de 6 cuerdas de nylon de tensión normal para guitarra clásica. Tres cuerdas agudas de nylon cristalino y tres graves con entorchado de cobre plateado.",
    "foto": "assets/acoustic_guitar.png",
    "destacado": false
  },
  {
    "id": 12,
    "sku": "ZM-CUE-12",
    "nombre": "Set de Cuerdas de Acero para Guitarra Acústica",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 9500,
    "stock": 20,
    "descripcion": "Juego de 6 cuerdas de acero calibre .012-.053 para guitarra acústica folk. Entorchado de bronce fosforado 80/20 que ofrece un brillo cálido y una excelente resonancia.",
    "foto": "assets/acoustic_guitar.png",
    "destacado": false
  },
  {
    "id": 13,
    "sku": "ZM-CAP-13",
    "nombre": "Capo Metálico de Resorte 'Quick Clamp'",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 12000,
    "stock": 18,
    "descripcion": "Cejilla de resorte de acción rápida fabricada en aleación de zinc. Presión uniforme que elimina el zumbido sin desafinar. Compatible con guitarras acústicas, eléctricas, clásicas y ukeleles.",
    "foto": "assets/tuner.png",
    "destacado": false
  },
  {
    "id": 14,
    "sku": "ZM-UÑE-14",
    "nombre": "Pack de 12 Uñetas Variadas ZM",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 5500,
    "stock": 30,
    "descripcion": "Set surtido de 12 plumillas de celuloide en tres grosores: delgada, mediana y gruesa. Variedad de colores vibrantes con el logo ZM grabado. Incluye estuche plástico rígido.",
    "foto": "assets/leather_strap.png",
    "destacado": false
  },
  {
    "id": 15,
    "sku": "ZM-MET-15",
    "nombre": "Metrónomo Digital de Clip 'Tempo Pro'",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 18000,
    "stock": 12,
    "descripcion": "Metrónomo digital compacto con clip de sujeción para atriles. Rango de tempo de 30 a 250 BPM con indicador visual LED y señal sonora ajustable. Subdivisiones de compás incluidas.",
    "foto": "assets/tuner.png",
    "destacado": false
  },
  {
    "id": 16,
    "sku": "ZM-CUA-16",
    "nombre": "Cuaderno de Pentagramas ZM (100 hojas)",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 6500,
    "stock": 20,
    "descripcion": "Cuaderno de pentagramas tamaño carta con 100 hojas de papel blanco de 90g/m². Doce pentagramas por página con espacio para título. Encuadernación espiralada.",
    "foto": "assets/music_stand.png",
    "destacado": false
  },
  {
    "id": 17,
    "sku": "ZM-RES-17",
    "nombre": "Resina Premium para Arco de Violín",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 14000,
    "stock": 10,
    "descripcion": "Resina de colofonia de alta calidad fabricada con resina de pino natural purificada. Proporciona un agarre suave y uniforme al arco. Estuche protector de terciopelo incluido.",
    "foto": "assets/saxophone.png",
    "destacado": false
  },
  {
    "id": 18,
    "sku": "ZM-FUN-18",
    "nombre": "Funda Acolchada para Guitarra Clásica",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 35000,
    "stock": 7,
    "descripcion": "Funda de transporte con acolchado de 10mm de espuma de alta densidad. Exterior de nylon resistente al agua con correas tipo mochila ajustables y bolsillo frontal.",
    "foto": "assets/acoustic_guitar.png",
    "destacado": false
  },
  {
    "id": 19,
    "sku": "ZM-CAÑ-19",
    "nombre": "Caja de 10 Cañas para Saxo Alto (Fuerza 2.5)",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 22000,
    "stock": 8,
    "descripcion": "Caja con 10 cañas de caña natural cortada con precisión para saxofón alto. Fuerza 2.5 ideal para estudiantes intermedios y avanzados. Corte francés clásico.",
    "foto": "assets/saxophone.png",
    "destacado": false
  },
  {
    "id": 20,
    "sku": "ZM-SOL-20",
    "nombre": "Soporte de Piso para Guitarra 'Rock Stand'",
    "estado": "Nuevo",
    "categoria": "Accesorios",
    "precio": 25000,
    "stock": 10,
    "descripcion": "Soporte de piso plegable tipo A para guitarra acústica, eléctrica o bajo. Estructura tubular de acero con recubrimiento de goma suave en todos los puntos de contacto.",
    "foto": "assets/music_stand.png",
    "destacado": false
  }
];

// Fetch products from JSON file (Airtable Sync Mockup)
async function fetchProducts() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Error al cargar catálogo');
    products = await response.json();
  } catch (error) {
    console.warn("Fallo al obtener JSON (CORS/File Protocol). Cargando catálogo local desde memoria...", error);
    products = fallbackProducts;
  }
  
  refreshProductGrids();
}

// --- 2. RENDER CATALOG & FILTERING ---
function renderCatalog(items) {
  if (!catalogGrid) return;
  catalogGrid.innerHTML = '';
  
  if (items.length === 0) {
    catalogGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No se encontraron instrumentos en esta categoría.</p>`;
    return;
  }

  items.forEach(product => {
    const isUnique = product.stock === 1;
    const isAdded = cart.some(item => item.sku === product.sku);
    const isWishlisted = wishlist.includes(product.sku);
    
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-container">
        <span class="product-status-tag ${isUnique ? 'unique' : ''}">${product.estado} ${isUnique ? '(Único)' : ''}</span>
        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-sku="${product.sku}" aria-label="Agregar a lista de deseos">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        <img class="product-image" src="${product.foto}" alt="${product.nombre}" loading="lazy">
      </div>
      <div class="product-content">
        <div class="product-header">
          <h3 class="product-title">${product.nombre}</h3>
          <span class="product-price">$${product.precio.toLocaleString('es-CL')}</span>
        </div>
        <p class="product-description">${product.descripcion}</p>
        <div class="product-actions">
          <button class="btn-card btn-add-cart" data-sku="${product.sku}" ${isAdded && isUnique ? 'disabled' : ''}>
            ${isAdded && isUnique ? 'Agotado' : 'Añadir'}
          </button>
        </div>
      </div>
    `;
    
    // Add event listener to Add to Cart
    card.querySelector('.btn-add-cart').addEventListener('click', (e) => {
      addToCart(product);
      e.target.innerText = isUnique ? 'Agotado' : 'Añadir';
      if (isUnique) e.target.disabled = true;
    });

    // Add event listener to Wishlist Heart button
    const heartBtn = card.querySelector('.wishlist-btn');
    heartBtn.addEventListener('click', () => {
      toggleWishlist(product.sku, heartBtn);
    });

    catalogGrid.appendChild(card);
  });
}

// --- 2b. RENDER NOVEDADES (FEATURED PRODUCTS ON HOME PAGE) ---
function renderFeatured(items) {
  if (!featuredGrid) return;
  featuredGrid.innerHTML = '';

  items.forEach(product => {
    const isUnique = product.stock === 1;
    const isAdded = cart.some(item => item.sku === product.sku);
    const isWishlisted = wishlist.includes(product.sku);

    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-container">
        <span class="product-status-tag ${isUnique ? 'unique' : ''}">${product.estado} ${isUnique ? '(Único)' : ''}</span>
        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-sku="${product.sku}" aria-label="Agregar a lista de deseos">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        <img class="product-image" src="${product.foto}" alt="${product.nombre}" loading="lazy">
      </div>
      <div class="product-content">
        <div class="product-header">
          <h3 class="product-title">${product.nombre}</h3>
          <span class="product-price">$${product.precio.toLocaleString('es-CL')}</span>
        </div>
        <p class="product-description">${product.descripcion}</p>
        <div class="product-actions">
          <button class="btn-card btn-add-cart" data-sku="${product.sku}" ${isAdded && isUnique ? 'disabled' : ''}>
            ${isAdded && isUnique ? 'Agotado' : 'Añadir'}
          </button>
        </div>
      </div>
    `;

    // Add event to Add to Cart
    card.querySelector('.btn-add-cart').addEventListener('click', (e) => {
      addToCart(product);
      e.target.innerText = isUnique ? 'Agotado' : 'Añadir';
      if (isUnique) e.target.disabled = true;
    });

    // Add event to Wishlist
    const heartBtn = card.querySelector('.wishlist-btn');
    heartBtn.addEventListener('click', () => {
      toggleWishlist(product.sku, heartBtn);
    });

    featuredGrid.appendChild(card);
  });
}

// --- 2c. WISHLIST TOGGLE LOGIC ---
function toggleWishlist(sku, heartBtn) {
  const index = wishlist.indexOf(sku);
  if (index > -1) {
    wishlist.splice(index, 1);
    heartBtn.classList.remove('active');
  } else {
    wishlist.push(sku);
    heartBtn.classList.add('active');
  }
  localStorage.setItem('zm_wishlist', JSON.stringify(wishlist));
  
  // Refresh other grids to synchronize wishlist state across different grids
  refreshWishlistUIStates(sku);
}

// Helper to keep heart icon active classes synchronized across grids
function refreshWishlistUIStates(sku) {
  const isWishlisted = wishlist.includes(sku);
  const heartButtons = document.querySelectorAll(`.wishlist-btn[data-sku="${sku}"]`);
  heartButtons.forEach(btn => {
    if (isWishlisted) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Helper to refresh all layout grids
// Helper to refresh all layout grids
// Helper to refresh all layout grids
function refreshProductGrids() {
  if (catalogGrid) {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchInput = document.getElementById('catalog-search-input');
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = products;

    // 1. Filtrar por categoría o colección
    if (categoryParam) {
      const term = categoryParam.toLowerCase();
      if (term === 'guitarras') {
        filtered = filtered.filter(p => 
          p.nombre.toLowerCase().includes('guitarra') || 
          p.nombre.toLowerCase().includes('bajo') || 
          p.nombre.toLowerCase().includes('telecaster')
        );
      } else if (term === 'ukeleles') {
        filtered = filtered.filter(p => p.nombre.toLowerCase().includes('ukelele'));
      } else if (term === 'cuadernos') {
        filtered = filtered.filter(p => p.nombre.toLowerCase().includes('cuaderno'));
      } else if (term === 'accesorios') {
        filtered = filtered.filter(p => 
          p.categoria === 'Accesorios' && !p.nombre.toLowerCase().includes('cuaderno')
        );
      } else {
        filtered = filtered.filter(p => p.categoria.toLowerCase() === term);
      }

      // Desactivamos botones de categoría del catálogo para evitar confusión
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

      // Actualizar el título del catálogo para mostrar el nombre de la colección
      const titleEl = document.querySelector('.catalog-section .section-title');
      if (titleEl) {
        titleEl.textContent = categoryParam;
      }
    } else {
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
      if (filter !== 'all') {
        filtered = filtered.filter(p => p.categoria === filter);
      }

      // Restaurar título de catálogo original
      const titleEl = document.querySelector('.catalog-section .section-title');
      if (titleEl && titleEl.textContent !== 'Todos los Instrumentos') {
        titleEl.textContent = 'Todos los Instrumentos';
      }
    }

    // 2. Filtrar por término de búsqueda (nombre, descripción o SKU)
    if (searchQuery !== '') {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchQuery) || 
        p.descripcion.toLowerCase().includes(searchQuery) || 
        p.sku.toLowerCase().includes(searchQuery)
      );
    }

    renderCatalog(filtered);
  }
  if (featuredGrid) {
    renderFeatured(products.filter(p => p.destacado));
  }
}

// Filtering Handler
filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Limpiar el parámetro de URL para permitir filtrado normal de botones
    const url = new URL(window.location);
    url.searchParams.delete('category');
    window.history.pushState({}, '', url);

    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    refreshProductGrids();
  });
});

// --- 3. SHOPPING CART LOGIC ---
function addToCart(product) {
  const existingItemIndex = cart.findIndex(item => item.sku === product.sku);

  if (existingItemIndex > -1) {
    if (product.stock === 1) {
      // Unique item already in cart
      return;
    }
    cart[existingItemIndex].cantidad += 1;
  } else {
    cart.push({
      sku: product.sku,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: 1,
      imagen: product.foto,
      unico: product.stock === 1
    });
  }

  saveCartToStorage();
  updateCartUI();
  openCart();
}

function removeFromCart(sku) {
  cart = cart.filter(item => item.sku !== sku);
  saveCartToStorage();
  updateCartUI();
  
  // Re-enable add buttons in catalog if applicable
  refreshProductGrids();
}

function updateCartUI() {
  cartItemsContainer.innerHTML = '';
  let total = 0;
  let itemsCount = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p>El silencio es total. Tu carrito está vacío.</p>
      </div>
    `;
    checkoutBtn.disabled = true;
  } else {
    checkoutBtn.disabled = false;
    cart.forEach(item => {
      total += item.precio * item.cantidad;
      itemsCount += item.cantidad;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
        <div class="cart-item-details">
          <span class="cart-item-name">${item.nombre}</span>
          <span class="cart-item-meta">SKU: ${item.sku} ${item.unico ? '(Pieza Única)' : `Cant: ${item.cantidad}`}</span>
          <span class="cart-item-price">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
        </div>
        <div class="cart-item-actions">
          <button class="cart-remove-btn" data-sku="${item.sku}" aria-label="Quitar del carrito">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;

      itemEl.querySelector('.cart-remove-btn').addEventListener('click', () => {
        removeFromCart(item.sku);
      });

      cartItemsContainer.appendChild(itemEl);
    });
  }

  cartTotalPrice.innerText = `$${total.toLocaleString('es-CL')}`;
  gatewayTotalPrice.innerText = `$${total.toLocaleString('es-CL')}`;
  
  // Update nav badge
  cartBadge.innerText = itemsCount;
  if (itemsCount > 0) {
    cartBadge.classList.add('visible');
  } else {
    cartBadge.classList.remove('visible');
  }
}

function openCart() {
  cartOverlay.classList.add('active');
  cartDrawer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close cart drawer
function closeCart() {
  cartOverlay.classList.remove('active');
  cartDrawer.classList.remove('active');
  document.body.style.overflow = '';
}

function loadCartFromStorage() {
  const saved = localStorage.getItem('zm_cart');
  if (saved) {
    try {
      cart = JSON.parse(saved);
      updateCartUI();
    } catch(e) {
      cart = [];
    }
  }
}

function saveCartToStorage() {
  localStorage.setItem('zm_cart', JSON.stringify(cart));
}

// --- 6. CHECKOUT FLOW (HYBRID) ---
function handleCheckout() {
  closeCart();
  openModal(checkoutModal);
}

// Checkout Option 1: WhatsApp link generation
function runWhatsAppCheckout() {
  let message = "¡Hola amigos de ZM! Me gustaría reservar los siguientes artículos de su catálogo:\n\n";
  let total = 0;

  cart.forEach(item => {
    message += `- ${item.cantidad}x ${item.nombre} (SKU: ${item.sku}) - $${item.precio.toLocaleString('es-CL')}\n`;
    total += item.precio * item.cantidad;
  });

  message += `\nTotal Estimado: $${total.toLocaleString('es-CL')}\n\n¿Me podrían indicar cómo coordinar la entrega y el pago? ¡Muchas gracias!`;
  
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=56912345678&text=${encodedText}`;
  
  closeModal(checkoutModal);
  window.open(whatsappUrl, '_blank');
}

// Checkout Option 2: Payment Gateway Redirection (Mercado Pago)
async function runGatewayCheckout() {
  closeModal(checkoutModal);
  
  const loaderEl = document.getElementById('gateway-loader');
  const errorEl = document.getElementById('gateway-error');
  const errorMsgEl = document.getElementById('gateway-error-msg');
  
  if (loaderEl) loaderEl.style.display = 'block';
  if (errorEl) errorEl.style.display = 'none';
  
  openModal(gatewayModal);
  
  try {
    const response = await fetch('checkout.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cart)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ocurrió un error al procesar el pago.');
    }
    
    if (data.init_point) {
      // Redirigir a Mercado Pago
      window.location.href = data.init_point;
    } else {
      throw new Error('No se recibió la URL de pago desde el servidor.');
    }
  } catch (error) {
    console.error('Error en checkout:', error);
    if (loaderEl) loaderEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      if (errorMsgEl) errorMsgEl.innerText = error.message;
    }
  }
}

// Handle returning from payment gateway
function handlePaymentReturnStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  
  if (status === 'success') {
    // Limpiar carrito tras compra exitosa
    cart = [];
    saveCartToStorage();
    updateCartUI();
    
    const paymentId = urlParams.get('payment_id') || `ZM-${Math.floor(100000 + Math.random() * 900000)}`;
    
    if (successModal) {
      if (successClientName) successClientName.innerText = "¡Muchas gracias!";
      if (successAmount) successAmount.innerText = "Pago Aprobado";
      if (successTxId) successTxId.innerText = paymentId;
      openModal(successModal);
    }
    
    // Limpiar parámetros URL sin recargar
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (status === 'failure') {
    alert("El pago fue rechazado o cancelado. Por favor, intenta de nuevo.");
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (status === 'pending') {
    alert("Tu pago está pendiente de aprobación. Procesaremos tu orden apenas se confirme.");
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// --- 7. MODAL UTILITIES (A11y: Focus Trap + ARIA) ---

function lockFocus(modalElement) {
  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])';
  const focusableEls = modalElement.querySelectorAll(focusableSelectors);
  if (focusableEls.length === 0) return null;

  const firstFocusable = focusableEls[0];
  const lastFocusable = focusableEls[focusableEls.length - 1];

  function handleTab(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  modalElement.addEventListener('keydown', handleTab);
  firstFocusable.focus();

  return function cleanup() {
    modalElement.removeEventListener('keydown', handleTab);
  };
}

function openModal(modal) {
  if (!modal) return;
  _lastFocusedElement = document.activeElement;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Activar focus trap tras el repaint
  requestAnimationFrame(() => {
    _focusTrapCleanup = lockFocus(modal);
  });
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  modal.removeAttribute('aria-modal');
  document.body.style.overflow = '';

  if (_focusTrapCleanup) {
    _focusTrapCleanup();
    _focusTrapCleanup = null;
  }
  if (_lastFocusedElement) {
    _lastFocusedElement.focus();
    _lastFocusedElement = null;
  }
}

// --- 8. GLOBAL EVENT LISTENERS SETUP ---
function setupEventListeners() {
  // Search bar input listener
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', refreshProductGrids);
  }

  // Navigation & Cart toggle
  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Checkout triggers
  if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);
  if (checkoutWABtn) checkoutWABtn.addEventListener('click', runWhatsAppCheckout);
  if (checkoutGatewayBtn) checkoutGatewayBtn.addEventListener('click', runGatewayCheckout);
  


  // Newsletter Submit Listener (con validación de consentimiento)
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const privacyCheckbox = document.getElementById('newsletter-privacy');
      if (privacyCheckbox && !privacyCheckbox.checked) {
        alert('Debes aceptar la Política de Privacidad para suscribirte.');
        privacyCheckbox.focus();
        return;
      }
      const name = sanitizeInput(document.getElementById('newsletter-name').value);
      const email = sanitizeInput(document.getElementById('newsletter-email').value);
      if (!name || !email) {
        alert('Por favor, completa todos los campos.');
        return;
      }
      alert(`¡Gracias, ${name}! Te has suscrito exitosamente a las novedades de ZM.`);
      newsletterForm.reset();
    });
  }

  // Close buttons for modals
  if (checkoutModalClose) checkoutModalClose.addEventListener('click', () => closeModal(checkoutModal));
  if (gatewayModalClose) gatewayModalClose.addEventListener('click', () => closeModal(gatewayModal));
  
  const retryBtn = document.getElementById('gateway-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      closeModal(gatewayModal);
    });
  }

  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', () => {
      closeModal(successModal);
    });
  }
  
  // Close modals clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeModal(checkoutModal);
    if (e.target === gatewayModal) closeModal(gatewayModal);
    if (e.target === successModal) closeModal(successModal);
  });

  // Header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Close modals on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeModal(checkoutModal);
      closeModal(gatewayModal);
      closeModal(successModal);
    }
  });
}
