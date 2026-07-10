const GOOGLE_SHEETS_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUOMeSYCWJOMiJ0vayMxxYTf2sflOyZs4y7pxEwNBVIxUhUGHS-m73C4iC90pnTTnNYg/exec";
const AIRTABLE_CARTA_API_URL = "https://script.google.com/macros/s/AKfycbybUGkF12LJ9rUi6mw77LoKxmmeuJhPOfAdqNDWo9BEhN9_TTK-nOyPlHPD2EScCI-r/exec";

// Catálogo de respaldo para ejecución local directa (file://) sin servidor local (evita bloqueos de CORS)
const fallbackPlatos = [
    {
        "id": 1,
        "nombre": "Piqueo mi Perú",
        "precio": 29990,
        "categoria": "calientes",
        "reseña": "Mariscos seleccionados marinados al carbón con la fuerza y aroma del fuego directo.",
        "img": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600",
        "subcategoria": "piqueos_calientes"
    },
    {
        "id": 2,
        "nombre": "Trio marino",
        "precio": 19900,
        "categoria": "calientes",
        "reseña": "Una imperdible trilogía de frescura marina: ceviche clásico, chicharrón de pescado y causa.",
        "img": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600",
        "subcategoria": "piqueos_calientes"
    },
    {
        "id": 75,
        "nombre": "Causa Fusión",
        "precio": 14900,
        "categoria": "frios",
        "reseña": "Masa de papa amarilla aliñada con ají amarillo y limón, rellena de mariscos acevichados.",
        "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
        "subcategoria": "causas"
    },
    {
        "id": 95,
        "nombre": "Ceviche Mixto",
        "precio": 15900,
        "categoria": "frios",
        "reseña": "Pescado fresco, calamar, camarón y pulpo marinados en limón sutil con ají limo.",
        "img": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600",
        "subcategoria": "ceviches"
    },
    {
        "id": 159,
        "nombre": "Lomo Saltado",
        "precio": 15900,
        "categoria": "calientes",
        "reseña": "Dados de lomo liso flameados al wok con cebolla morada, tomate, papas fritas y arroz.",
        "img": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600",
        "subcategoria": "carnes"
    },
    {
        "id": 350,
        "nombre": "Suspiro Limeño",
        "precio": 4900,
        "categoria": "postres",
        "reseña": "Clásico manjar blanco peruano coronado con merengue al oporto y canela.",
        "img": "https://images.unsplash.com/photo-1579372786545-d24232daf58c?q=80&w=600",
        "subcategoria": "postres"
    },
    {
        "id": 400,
        "nombre": "Pisco Sour Peruano",
        "precio": 5900,
        "categoria": "bar",
        "reseña": "El trago bandera del Perú: pisco quebranta, limón sutil, jarabe de goma y clara de huevo.",
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600",
        "subcategoria": "pisco_sour"
    }
];

let platosCarta = [];

async function cargarCartaLocal() {
    try {
        const response = await fetch('carta.json');
        if (!response.ok) throw new Error('Error al cargar la carta');
        platosCarta = await response.json();
        console.log(`Cargados ${platosCarta.length} platos desde carta.json`);
    } catch (error) {
        console.warn("Fallo al obtener carta.json (CORS/File Protocol). Cargando carta de respaldo desde memoria...", error);
        platosCarta = fallbackPlatos;
    }
}

let carrito = [];
try {
    const cachedCart = localStorage.getItem('tizoon_cart_cache');
    if (cachedCart) {
        carrito = JSON.parse(cachedCart);
    }
} catch (e) {
    console.error("Error al inicializar el carrito desde localStorage:", e);
}
let modoEntrega = 'takeaway';
const costoEnvio = 3000;

let categoriaActual = 'todos';
let subcategoriaActual = 'todos';
let paginaActual = 1;
const itemsPorPagina = 12;

const NOMBRES_SUBCATEGORIAS = {
    // CALIENTES
    piqueos_calientes: "Piqueos Calientes",
    para_compartir: "Para Compartir",
    sopas: "Sopas",
    carnes: "Carnes",
    pastas: "Pastas",
    aves: "Aves",
    arroces: "Arroces y Rissotos",
    pescados: "Pescados y Mariscos",
    tacu: "Tacu Tacu",
    apanados: "Apanados y Fritos",
    menu_nino: "Menú de Niño",
    // FRÍOS
    para_compartir_frio: "Para Compartir",
    causas: "Causas",
    ceviches: "Ceviches",
    tiraditos: "Tiraditos",
    ensaladas: "Ensaladas",
    // POSTRES
    postres: "Postres",
    // BAR
    tragos_exclusivos: "Tragos Exclusivos",
    tragos_tradicionales: "Tragos Tradicionales",
    martinis: "Martinis Especiales",
    whiskys: "Whiskys",
    shots: "Shots",
    pousse_cafe: "Pousse Café",
    tragos_virgenes: "Tragos Vírgenes",
    bebidas: "Bebidas",
    limonadas: "Limonadas",
    jugos: "Jugos",
    pisco_sour: "Pisco Sour",
    cervezas: "Cervezas",
    vinos: "Vinos",
    cafe: "Café"
};

const ORDEN_SUBCATEGORIAS = {
    calientes: ["piqueos_calientes", "para_compartir", "sopas", "carnes", "pastas", "aves", "arroces", "pescados", "tacu", "apanados", "menu_nino"],
    frios: ["para_compartir_frio", "causas", "ceviches", "tiraditos", "ensaladas"],
    postres: ["postres"],
    bar: ["tragos_exclusivos", "tragos_tradicionales", "martinis", "whiskys", "shots", "pousse_cafe", "tragos_virgenes", "bebidas", "limonadas", "jugos", "pisco_sour", "cervezas", "vinos", "cafe"]
};

function renderCarta(cat = null, subcat = 'todos') {
    categoriaActual = cat;
    subcategoriaActual = subcat;

    const container = document.getElementById('menuColumn');
    if (!container) return;
    container.innerHTML = '';

    // Sin categoría seleccionada: mostrar estado vacío elegante
    if (!cat) {
        const subContainer = document.getElementById('subcategoriesContainer');
        if (subContainer) subContainer.style.display = 'none';
        container.innerHTML = `
            <div class="menu-empty-state">
                <div class="menu-empty-icon">🍽️</div>
                <p class="menu-empty-text">Selecciona una categoría para explorar nuestra carta</p>
            </div>`;
        return;
    }

    if (cat === "todos") {
        const subContainer = document.getElementById('subcategoriesContainer');
        if (subContainer) subContainer.style.display = 'none';

        const categoriasPrincipales = [
            { id: "calientes", nombre: "Platos Calientes" },
            { id: "frios", nombre: "Platos Fríos" },
            { id: "postres", nombre: "Postres" },
            { id: "bar", nombre: "Bar" }
        ];

        categoriasPrincipales.forEach(c => {
            const items = platosCarta.filter(p => p.categoria === c.id);
            if (items.length > 0) {
                container.innerHTML += `
                    <div class="menu-category-header" style="grid-column: 1 / -1; width: 100%; margin: 30px 0 15px 0;">
                        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: var(--primary-brown); border-bottom: 2px solid var(--primary-orange); padding-bottom: 8px;">${c.nombre}</h3>
                    </div>
                `;

                items.forEach(item => {
                    container.innerHTML += renderHTMLPlato(item);
                });
            }
        });
    } else {
        renderSubcategoriesUI(cat);

        if (subcat === "todos") {
            const subcatsOrdenadas = ORDEN_SUBCATEGORIAS[cat] || [];

            subcatsOrdenadas.forEach(sc => {
                const items = platosCarta.filter(p => p.categoria === cat && p.subcategoria === sc);
                if (items.length > 0) {
                    const tituloSubcat = NOMBRES_SUBCATEGORIAS[sc] || sc;
                    container.innerHTML += `
                        <div class="menu-subcategory-header" style="grid-column: 1 / -1; width: 100%; margin: 25px 0 12px 0;">
                            <h4 style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: var(--primary-brown); border-bottom: 1px dashed var(--border-color-dark); padding-bottom: 6px;">${tituloSubcat}</h4>
                        </div>
                    `;

                    items.forEach(item => {
                        container.innerHTML += renderHTMLPlato(item);
                    });
                }
            });
        } else {
            const items = platosCarta.filter(p => p.categoria === cat && p.subcategoria === subcat);
            items.forEach(item => {
                container.innerHTML += renderHTMLPlato(item);
            });
        }
    }

    setupScrollReveal();

    // Animación de entrada escalonada premium para asegurar visibilidad al filtrar
    requestAnimationFrame(() => {
        document.querySelectorAll('.menu-card.reveal').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 25);
        });
    });
}

function renderHTMLPlato(item) {
    return `
        <div class="menu-card reveal">
            <div class="image-container">
                <img src="${item.img}" alt="${item.nombre}" loading="lazy">
                <div class="zoom-btn" onclick="openZoom('${item.img}')">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display: block;">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                </div>
            </div>
            <h4>${item.nombre}</h4>
            <div class="price">$${item.precio.toLocaleString('es-CL')}</div>
            <div class="description">${item.reseña}</div>
            <button class="btn-add" onclick="addToCart('${item.id}')">Añadir a la Orden</button>
        </div>
    `;
}

function renderSubcategoriesUI(cat) {
    const subContainer = document.getElementById('subcategoriesContainer');
    if (!subContainer) return;

    subContainer.innerHTML = '';
    subContainer.style.display = 'flex';

    const subcats = ORDEN_SUBCATEGORIAS[cat] || [];
    if (subcats.length <= 1) {
        subContainer.style.display = 'none';
        return;
    }

    subcats.forEach(sc => {
        const nombreVisible = NOMBRES_SUBCATEGORIAS[sc] || sc;
        const btn = document.createElement('button');
        btn.className = `subtab-btn ${subcategoriaActual === sc ? 'active' : ''}`;
        btn.textContent = nombreVisible;
        btn.onclick = (e) => filtrarSubcategoria(sc, e);
        subContainer.appendChild(btn);
    });

    const btnTodos = document.createElement('button');
    btnTodos.className = `subtab-btn ${subcategoriaActual === 'todos' ? 'active' : ''}`;
    btnTodos.textContent = 'Ver Todos';
    btnTodos.onclick = (e) => filtrarSubcategoria('todos', e);
    subContainer.appendChild(btnTodos);

    setTimeout(() => {
        actualizarScrollShadows();
        const activeBtn = subContainer.querySelector('.subtab-btn.active');
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, 50);
}

function actualizarScrollShadows(container = null) {
    if (!container || typeof container === 'string') {
        container = document.getElementById(container || 'subcategoriesContainer');
    }
    if (!container) return;
    const wrapper = container.parentElement;
    if (!wrapper || !wrapper.classList) return;

    const maxScroll = container.scrollWidth - container.clientWidth;

    if (container.scrollLeft > 5) {
        wrapper.classList.add('can-scroll-left');
    } else {
        wrapper.classList.remove('can-scroll-left');
    }

    if (container.scrollLeft < maxScroll - 5 && maxScroll > 0) {
        wrapper.classList.add('can-scroll-right');
    } else {
        wrapper.classList.remove('can-scroll-right');
    }
}

function filtrarSubcategoria(subcat, event) {
    if (event) {
        document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        event.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    renderCarta(categoriaActual, subcat);
}

function renderPagination(totalPaginas) {
    const container = document.getElementById('menuPagination');
    if (!container) return;
    container.innerHTML = '';

    if (totalPaginas <= 1) return;

    // Botón Anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = `pag-btn ${paginaActual === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '←';
    prevBtn.disabled = paginaActual === 1;
    prevBtn.addEventListener('click', () => cambiarPagina(paginaActual - 1));
    container.appendChild(prevBtn);

    // Números de Página
    for (let i = 1; i <= totalPaginas; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pag-btn ${paginaActual === i ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => cambiarPagina(i));
        container.appendChild(pageBtn);
    }

    // Botón Siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = `pag-btn ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    nextBtn.innerHTML = '→';
    nextBtn.disabled = paginaActual === totalPaginas;
    nextBtn.addEventListener('click', () => cambiarPagina(paginaActual + 1));
    container.appendChild(nextBtn);
}

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    renderCarta(categoriaActual, false);
    document.getElementById('carta-section').scrollIntoView({ behavior: 'smooth' });
}

function setupScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.menu-card.reveal');
    cards.forEach(card => observer.observe(card));
}

function filtrarCategoria(cat, event) {
    if (event) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
    renderCarta(cat, 'todos');
}

function openZoom(src) {
    document.getElementById('imageModal').style.display = "flex";
    document.getElementById('modalImg').src = src;
}

function closeZoom() { document.getElementById('imageModal').style.display = "none"; }
function toggleCartPanel() {
    const panel = document.getElementById('cartPanel');
    panel.classList.toggle('open');
    // Al cerrar, siempre volver a la vista de carrito
    if (!panel.classList.contains('open')) {
        const wrapper = document.getElementById('cartPanelsWrapper');
        if (wrapper) wrapper.classList.remove('at-checkout');
    }
}

let bannerTimeout = null;

function mostrarNotificacionBanner(nombrePlato) {
    const banner = document.getElementById('cartNotificationBanner');
    if (!banner) return;

    if (bannerTimeout) clearTimeout(bannerTimeout);

    banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; font-size: 13.5px; font-weight: 500; text-align: left; line-height: 1.4;">
            <span style="font-size: 16px; flex-shrink: 0;">🛒</span>
            <span><strong>${nombrePlato}</strong> fue agregado al carrito de compras. <a href="javascript:void(0)" onclick="abrirCarritoDesdeBanner(event)">(ver)</a></span>
        </div>
        <button onclick="cerrarBannerNotificacion()" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer; padding: 0 4px; line-height: 1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: color 0.2s;" onmouseover="this.style.color='#111'" onmouseout="this.style.color='#888'">&times;</button>
    `;

    banner.classList.add('show');

    bannerTimeout = setTimeout(() => {
        cerrarBannerNotificacion();
    }, 5000);
}

function cerrarBannerNotificacion() {
    const banner = document.getElementById('cartNotificationBanner');
    if (banner) {
        banner.classList.remove('show');
    }
}

function abrirCarritoDesdeBanner(event) {
    if (event) event.stopPropagation();
    cerrarBannerNotificacion();
    const panel = document.getElementById('cartPanel');
    if (panel && !panel.classList.contains('open')) {
        toggleCartPanel();
    }
}

/* ─── NAVEGACIÓN CARRITO ⇠ CHECKOUT ─── */

function abrirCheckout() {
    if (carrito.length === 0) return;

    // Poblar el resumen de la orden en el panel de checkout
    const summary = document.getElementById('checkoutSummary');
    let subtotal = 0;
    let itemsHtml = '';

    carrito.forEach(item => {
        subtotal += item.precio * item.qty;
        itemsHtml += `
            <div class="checkout-item-row">
                <span>${item.qty}× ${item.nombre}</span>
                <strong>$${(item.precio * item.qty).toLocaleString('es-CL')}</strong>
            </div>`;
    });

    summary.innerHTML = itemsHtml + `
        <div class="checkout-total-row">
            <span>Total a pagar</span>
            <strong>$${subtotal.toLocaleString('es-CL')}</strong>
        </div>`;

    // Limpiar el form por si viene de una orden anterior
    const form = document.getElementById('checkoutForm');
    if (form) form.reset();

    // Animar el slide al checkout
    document.getElementById('cartPanelsWrapper').classList.add('at-checkout');
}

function volverAlCarrito() {
    document.getElementById('cartPanelsWrapper').classList.remove('at-checkout');
}

function setModoEntrega(modo) {
    modoEntrega = modo;
    // tabDel / tabTake pueden no existir si la sección está deshabilitada
    const tabDel = document.getElementById('tabDel');
    const tabTake = document.getElementById('tabTake');
    if (tabDel) tabDel.className = modo === 'delivery' ? 'active' : '';
    if (tabTake) tabTake.className = modo === 'takeaway' ? 'active' : '';

    const dirInput = document.getElementById('dev_direccion');
    if (dirInput) {
        if (modo === 'takeaway') {
            dirInput.disabled = true;
            dirInput.placeholder = "Retiro en local (No se requiere dirección)";
            dirInput.value = "";
        } else {
            dirInput.disabled = false;
            dirInput.placeholder = "Calle, Número, Departamento";
        }
    }
    updateCartUI();
}

function addToCart(id) {
    const product = platosCarta.find(p => String(p.id) === String(id));
    const existent = carrito.find(item => String(item.id) === String(id));
    if (existent) { existent.qty++; } else { carrito.push({ ...product, qty: 1 }); }
    updateCartUI();
    if (product) {
        mostrarNotificacionBanner(product.nombre);
    }
}

function cambiarCantidadCarrito(id, delta) {
    const item = carrito.find(item => String(item.id) === String(id));
    if (!item) return;
    
    item.qty += delta;
    if (item.qty <= 0) {
        eliminarDelCarrito(id);
    } else {
        updateCartUI();
    }
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => String(item.id) !== String(id));
    updateCartUI();
}

function updateCartUI() {
    try {
        localStorage.setItem('tizoon_cart_cache', JSON.stringify(carrito));
    } catch (e) {
        console.error("Error al persistir el carrito en localStorage:", e);
    }

    const container = document.getElementById('cartItemsContainer');
    const badge = document.getElementById('badgeCounter');
    const subtotalLabel = document.getElementById('subtotalLabel');
    const totalLabel = document.getElementById('cartTotalLabel');
    const btnCheckout = document.getElementById('btnIrCheckout');

    if (carrito.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 20px; font-style: italic;">Aún no seleccionas platos.</p>';
        badge.innerText = "0";
        const navCounter = document.getElementById('navbarCartCounter');
        if (navCounter) navCounter.innerText = "0";
        subtotalLabel.innerText = "$0";
        totalLabel.innerText = "$0";
        if (btnCheckout) btnCheckout.disabled = true;
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;
    let totalItems = 0;

    carrito.forEach(item => {
        const trustedProduct = platosCarta.find(p => String(p.id) === String(item.id));
        const price = trustedProduct ? trustedProduct.precio : item.precio;
        item.precio = price; // Forzar precio real del menú

        subtotal += price * item.qty;
        totalItems += item.qty;
        container.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.nombre}</span>
                    <strong class="cart-item-price">$${(item.precio * item.qty).toLocaleString('es-CL')}</strong>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-qty-wrapper">
                        <button onclick="cambiarCantidadCarrito('${item.id}', -1)" class="cart-qty-btn">−</button>
                        <span class="cart-qty-num">${item.qty}</span>
                        <button onclick="cambiarCantidadCarrito('${item.id}', 1)" class="cart-qty-btn">+</button>
                    </div>
                    <button onclick="eliminarDelCarrito('${item.id}')" class="cart-delete-btn" title="Eliminar plato">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    });

    subtotalLabel.innerText = `$${subtotal.toLocaleString('es-CL')}`;
    totalLabel.innerText = `$${subtotal.toLocaleString('es-CL')}`;
    badge.innerText = totalItems;
    const navCounter = document.getElementById('navbarCartCounter');
    if (navCounter) navCounter.innerText = totalItems;
    if (btnCheckout) btnCheckout.disabled = false;
}

// --- MAPA INTERACTIVO DE MESAS ---
const CONFIG_MESAS = {
    salon: {
        cols: 3,
        mesas: [
            { id: 1, pax: 4 }, { id: 10, pax: 6 }, { id: 11, pax: 6 },
            { id: 2, pax: 4 }, { id: 9, pax: 6 }, { id: 12, pax: 4 },
            { id: 3, pax: 6 }, { id: 8, pax: 4 }, { id: 13, pax: 6 },
            { id: 4, pax: 4 }, { id: 7, pax: 4 }, { id: 14, pax: 4 },
            { id: 5, pax: 4 }, { id: 6, pax: 6 }, { id: 15, pax: 4 }
        ]
    },
    terraza: {
        cols: 3,
        mesas: [
            { id: 31, pax: 4 }, { id: 21, pax: 6 }, { id: 20, pax: 4 },
            { id: 30, pax: 6 }, { id: 22, pax: 4 }, { id: 19, pax: 6 },
            { id: 29, pax: 6 }, { id: 23, pax: 6 }, { id: 18, pax: 4 },
            { id: 28, pax: 6 }, { id: 24, pax: 4 }, { id: 17, pax: 6 },
            { id: 27, pax: 6 }, { id: 25, pax: 4 }, { id: 16, pax: 4 },
            { id: null }, { id: 26, pax: 4 }, { id: null }
        ]
    }
};

// --- COMBINACIONES FÍSICAS APROBADAS POR EL LOCAL ---
// Cada entrada es una lista de IDs de mesas que se pueden juntar físicamente.
// Para 7-8 personas: combinaciones de 2 mesas (capacidad 10 pax).
// Para 9-10 personas: combinaciones de mesas (2 o 3 mesas según el layout físico del local).
const COMBINACIONES_APROBADAS = {
    salon: {
        '7-8': [[2, 3], [3, 4], [6, 5], [9, 8], [11, 12], [12, 13], [13, 14]],
        '9-10': [[2, 3, 4], [5, 6, 15], [9, 10], [12, 13, 14]]
    },
    terraza: {
        '7-8': [[17, 18], [18, 19], [19, 20], [20, 21], [22, 23], [23, 24], [26, 27], [30, 31]],
        '9-10': [[20, 21, 31], [22, 23, 24], [28, 27]]
    }
};

let reservasPlanilla = [];
let ultimaCargaReservas = 0;
const THROTTLE_MS = 10000; // 10 segundos
let cargandoReservas = false;

function cargarReservasPlanilla() {
    const ahora = Date.now();
    if (ahora - ultimaCargaReservas < THROTTLE_MS) {
        return Promise.resolve(); // Usar caché
    }

    if (!GOOGLE_SHEETS_APP_SCRIPT_URL || GOOGLE_SHEETS_APP_SCRIPT_URL === "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI") {
        return Promise.resolve();
    }

    return fetch(GOOGLE_SHEETS_APP_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                reservasPlanilla = data;
                ultimaCargaReservas = Date.now();
                console.log(`Loaded ${reservasPlanilla.length} reservations from Google Sheets.`);
            }
        })
        .catch(error => {
            console.error("Error loading reservations from Google Sheets:", error);
        });
}

let sesionReservas = []; // [{ sector, fecha, hora, mesaIds: [...] }]
let mesaSeleccionada = null; // Array de objetos mesa de la combinación elegida

function findValueByKeyPart(obj, keyPart, excludePart = null) {
    if (!obj || typeof obj !== 'object') return undefined;
    const key = Object.keys(obj).find(k => {
        const kLower = k.toLowerCase();
        if (excludePart && kLower.includes(excludePart.toLowerCase())) return false;
        return kLower.includes(keyPart.toLowerCase());
    });
    return key ? obj[key] : undefined;
}

function parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;

    // Si viene en formato ISO (por ejemplo: "1899-12-30T18:42:45.000Z")
    if (String(timeStr).includes('T')) {
        const date = new Date(timeStr);
        if (!isNaN(date.getTime())) {
            return date.getHours() * 60 + date.getMinutes();
        }
    }

    // Formato estándar "HH:MM"
    const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const hrs = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    return hrs * 60 + mins;
}

function horasSolapan(t1Str, t2Str) {
    const t1 = parseTimeToMinutes(t1Str);
    const t2 = parseTimeToMinutes(t2Str);
    if (t1 === null || t2 === null) return false;
    return Math.abs(t1 - t2) < 180; // Solapamiento de menos de 180 minutos (3 horas)
}

function esMesaReservada(sector, fecha, hora, mesaId) {
    // 1. Verificar reservas locales de la sesión
    const reservadaLocal = sesionReservas.some(r =>
        r.sector === sector &&
        r.fecha === fecha &&
        horasSolapan(r.hora, hora) &&
        r.mesaIds.includes(mesaId)
    );
    if (reservadaLocal) return true;

    // 2. Verificar reservas de la planilla Google Sheets
    const sectorPlanilla = sector === 'salon' ? 'Salón Principal' : 'Terraza Interna';

    const cleanText = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const sectorClean = cleanText(sectorPlanilla);

    return reservasPlanilla.some(r => {
        let fPlanilla = findValueByKeyPart(r, 'fecha', 'registro') || findValueByKeyPart(r, 'date');
        let hPlanilla = findValueByKeyPart(r, 'turno') || findValueByKeyPart(r, 'hora') || findValueByKeyPart(r, 'time');
        let sPlanilla = findValueByKeyPart(r, 'sector') || findValueByKeyPart(r, 'zona');
        let mesaVal = findValueByKeyPart(r, 'mesa') || findValueByKeyPart(r, 'num') || findValueByKeyPart(r, 'id');

        if (fPlanilla) {
            fPlanilla = String(fPlanilla).trim();
            // Extraer solo la fecha (YYYY-MM-DD) si viene en formato completo o ISO string
            if (fPlanilla.includes('T')) {
                fPlanilla = fPlanilla.split('T')[0];
            }
        }
        if (hPlanilla) hPlanilla = String(hPlanilla).trim();

        const sPlanillaClean = sPlanilla ? cleanText(String(sPlanilla)) : '';

        if (fPlanilla === fecha && horasSolapan(hPlanilla, hora) && sPlanillaClean === sectorClean) {
            if (mesaVal) {
                const mesaStr = String(mesaVal);
                const mesasOcupadas = (mesaStr.match(/\d+/g) || []).map(numStr => parseInt(numStr, 10));
                return mesasOcupadas.includes(mesaId);
            }
        }
        return false;
    });
}

// Devuelve el objeto mesa del CONFIG dado su ID (o null si no existe)
function getMesaPorId(sector, id) {
    return CONFIG_MESAS[sector].mesas.find(m => m && m.id === id) || null;
}

// Filtra las combinaciones aprobadas dejando solo las que tienen todas sus mesas disponibles
function getCombinacionesDisponibles(sector, fecha, hora, rangoKey) {
    const combis = COMBINACIONES_APROBADAS[sector][rangoKey] || [];
    return combis.filter(ids =>
        ids.every(id => !esMesaReservada(sector, fecha, hora, id))
    ).map(ids => ids.map(id => getMesaPorId(sector, id)).filter(Boolean));
}

function abrirWhatsAppGrupo(e) {
    if (e) e.preventDefault();

    const nombre = document.getElementById('res_nombre').value;
    const fecha = document.getElementById('res_fecha').value;
    const hora = document.getElementById('res_hora').value;
    const telefono = document.getElementById('res_telefono').value;
    const sector = document.getElementById('res_sector').value;
    const pax = document.getElementById('res_pax').value;

    if (!nombre.trim() || !telefono.trim()) {
        alert('Por favor, ingresa tu Nombre y Teléfono de contacto abajo para poder coordinar tu reserva por WhatsApp.');
        if (!nombre.trim()) {
            document.getElementById('res_nombre').focus();
        } else {
            document.getElementById('res_telefono').focus();
        }
        return;
    }

    const sectorLabel = sector === 'salon' ? 'Salón Principal' : 'Terraza Interna';

    let fechaLegible = fecha;
    if (fecha) {
        const [y, m, d] = fecha.split('-');
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        fechaLegible = `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
    }

    const mensaje = `*Nueva Reserva para Grupo Grande (>10 personas)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}
👥 *Personas:* ${pax} personas
📅 *Fecha:* ${fechaLegible}
⏰ *Hora:* ${hora} hrs
📍 *Sector:* ${sectorLabel}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hola El Tizzón, me gustaría coordinar los detalles para nuestra visita. ¡Muchas gracias!`;

    const urlWa = `https://wa.me/56967459137?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWa, '_blank');
}

function dibujarMapaMesas() {
    dibujarMapaMesasInterno();

    if (!cargandoReservas) {
        cargandoReservas = true;
        cargarReservasPlanilla()
            .then(() => {
                cargandoReservas = false;
                dibujarMapaMesasInterno();
            })
            .catch(() => {
                cargandoReservas = false;
            });
    }
}

function dibujarMapaMesasInterno() {
    const sector = document.getElementById('res_sector').value;
    const wrapper = document.getElementById('mapaMesasWrapper');
    const contenedor = document.getElementById('mapaMesasInteractivo');
    const label = document.getElementById('mesaElegidaLabel');
    const inputMesa = document.getElementById('res_mesa');
    const fechaInput = document.getElementById('res_fecha');
    const horaInput = document.getElementById('res_hora');
    const paxInput = document.getElementById('res_pax');

    // Resetear selección
    mesaSeleccionada = null;
    inputMesa.value = '';
    label.textContent = '';
    label.className = 'mesa-elegida-label';

    if (!sector) {
        wrapper.style.display = 'none';
        return;
    }

    const fecha = fechaInput.value;
    const hora = horaInput.value;
    const pax = parseInt(paxInput.value) || 1;
    const config = CONFIG_MESAS[sector];
    wrapper.style.display = 'block';

    // --- GRUPOS GRANDES: más de 10 personas ---
    if (pax > 10) {
        contenedor.innerHTML = '';
        contenedor.style.gridTemplateColumns = '1fr';
        contenedor.innerHTML = `
            <div style="
                text-align: center;
                padding: 28px 20px;
                background: #fff8f0;
                border: 1px solid var(--primary-orange);
                border-radius: 14px;
                color: var(--primary-brown);
            ">
                <div style="font-size: 32px; margin-bottom: 10px;">🍽️</div>
                <p style="font-weight:700; font-size:15px; margin-bottom:6px; font-family:'Playfair Display',serif;">
                    Grupos de más de 10 personas
                </p>
                <p style="font-size:13px; color:var(--text-muted); line-height:1.6; margin-bottom:20px;">
                    Para grupos grandes coordinamos tu reserva a medida.<br>
                    Escríbenos y te respondemos a la brevedad.
                </p>
                <a href="#"
                   onclick="abrirWhatsAppGrupo(event)"
                   style="
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        background-color: #25d366;
                        color: #fff;
                        text-decoration: none;
                        font-weight: 700;
                        font-size: 14px;
                        padding: 12px 24px;
                        border-radius: 30px;
                        font-family: 'Plus Jakarta Sans', sans-serif;
                        letter-spacing: 0.5px;
                        box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
                        transition: all 0.2s ease;
                   "
                   onmouseover="this.style.backgroundColor='#1ebe5d'; this.style.transform='translateY(-2px)'"
                   onmouseout="this.style.backgroundColor='#25d366'; this.style.transform='translateY(0)'"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    Reservar por WhatsApp
                </a>
            </div>
        `;
        return;
    }

    // --- GRUPOS NORMALES Y COMBINADOS (1-10 personas) ---
    contenedor.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    contenedor.innerHTML = '';

    if (pax >= 7) {
        // Lógica de combinaciones físicas
        const rangoKey = pax <= 8 ? '7-8' : '9-10';
        const combisDisponibles = getCombinacionesDisponibles(sector, fecha, hora, rangoKey);

        // Registrar mesas combinables disponibles
        const idsCombinables = new Set();
        combisDisponibles.forEach(comb => {
            comb.forEach(m => {
                if (m && m.id) idsCombinables.add(m.id);
            });
        });

        config.mesas.forEach(m => {
            let cell;
            if (!m || !m.id) {
                cell = document.createElement('div');
                cell.className = 'mesa-vacia';
            } else {
                cell = document.createElement('button');
                cell.setAttribute('type', 'button');
                cell.dataset.id = m.id;
                cell.dataset.pax = m.pax;

                const reservada = esMesaReservada(sector, fecha, hora, m.id);

                if (reservada) {
                    cell.className = 'mesa-btn deshabilitada';
                    cell.disabled = true;
                    cell.setAttribute('aria-label', `Mesa ${m.id}, capacidad ${m.pax} personas, reservada.`);
                    cell.innerHTML = `
                        <span class="mesa-num">Mesa ${m.id}</span>
                        <span class="mesa-pax">${m.pax} pax</span>
                        <span class="mesa-badge badge-reservada">Reservada</span>
                    `;
                } else if (idsCombinables.has(m.id)) {
                    cell.className = 'mesa-btn apta';
                    cell.style.border = '2px dashed var(--primary-orange)';
                    cell.setAttribute('aria-label', `Mesa ${m.id}, capacidad ${m.pax} personas, disponible para combinar.`);
                    cell.innerHTML = `
                        <span class="mesa-num">Mesa ${m.id}</span>
                        <span class="mesa-pax">${m.pax} pax</span>
                        <span class="mesa-badge badge-juntar">Juntar</span>
                    `;
                    cell.addEventListener('click', () => seleccionarMesaCombinacion(m, combisDisponibles, pax));
                    cell.addEventListener('mouseenter', () => alternarHoverCombinacion(m, combisDisponibles, true));
                    cell.addEventListener('mouseleave', () => alternarHoverCombinacion(m, combisDisponibles, false));
                } else {
                    cell.className = 'mesa-btn deshabilitada';
                    cell.disabled = true;
                    cell.setAttribute('aria-label', `Mesa ${m.id}, capacidad ${m.pax} personas, no apta por capacidad.`);
                    cell.innerHTML = `
                        <span class="mesa-num">Mesa ${m.id}</span>
                        <span class="mesa-pax">${m.pax} pax</span>
                        <span class="mesa-badge badge-reservada">Chica</span>
                    `;
                }
            }
            contenedor.appendChild(cell);
        });

    } else {
        // Lógica de selección de mesas individuales (1-6 pax)
        config.mesas.forEach(m => {
            let cell;
            if (!m || !m.id) {
                cell = document.createElement('div');
                cell.className = 'mesa-vacia';
            } else {
                cell = document.createElement('button');
                cell.setAttribute('type', 'button');
                cell.dataset.id = m.id;
                cell.dataset.pax = m.pax;

                const reservada = esMesaReservada(sector, fecha, hora, m.id);

                if (reservada) {
                    cell.className = 'mesa-btn deshabilitada';
                    cell.disabled = true;
                    cell.setAttribute('aria-label', `Mesa ${m.id}, capacidad ${m.pax} personas, reservada.`);
                    cell.innerHTML = `
                        <span class="mesa-num">Mesa ${m.id}</span>
                        <span class="mesa-pax">${m.pax} pax</span>
                        <span class="mesa-badge badge-reservada">Reservada</span>
                    `;
                } else if (m.pax >= pax) {
                    cell.className = 'mesa-btn apta';
                    cell.setAttribute('aria-label', `Mesa ${m.id}, capacidad ${m.pax} personas, disponible.`);
                    cell.innerHTML = `
                        <span class="mesa-num">Mesa ${m.id}</span>
                        <span class="mesa-pax">${m.pax} pax</span>
                        <span class="mesa-badge badge-apta">Apta</span>
                    `;
                    cell.addEventListener('click', () => seleccionarMesaIndividual(cell, m));
                } else {
                    cell.className = 'mesa-btn deshabilitada';
                    cell.disabled = true;
                    cell.setAttribute('aria-label', `Mesa ${m.id}, capacidad ${m.pax} personas, no apta por capacidad.`);
                    cell.innerHTML = `
                        <span class="mesa-num">Mesa ${m.id}</span>
                        <span class="mesa-pax">${m.pax} pax</span>
                        <span class="mesa-badge badge-reservada">Chica</span>
                    `;
                }
            }
            contenedor.appendChild(cell);
        });
    }
}

function seleccionarMesaIndividual(el, mesa) {
    document.querySelectorAll('.mesa-btn.seleccionada').forEach(b => {
        b.classList.remove('seleccionada');
        b.classList.remove('combinacion-seleccionada');
        const badge = b.querySelector('.mesa-badge');
        if (badge && badge.textContent === 'Juntas') {
            badge.textContent = 'Juntar';
        }
    });
    el.classList.add('seleccionada');

    mesaSeleccionada = [mesa];
    document.getElementById('res_mesa').value = mesa.id;

    const label = document.getElementById('mesaElegidaLabel');
    label.textContent = `✓ Mesa ${mesa.id} seleccionada · capacidad ${mesa.pax} personas`;
    label.className = 'mesa-elegida-label activa';
}

function seleccionarMesaCombinacion(mesaClick, combisDisponibles, paxRequerido) {
    const matches = combisDisponibles.filter(comb => comb.some(m => m.id === mesaClick.id));
    if (matches.length === 0) return;

    // Ciclar entre opciones disponibles si la mesa participa en múltiples arreglos
    let selectedIdx = 0;
    if (mesaSeleccionada && matches.length > 1) {
        const currentIdsStr = mesaSeleccionada.map(m => m.id).sort().join(',');
        const idx = matches.findIndex(comb => comb.map(m => m.id).sort().join(',') === currentIdsStr);
        if (idx !== -1) {
            selectedIdx = (idx + 1) % matches.length;
        }
    }

    const combinacion = matches[selectedIdx];

    // Desmarcar selecciones anteriores
    document.querySelectorAll('.mesa-btn.seleccionada').forEach(b => {
        b.classList.remove('seleccionada');
        b.classList.remove('combinacion-seleccionada');
        const badge = b.querySelector('.mesa-badge');
        if (badge && badge.textContent === 'Juntas') {
            badge.textContent = 'Juntar';
        }
    });

    // Resaltar en naranja/verde todas las mesas que integran esta combinación
    combinacion.forEach(m => {
        const el = document.querySelector(`.mesa-btn[data-id="${m.id}"]`);
        if (el) {
            el.classList.add('seleccionada');
            el.classList.add('combinacion-seleccionada');
            const badge = el.querySelector('.mesa-badge');
            if (badge) {
                badge.textContent = 'Juntas';
            }
        }
    });

    mesaSeleccionada = combinacion;
    document.getElementById('res_mesa').value = combinacion.map(m => m.id).join(', ');

    const label = document.getElementById('mesaElegidaLabel');
    const capTotal = combinacion.reduce((s, m) => s + m.pax, 0);
    const nombresMesas = combinacion.map(m => `Mesa ${m.id}`).join(' + ');
    label.textContent = `✓ Arreglo: ${nombresMesas} · ${capTotal} pax disponibles para tu grupo de ${paxRequerido}`;
    label.className = 'mesa-elegida-label activa';
}

function alternarHoverCombinacion(mesaHover, combisDisponibles, activar) {
    let combinacion = null;
    if (mesaSeleccionada && mesaSeleccionada.some(m => m.id === mesaHover.id)) {
        combinacion = mesaSeleccionada;
    } else {
        combinacion = combisDisponibles.find(comb => comb.some(m => m.id === mesaHover.id));
    }

    if (!combinacion) return;

    combinacion.forEach(m => {
        const el = document.querySelector(`.mesa-btn[data-id="${m.id}"]`);
        if (el) {
            if (activar) {
                el.classList.add('combinacion-hover');
            } else {
                el.classList.remove('combinacion-hover');
            }
        }
    });
}

function seleccionarArreglo(combinacion, paxRequerido) {
    mesaSeleccionada = combinacion;
    document.getElementById('res_mesa').value = combinacion.map(m => m.id).join(', ');

    const label = document.getElementById('mesaElegidaLabel');
    const capTotal = combinacion.reduce((s, m) => s + m.pax, 0);
    const nombresMesas = combinacion.map(m => `Mesa ${m.id}`).join(' + ');
    label.textContent = `✓ Arreglo: ${nombresMesas} · ${capTotal} pax disponibles para tu grupo de ${paxRequerido}`;
    label.className = 'mesa-elegida-label activa';
}

// --- RESERVA (Airtable se conecta en siguiente fase) ---
function procesarReserva(e) {
    e.preventDefault();

    const nombre = sanitizarEntrada(document.getElementById('res_nombre').value);
    const fecha = document.getElementById('res_fecha').value;
    const hora = document.getElementById('res_hora').value;
    const telefono = sanitizarEntrada(document.getElementById('res_telefono').value);
    const sector = document.getElementById('res_sector').value;
    const mesa = document.getElementById('res_mesa').value;
    const pax = document.getElementById('res_pax').value;

    // Validar que la hora seleccionada esté en el rango permitido para ese día
    const [yr, mo, dy] = fecha.split('-').map(Number);
    const diaSemana = new Date(yr, mo - 1, dy).getDay();
    const rango = HORARIOS_ATENCION[diaSemana];
    if (rango) {
        if (hora < rango.start || hora > rango.end) {
            alert(`Para la fecha seleccionada, el horario de reservas es de ${rango.start} a ${rango.end} hrs (hasta media hora antes del cierre).`);
            return;
        }
    }

    // Validar que se eligió una mesa antes de continuar
    if (!sector) {
        alert('Por favor, selecciona el sector del comedor.');
        return;
    }
    if (!mesa) {
        alert('Por favor, selecciona tu mesa preferida en el plano.');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Procesando...';

    const sectorLabel = sector === 'salon' ? 'Salón Principal' : 'Terraza Interna';
    const reservaData = { nombre, fecha, hora, sector: sectorLabel, mesa, telefono, pax };

    function finalizarReservaLocal() {
        const mesaIds = mesa.split(', ').map(idStr => parseInt(idStr));
        sesionReservas.push({ sector, fecha, hora, mesaIds });

        const [y2, m2, d2] = fecha.split('-');
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const fechaLegible = `${parseInt(d2)} de ${meses[parseInt(m2) - 1]} de ${y2}`;

        // Generar, copiar y descargar el voucher de reserva de forma silenciosa automáticamente
        generarYCopiarVoucherReservaSilencioso({
            nombre,
            fecha,
            fechaLegible,
            hora,
            sectorLabel,
            mesa,
            telefono,
            pax
        });

        mostrarConfirmacionReserva({ nombre, fecha, hora, sectorLabel, mesa, telefono, pax });
        document.getElementById('reservaForm').reset();
        document.getElementById('mapaMesasWrapper').style.display = 'none';
        document.getElementById('mesaElegidaLabel').textContent = '';
        mesaSeleccionada = null;
        submitBtn.disabled = false;
        submitBtn.innerText = 'Confirmar Mesa Seleccionada';

        // Reestablecer fecha por defecto después del reset del formulario
        const dateInput = document.getElementById('res_fecha');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
            actualizarHorariosSegunFecha();
        }

        // WhatsApp redirect
        let cleanPhone = telefono.replace(/\D/g, '');
        if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
            cleanPhone = '56' + cleanPhone;
        }
        const targetPhone = cleanPhone ? cleanPhone : '56967459137';

        const mensaje = `*Confirmación de Reserva - El Tizzón*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${nombre}
📅 *Fecha:* ${fechaLegible}
⏰ *Hora:* ${hora} hrs
📍 *Sector:* ${sectorLabel}
🪑 *Mesa(s):* Nº ${mesa}
👥 *Capacidad:* ${pax} personas
📞 *Contacto:* ${telefono}
━━━━━━━━━━━━━━━━━━━━━━━━━━
¡Hola! Aquí tienes el resumen y voucher de tu reserva en El Tizzón. ¡Te esperamos!`;

        const urlWa = `https://wa.me/${targetPhone}?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWa, '_blank');
    }

    // Si la URL no está configurada, usar el comportamiento simulado (mock)
    if (!GOOGLE_SHEETS_APP_SCRIPT_URL || GOOGLE_SHEETS_APP_SCRIPT_URL === "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI") {
        console.warn("Google Sheets App Script URL is not configured. Falling back to simulated reservation.");
        setTimeout(finalizarReservaLocal, 800);
        return;
    }

    // Enviar los datos a Google Sheets usando modo no-cors o cors
    // Usamos text/plain para evitar solicitudes de preflight CORS complejas en navegadores
    fetch(GOOGLE_SHEETS_APP_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(reservaData)
    })
        .then(() => {
            // En modo no-cors o con redirect exitoso, asumimos éxito del envío
            finalizarReservaLocal();
        })
        .catch(error => {
            console.error("Error al guardar la reserva en Google Sheets:", error);
            alert("Hubo un problema de conexión al registrar tu reserva. Por favor, inténtalo de nuevo.");
            submitBtn.disabled = false;
            submitBtn.innerText = 'Confirmar Mesa Seleccionada';
        });
}

function mostrarConfirmacionReserva({ nombre, fecha, hora, sectorLabel, mesa, telefono, pax }) {
    // Formatear fecha legible
    const [y, m, d] = fecha.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fechaLegible = `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;

    window.ultimaReserva = {
        nombre,
        fecha,
        fechaLegible,
        hora,
        sectorLabel,
        mesa,
        telefono,
        pax
    };

    // Crear o reutilizar el modal de confirmación
    let modal = document.getElementById('reservaConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'reservaConfirmModal';
        modal.className = 'reserva-modal-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="reserva-modal-card">
            <div class="reserva-modal-check">✓</div>
            <h3 class="reserva-modal-title">¡Mesa Reservada!</h3>
            <p class="reserva-modal-sub">Tu reserva ha sido registrada con éxito</p>
            <div class="reserva-modal-detalle">
                <div class="reserva-detalle-row"><span>Nombre</span><strong>${nombre}</strong></div>
                <div class="reserva-detalle-row"><span>Fecha</span><strong>${fechaLegible}</strong></div>
                <div class="reserva-detalle-row"><span>Turno</span><strong>${hora} hrs</strong></div>
                <div class="reserva-detalle-row"><span>Sector</span><strong>${sectorLabel}</strong></div>
                <div class="reserva-detalle-row"><span>Mesa(s)</span><strong>Mesa(s) Nº ${mesa}</strong></div>
                <div class="reserva-detalle-row"><span>Personas</span><strong>${pax} pax</strong></div>
                <div class="reserva-detalle-row"><span>Contacto</span><strong>${telefono}</strong></div>
            </div>
            <p class="reserva-modal-nota">Te esperamos en El Tizzón · Recuerda presentarte 10 minutos antes.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin-top: 20px;">
                <button class="btn-add btn-download-voucher" style="height: 46px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="descargarVoucherReservaOnly()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
                    </svg>
                    Descargar Voucher
                </button>
                <button class="btn-add btn-download-voucher" style="height: 46px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #25D366 !important; border-color: #25D366 !important; color: #fff !important;" onclick="compartirWhatsAppReserva()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.196 8.196 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.192 8.192 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm-1.92 3.12c-.26 0-.58.1-.88.43-.3.33-1.14 1.11-1.14 2.71 0 1.59 1.16 3.13 1.32 3.35.16.22 2.22 3.39 5.37 4.75.75.32 1.33.52 1.79.66.75.24 1.43.2 1.97.12.6-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.28-.21-.58-.36-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.89-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.24-.6-.52-.52-.68-.53-.16-.01-.35-.01-.55-.01z"/>
                    </svg>
                    Compartir WhatsApp
                </button>
            </div>
            <button class="btn-add reserva-modal-cerrar" style="background-color: var(--primary-orange); margin: 20px 0 0 0; width: 100%; height: 46px;" onclick="cerrarConfirmacionReserva()">Listo</button>
            <p class="reserva-modal-nota" style="margin-top: 14px; margin-bottom: 0; font-size: 11px;">Pega la imagen (Ctrl+V / Pegar) en el chat de WhatsApp del cliente para enviarle su comprobante de reserva.</p>
        </div>
    `;
    modal.style.display = 'flex';
    // Animar entrada
    requestAnimationFrame(() => {
        modal.classList.add('visible');
        lockFocus('reservaConfirmModal');
    });
}

function cerrarConfirmacionReserva() {
    const modal = document.getElementById('reservaConfirmModal');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300);
        releaseFocus();
    }
}

function procesarPedidoCompleto(e) {
    e.preventDefault();
    if (carrito.length === 0) {
        alert("Por favor, selecciona tus platos antes de enviar la orden.");
        return;
    }

    // Leer desde el form del panel de checkout (Sanitizar)
    const nombre = sanitizarEntrada(document.getElementById('chk_nombre').value);
    const telefono = sanitizarEntrada(document.getElementById('chk_telefono').value);
    const instrucciones = sanitizarEntrada((document.getElementById('chk_instrucciones') || {}).value || '');

    // Compilar resumen de items con validación de precios (Backend-integrity fallback)
    let itemsText = carrito.map(item => {
        const trustedProduct = platosCarta.find(p => String(p.id) === String(item.id));
        const price = trustedProduct ? trustedProduct.precio : item.precio;
        item.precio = price; // Forzar precio real
        return `${item.qty}x ${item.nombre}`;
    }).join(', ');

    let subtotal = 0;
    carrito.forEach(item => {
        subtotal += item.precio * item.qty;
    });
    const total = subtotal; // Retiro en local: sin costo de envío

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Enviando...';

    const pedidoData = {
        nombre,
        telefono,
        modoEntrega: 'takeaway',
        itemsText,
        total,
        instrucciones
    };

    function finalizarPedidoLocal() {
        const localCarritoCopy = JSON.parse(JSON.stringify(carrito));

        mostrarConfirmacionPedido({
            nombre,
            telefono,
            modoEntrega: 'takeaway',
            direccion: '',
            itemsText,
            subtotal,
            envio: 0,
            total,
            instrucciones,
            carritoItems: localCarritoCopy
        });

        // Crear el mensaje de WhatsApp estructurado de la comanda
        let waItems = carrito.map(item => `• *${item.qty}x* ${item.nombre} ($${(item.precio * item.qty).toLocaleString('es-CL')})`).join('\n');

        let mensaje = `*Detalle de tu Comanda - El Tizzón*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${nombre}
📞 *Teléfono:* ${telefono}
📦 *Entrega:* Retiro en Local
🛒 *Productos:*
${waItems}
💵 *Total:* $${total.toLocaleString('es-CL')}
${instrucciones ? `📝 *Notas:* ${instrucciones}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━
¡Hola! Aquí tienes el resumen y voucher de tu comanda en El Tizzón.`;

        // Generar, copiar y descargar el voucher de forma silenciosa automáticamente
        generarYCopiarVoucherSilencioso({
            nombre,
            telefono,
            modoEntrega: 'takeaway',
            direccion: '',
            itemsText,
            subtotal,
            envio: 0,
            total,
            instrucciones,
            carritoItems: localCarritoCopy
        });

        // Limpiar número del cliente y agregar código país si falta
        let cleanPhone = telefono.replace(/\D/g, '');
        if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
            cleanPhone = '56' + cleanPhone;
        }
        const targetPhone = cleanPhone ? cleanPhone : '56967459137'; // fallback al restaurante si falla
        const urlWa = `https://wa.me/${targetPhone}?text=${encodeURIComponent(mensaje)}`;

        // Resetear estado del carrito local
        carrito = [];
        const form = document.getElementById('checkoutForm');
        if (form) form.reset();
        volverAlCarrito();
        updateCartUI();

        submitBtn.disabled = false;
        submitBtn.innerText = '🍳 Enviar Orden a Cocina';

        // Abrir WhatsApp en pestaña nueva con el chat del cliente
        window.open(urlWa, '_blank');
    }

    // Si la URL no está configurada, usar el comportamiento directo (solo WhatsApp)
    if (!GOOGLE_SHEETS_APP_SCRIPT_URL || GOOGLE_SHEETS_APP_SCRIPT_URL === "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI") {
        console.warn("Google Sheets App Script URL is not configured. Falling back to WhatsApp only submission.");
        setTimeout(finalizarPedidoLocal, 800);
        return;
    }

    // Enviar los datos del pedido a Google Sheets
    fetch(GOOGLE_SHEETS_APP_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(pedidoData)
    })
        .then(() => {
            finalizarPedidoLocal();
        })
        .catch(error => {
            console.error("Error al guardar la comanda en Google Sheets:", error);
            alert("Hubo un problema de conexión al registrar tu comanda en Sheets. Se procederá a enviar por WhatsApp.");
            finalizarPedidoLocal();
        });
}

function mostrarConfirmacionPedido({ nombre, telefono, modoEntrega, direccion, itemsText, subtotal, envio, total, instrucciones, carritoItems }) {
    // Guardar los datos para poder generar la imagen
    window.ultimoPedido = {
        nombre,
        telefono,
        modoEntrega,
        direccion,
        itemsText,
        subtotal,
        envio,
        total,
        instrucciones,
        carritoItems: carritoItems || []
    };

    let modal = document.getElementById('pedidoConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pedidoConfirmModal';
        modal.className = 'reserva-modal-overlay';
        document.body.appendChild(modal);
    }

    const tipoText = modoEntrega === 'delivery' ? 'Despacho a Domicilio' : 'Retiro en Local';

    modal.innerHTML = `
        <div class="reserva-modal-card">
            <div class="reserva-modal-check" style="background-color: var(--primary-orange); box-shadow: 0 8px 24px rgba(218, 156, 0, 0.4);">🍳</div>
            <h3 class="reserva-modal-title">¡Pedido Recibido!</h3>
            <p class="reserva-modal-sub">Tu orden ya ingresó a nuestra cocina</p>
            <div class="reserva-modal-detalle">
                <div class="reserva-detalle-row"><span>Cliente</span><strong>${nombre}</strong></div>
                <div class="reserva-detalle-row"><span>Teléfono</span><strong>${telefono}</strong></div>
                <div class="reserva-detalle-row"><span>Entrega</span><strong>${tipoText}</strong></div>
                ${modoEntrega === 'delivery' ? `<div class="reserva-detalle-row"><span>Dirección</span><strong>${direccion}</strong></div>` : ''}
                <div class="reserva-detalle-row"><span>Productos</span><strong>${itemsText}</strong></div>
                <div class="reserva-detalle-row"><span>Total</span><strong style="color: var(--primary-orange); font-size: 15px;">$${total.toLocaleString('es-CL')}</strong></div>
                ${instrucciones ? `<div class="reserva-detalle-row"><span>Notas</span><strong>${instrucciones}</strong></div>` : ''}
            </div>
            <p class="reserva-modal-nota">Nuestra cocina está preparando los platos minuciosamente para honrar nuestra sazón.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin-top: 20px;">
                <button class="btn-add btn-download-voucher" style="height: 46px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="descargarVoucherPedidoOnly()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
                    </svg>
                    Descargar Voucher
                </button>
                <button class="btn-add btn-download-voucher" style="height: 46px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #25D366 !important; border-color: #25D366 !important; color: #fff !important;" onclick="compartirWhatsAppVoucher()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.196 8.196 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.192 8.192 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm-1.92 3.12c-.26 0-.58.1-.88.43-.3.33-1.14 1.11-1.14 2.71 0 1.59 1.16 3.13 1.32 3.35.16.22 2.22 3.39 5.37 4.75.75.32 1.33.52 1.79.66.75.24 1.43.2 1.97.12.6-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.28-.21-.58-.36-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.89-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.24-.6-.52-.52-.68-.53-.16-.01-.35-.01-.55-.01z"/>
                    </svg>
                    Compartir WhatsApp
                </button>
            </div>
            <button class="btn-add reserva-modal-cerrar" style="background-color: var(--primary-orange); margin: 20px 0 0 0; width: 100%; height: 46px;" onclick="cerrarConfirmacionPedido()">Listo</button>
            <p class="reserva-modal-nota" style="margin-top: 14px; margin-bottom: 0; font-size: 11px;">Pega la imagen (Ctrl+V / Pegar) en el chat de WhatsApp del cliente para enviarle su voucher de comanda.</p>
        </div>
    `;
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('visible');
        lockFocus('pedidoConfirmModal');
    });
}

function descargarVoucherPedido() {
    const pedido = window.ultimoPedido;
    if (!pedido) {
        alert("No hay detalles del último pedido registrados.");
        return;
    }

    const cardMargin = 15;
    const circleY = cardMargin + 50; // 65

    // Calcular la altura dinámica del canvas
    const rows = [
        { label: "Cliente", value: pedido.nombre },
        { label: "Teléfono", value: pedido.telefono },
        { label: "Entrega", value: pedido.modoEntrega === 'delivery' ? 'Despacho a Domicilio' : 'Retiro en Local' }
    ];
    if (pedido.modoEntrega === 'delivery' && pedido.direccion) {
        rows.push({ label: "Dirección", value: pedido.direccion });
    }

    const items = pedido.carritoItems || [];

    // Calcular la posición final del detalle
    let calcY = circleY + 95; // detailY
    calcY += 25; // primer padding del detail
    calcY += rows.length * 36; // filas de datos
    calcY += 20; // cabecera productos
    calcY += items.length * 24; // items de productos
    calcY += 16; // espacio separador total
    calcY += 36; // fila total
    if (pedido.instrucciones) {
        calcY += 36; // fila de notas
    }
    
    const detailH = (calcY - 8) - (circleY + 95);
    const notaCocinaH = 50; // margen para 3 lineas de texto envuelto
    const cardH = (circleY + 95) + detailH + 20 + notaCocinaH + 15;
    const canvasWidth = 460;
    const canvasHeight = cardH + (cardMargin * 2);

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Fondo oscuro de toda la imagen
    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Fondo y borde de tarjeta
    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardW = canvasWidth - (cardMargin * 2);
    const radius = 18;

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    ctx.fillStyle = '#1f1f1f';
    roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#2c2c2c';
    ctx.stroke();

    // Check Circle Cobre
    const circleX = canvasWidth / 2;
    const circleRadius = 26;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#c4836a';
    ctx.shadowColor = 'rgba(196, 131, 106, 0.4)';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#161616';
    ctx.fillText('🍳', circleX, circleY + 1);

    // Título
    ctx.font = '700 22px Playfair Display, Georgia, serif';
    ctx.fillStyle = '#c4836a';
    ctx.textAlign = 'center';
    ctx.fillText('¡Pedido Recibido!', circleX, circleY + 52);

    // Subtítulo
    ctx.font = 'italic 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.fillText('Tu orden ya ingresó a nuestra cocina', circleX, circleY + 74);

    // Caja de detalle interna
    const detailX = cardX + 20;
    const detailY = circleY + 95;
    const detailW = cardW - 40;

    ctx.fillStyle = '#161616';
    ctx.strokeStyle = '#2c2c2c';
    roundRect(detailX, detailY, detailW, detailH, 12);
    ctx.fill();
    ctx.stroke();

    // Filas
    let rowY = detailY + 25;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    function drawRow(labelText, valueText, isTotal = false) {
        ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.fillText(labelText.toUpperCase(), detailX + 16, rowY);

        if (isTotal) {
            ctx.font = '700 15px Plus Jakarta Sans, sans-serif';
            ctx.fillStyle = '#c4836a';
        } else {
            ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
            ctx.fillStyle = '#E4E4E4';
        }
        ctx.textAlign = 'right';
        ctx.fillText(valueText, detailX + detailW - 16, rowY);

        ctx.beginPath();
        ctx.moveTo(detailX + 16, rowY + 18);
        ctx.lineTo(detailX + detailW - 16, rowY + 18);
        ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'left';
        rowY += 36;
    }

    rows.forEach(r => {
        drawRow(r.label, r.value);
    });

    ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.fillText('PRODUCTOS', detailX + 16, rowY);
    rowY += 20;

    items.forEach(item => {
        ctx.font = '500 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#E4E4E4';
        ctx.fillText(`${item.qty}x ${item.nombre}`, detailX + 24, rowY);

        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.textAlign = 'right';
        ctx.fillText(`$${(item.precio * item.qty).toLocaleString('es-CL')}`, detailX + detailW - 16, rowY);
        ctx.textAlign = 'left';

        rowY += 24;
    });

    ctx.beginPath();
    ctx.moveTo(detailX + 16, rowY - 4);
    ctx.lineTo(detailX + detailW - 16, rowY - 4);
    ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    rowY += 16;

    drawRow('Total', `$${pedido.total.toLocaleString('es-CL')}`, true);

    if (pedido.instrucciones) {
        ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.fillText('NOTAS', detailX + 16, rowY);

        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#E4E4E4';
        ctx.textAlign = 'right';
        ctx.fillText(pedido.instrucciones, detailX + detailW - 16, rowY);
        ctx.textAlign = 'left';

        ctx.beginPath();
        ctx.moveTo(detailX + 16, rowY + 18);
        ctx.lineTo(detailX + detailW - 16, rowY + 18);
        ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        rowY += 36;
    }

    // Nota cocina
    const notaText = 'Nuestra cocina está preparando los platos minuciosamente para honrar nuestra sazón. Recibirás un mensaje cuando tu pedido esté listo.';
    ctx.font = 'italic 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.textAlign = 'center';

    function wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentYPos = y;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentYPos);
                line = words[n] + ' ';
                currentYPos += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentYPos);
    }

    wrapText(notaText, circleX, detailY + detailH + 24, cardW - 60, 15);

    canvas.toBlob(function (blob) {
        if (!blob) return;

        // 1. Descargar la imagen
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Comanda_El_Tizzon_${pedido.nombre.replace(/\s+/g, '_')}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 2. Copiar al portapapeles
        try {
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
                alert("¡Imagen copiada al portapapeles y descargada! Ahora puedes pegarla (Ctrl+V / Pegar) en el chat de WhatsApp que se acaba de abrir.");
            }).catch(err => {
                console.error("No se pudo copiar al portapapeles automáticamente:", err);
                alert("Voucher descargado. Abre el chat de WhatsApp, copia la imagen descargada de tus archivos y envíala.");
            });
        } catch (e) {
            console.error("Clipboard API no soportada en este navegador:", e);
            alert("Voucher descargado correctamente en tus archivos.");
        }
    }, 'image/png');
}

function descargarVoucherPedidoOnly() {
    const pedido = window.ultimoPedido;
    if (!pedido) {
        alert("No hay detalles del último pedido registrados.");
        return;
    }

    const cardMargin = 15;
    const circleY = cardMargin + 50; // 65

    // Calcular la altura dinámica del canvas
    const rows = [
        { label: "Cliente", value: pedido.nombre },
        { label: "Teléfono", value: pedido.telefono },
        { label: "Entrega", value: pedido.modoEntrega === 'delivery' ? 'Despacho a Domicilio' : 'Retiro en Local' }
    ];
    if (pedido.modoEntrega === 'delivery' && pedido.direccion) {
        rows.push({ label: "Dirección", value: pedido.direccion });
    }

    const items = pedido.carritoItems || [];

    // Calcular la posición final del detalle
    let calcY = circleY + 95; // detailY
    calcY += 25; // primer padding del detail
    calcY += rows.length * 36; // filas de datos
    calcY += 20; // cabecera productos
    calcY += items.length * 24; // items de productos
    calcY += 16; // espacio separador total
    calcY += 36; // fila total
    if (pedido.instrucciones) {
        calcY += 36; // fila de notas
    }
    
    const detailH = (calcY - 8) - (circleY + 95);
    const notaCocinaH = 50; // margen para 3 lineas de texto envuelto
    const cardH = (circleY + 95) + detailH + 20 + notaCocinaH + 15;
    const canvasWidth = 460;
    const canvasHeight = cardH + (cardMargin * 2);

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Fondo oscuro de toda la imagen
    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Fondo y borde de tarjeta
    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardW = canvasWidth - (cardMargin * 2);
    const radius = 18;

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    ctx.fillStyle = '#1f1f1f';
    roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#2c2c2c';
    ctx.stroke();

    // Check Circle Cobre
    const circleX = canvasWidth / 2;
    const circleRadius = 26;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#c4836a';
    ctx.fill();

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#161616';
    ctx.fillText('🍳', circleX, circleY + 1);

    // Título
    ctx.font = '700 22px Playfair Display, Georgia, serif';
    ctx.fillStyle = '#c4836a';
    ctx.textAlign = 'center';
    ctx.fillText('¡Pedido Recibido!', circleX, circleY + 52);

    // Subtítulo
    ctx.font = 'italic 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.fillText('Tu orden ya ingresó a nuestra cocina', circleX, circleY + 74);

    // Caja de detalle interna
    const detailX = cardX + 20;
    const detailY = circleY + 95;
    const detailW = cardW - 40;

    ctx.fillStyle = '#161616';
    ctx.strokeStyle = '#2c2c2c';
    roundRect(detailX, detailY, detailW, detailH, 12);
    ctx.fill();
    ctx.stroke();

    // Filas
    let rowY = detailY + 25;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    function drawRow(labelText, valueText, isTotal = false) {
        ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.fillText(labelText.toUpperCase(), detailX + 16, rowY);

        if (isTotal) {
            ctx.font = '700 15px Plus Jakarta Sans, sans-serif';
            ctx.fillStyle = '#c4836a';
        } else {
            ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
            ctx.fillStyle = '#E4E4E4';
        }
        ctx.textAlign = 'right';
        ctx.fillText(valueText, detailX + detailW - 16, rowY);

        ctx.beginPath();
        ctx.moveTo(detailX + 16, rowY + 18);
        ctx.lineTo(detailX + detailW - 16, rowY + 18);
        ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'left';
        rowY += 36;
    }

    rows.forEach(r => {
        drawRow(r.label, r.value);
    });

    ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.fillText('PRODUCTOS', detailX + 16, rowY);
    rowY += 20;

    items.forEach(item => {
        ctx.font = '500 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#E4E4E4';
        ctx.fillText(`${item.qty}x ${item.nombre}`, detailX + 24, rowY);

        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.textAlign = 'right';
        ctx.fillText(`$${(item.precio * item.qty).toLocaleString('es-CL')}`, detailX + detailW - 16, rowY);
        ctx.textAlign = 'left';

        rowY += 24;
    });

    ctx.beginPath();
    ctx.moveTo(detailX + 16, rowY - 4);
    ctx.lineTo(detailX + detailW - 16, rowY - 4);
    ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    rowY += 16;

    drawRow('Total', `$${pedido.total.toLocaleString('es-CL')}`, true);

    if (pedido.instrucciones) {
        ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.fillText('NOTAS', detailX + 16, rowY);

        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#E4E4E4';
        ctx.textAlign = 'right';
        ctx.fillText(pedido.instrucciones, detailX + detailW - 16, rowY);
        ctx.textAlign = 'left';

        ctx.beginPath();
        ctx.moveTo(detailX + 16, rowY + 18);
        ctx.lineTo(detailX + detailW - 16, rowY + 18);
        ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        rowY += 36;
    }

    // Nota cocina
    const notaText = 'Nuestra cocina está preparando los platos minuciosamente para honrar nuestra sazón. Recibirás un mensaje cuando tu pedido esté listo.';
    ctx.font = 'italic 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.textAlign = 'center';

    function wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentYPos = y;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentYPos);
                line = words[n] + ' ';
                currentYPos += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentYPos);
    }

    wrapText(notaText, circleX, detailY + detailH + 24, cardW - 60, 15);

    // Solo descargar
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Comanda_El_Tizzon_${pedido.nombre.replace(/\s+/g, '_')}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function compartirWhatsAppVoucher() {
    const pedido = window.ultimoPedido;
    if (!pedido) {
        alert("No hay detalles del último pedido registrados.");
        return;
    }

    // 1. Copiar al portapapeles de forma silenciosa
    generarYCopiarVoucherSilencioso(pedido);

    // 2. Abrir WhatsApp
    let cleanPhone = pedido.telefono.replace(/\D/g, '');
    if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
        cleanPhone = '56' + cleanPhone;
    }
    const targetPhone = cleanPhone ? cleanPhone : '56967459137';
    
    // Crear el mensaje de WhatsApp estructurado
    let waItems = (pedido.carritoItems || []).map(item => `• *${item.qty}x* ${item.nombre} ($${(item.precio * item.qty).toLocaleString('es-CL')})`).join('\n');
    let mensaje = `*Detalle de tu Comanda - El Tizzón*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${pedido.nombre}
📞 *Teléfono:* ${pedido.telefono}
📦 *Entrega:* ${pedido.modoEntrega === 'delivery' ? 'Despacho a Domicilio' : 'Retiro en Local'}
${pedido.modoEntrega === 'delivery' && pedido.direccion ? `📍 *Dirección:* ${pedido.direccion}\n` : ''}🛒 *Productos:*
${waItems}
💵 *Total:* $${pedido.total.toLocaleString('es-CL')}
${pedido.instrucciones ? `📝 *Notas:* ${pedido.instrucciones}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━
¡Hola! Aquí tienes el resumen y voucher de tu comanda en El Tizzón.`;

    const urlWa = `https://wa.me/${targetPhone}?text=${encodeURIComponent(mensaje)}`;
    
    alert("¡Voucher copiado al portapapeles! Ahora se abrirá WhatsApp. Pega la imagen (Ctrl+V / Mantener presionado y Pegar) en el chat para enviarla.");
    window.open(urlWa, '_blank');
}

function generarYCopiarVoucherSilencioso(pedido) {
    const cardMargin = 15;
    const circleY = cardMargin + 50;

    const rows = [
        { label: "Cliente", value: pedido.nombre },
        { label: "Teléfono", value: pedido.telefono },
        { label: "Entrega", value: pedido.modoEntrega === 'delivery' ? 'Despacho a Domicilio' : 'Retiro en Local' }
    ];
    if (pedido.modoEntrega === 'delivery' && pedido.direccion) {
        rows.push({ label: "Dirección", value: pedido.direccion });
    }

    const items = pedido.carritoItems || [];

    // Calcular la posición final del detalle
    let calcY = circleY + 95; 
    calcY += 25; 
    calcY += rows.length * 36; 
    calcY += 20; 
    calcY += items.length * 24; 
    calcY += 16; 
    calcY += 36; 
    if (pedido.instrucciones) {
        calcY += 36; 
    }
    
    const detailH = (calcY - 8) - (circleY + 95);
    const notaCocinaH = 50;
    const cardH = (circleY + 95) + detailH + 20 + notaCocinaH + 15;
    const canvasWidth = 460;
    const canvasHeight = cardH + (cardMargin * 2);

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardW = canvasWidth - (cardMargin * 2);
    const radius = 18;

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    ctx.fillStyle = '#1f1f1f';
    roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#2c2c2c';
    ctx.stroke();

    const circleX = canvasWidth / 2;
    const circleRadius = 26;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#c4836a';
    ctx.fill();

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#161616';
    ctx.fillText('🍳', circleX, circleY + 1);

    ctx.font = '700 22px Playfair Display, Georgia, serif';
    ctx.fillStyle = '#c4836a';
    ctx.textAlign = 'center';
    ctx.fillText('¡Pedido Recibido!', circleX, circleY + 52);

    ctx.font = 'italic 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.fillText('Tu orden ya ingresó a nuestra cocina', circleX, circleY + 74);

    const detailX = cardX + 20;
    const detailY = circleY + 95;
    const detailW = cardW - 40;

    ctx.fillStyle = '#161616';
    ctx.strokeStyle = '#2c2c2c';
    roundRect(detailX, detailY, detailW, detailH, 12);
    ctx.fill();
    ctx.stroke();

    let rowY = detailY + 25;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    function drawRow(labelText, valueText, isTotal = false) {
        ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.fillText(labelText.toUpperCase(), detailX + 16, rowY);

        if (isTotal) {
            ctx.font = '700 15px Plus Jakarta Sans, sans-serif';
            ctx.fillStyle = '#c4836a';
        } else {
            ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
            ctx.fillStyle = '#E4E4E4';
        }
        ctx.textAlign = 'right';
        ctx.fillText(valueText, detailX + detailW - 16, rowY);

        ctx.beginPath();
        ctx.moveTo(detailX + 16, rowY + 18);
        ctx.lineTo(detailX + detailW - 16, rowY + 18);
        ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'left';
        rowY += 36;
    }

    rows.forEach(r => {
        drawRow(r.label, r.value);
    });

    ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.fillText('PRODUCTOS', detailX + 16, rowY);
    rowY += 20;

    items.forEach(item => {
        ctx.font = '500 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#E4E4E4';
        ctx.fillText(`${item.qty}x ${item.nombre}`, detailX + 24, rowY);

        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.textAlign = 'right';
        ctx.fillText(`$${(item.precio * item.qty).toLocaleString('es-CL')}`, detailX + detailW - 16, rowY);
        ctx.textAlign = 'left';

        rowY += 24;
    });

    ctx.beginPath();
    ctx.moveTo(detailX + 16, rowY - 4);
    ctx.lineTo(detailX + detailW - 16, rowY - 4);
    ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    rowY += 16;

    drawRow('Total', `$${pedido.total.toLocaleString('es-CL')}`, true);

    if (pedido.instrucciones) {
        ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#a09590';
        ctx.fillText('NOTAS', detailX + 16, rowY);

        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#E4E4E4';
        ctx.textAlign = 'right';
        ctx.fillText(pedido.instrucciones, detailX + detailW - 16, rowY);
        ctx.textAlign = 'left';

        ctx.beginPath();
        ctx.moveTo(detailX + 16, rowY + 18);
        ctx.lineTo(detailX + detailW - 16, rowY + 18);
        ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        rowY += 36;
    }

    const notaText = 'Nuestra cocina está preparando los platos minuciosamente para honrar nuestra sazón.';
    ctx.font = 'italic 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.textAlign = 'center';

    function wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentYPos = y;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentYPos);
                line = words[n] + ' ';
                currentYPos += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentYPos);
    }

    wrapText(notaText, circleX, detailY + detailH + 24, cardW - 60, 15);

    canvas.toBlob(function (blob) {
        if (!blob) return;

        // Descargar la comanda
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Comanda_El_Tizzon_${pedido.nombre.replace(/\s+/g, '_')}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Copiar al portapapeles
        try {
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
        } catch (e) {
            console.error("No se pudo copiar automáticamente en segundo plano:", e);
        }
    }, 'image/png');
}

function descargarVoucherReservaOnly() {
    const reserva = window.ultimaReserva;
    if (!reserva) {
        alert("No hay detalles de la última reserva registrados.");
        return;
    }

    const cardMargin = 15;
    const circleY = cardMargin + 50;

    const rows = [
        { label: "Cliente", value: reserva.nombre },
        { label: "Fecha", value: reserva.fechaLegible },
        { label: "Turno", value: `${reserva.hora} hrs` },
        { label: "Sector", value: reserva.sectorLabel },
        { label: "Mesa(s)", value: `Mesa(s) Nº ${reserva.mesa}` },
        { label: "Personas", value: `${reserva.pax} pax` },
        { label: "Contacto", value: reserva.telefono }
    ];

    let calcY = circleY + 95;
    calcY += 25;
    calcY += rows.length * 36;

    const detailH = (calcY - 8) - (circleY + 95);
    const notaH = 40;
    const cardH = (circleY + 95) + detailH + 20 + notaH + 15;
    const canvasWidth = 460;
    const canvasHeight = cardH + (cardMargin * 2);

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardW = canvasWidth - (cardMargin * 2);
    const radius = 18;

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    ctx.fillStyle = '#1f1f1f';
    roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#2c2c2c';
    ctx.stroke();

    const circleX = canvasWidth / 2;
    const circleRadius = 26;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#c4836a';
    ctx.fill();

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#161616';
    ctx.fillText('✓', circleX, circleY + 1);

    ctx.font = '700 22px Playfair Display, Georgia, serif';
    ctx.fillStyle = '#c4836a';
    ctx.textAlign = 'center';
    ctx.fillText('¡Mesa Reservada!', circleX, circleY + 52);

    ctx.font = 'italic 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.fillText('Tu reserva ha sido registrada con éxito', circleX, circleY + 74);

    const detailX = cardX + 20;
    const detailY = circleY + 95;
    const detailW = cardW - 40;

    ctx.fillStyle = '#161616';
    ctx.strokeStyle = '#2c2c2c';
    roundRect(detailX, detailY, detailW, detailH, 12);
    ctx.fill();
    ctx.stroke();

    let rowY = detailY + 25;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    function drawRow(labelText, valueText) {
        ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#9e938f';
        ctx.fillText(labelText.toUpperCase(), detailX + 16, rowY);

        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#E4E4E4';
        ctx.textAlign = 'right';
        ctx.fillText(valueText, detailX + detailW - 16, rowY);

        ctx.beginPath();
        ctx.moveTo(detailX + 16, rowY + 18);
        ctx.lineTo(detailX + detailW - 16, rowY + 18);
        ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'left';
        rowY += 36;
    }

    rows.forEach(r => {
        drawRow(r.label, r.value);
    });

    const notaText = 'Te esperamos en El Tizzón · Recuerda presentarte 10 minutos antes.';
    ctx.font = 'italic 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#c8beba';
    ctx.textAlign = 'center';
    ctx.fillText(notaText, circleX, detailY + detailH + 24);

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Reserva_El_Tizzon_${reserva.nombre.replace(/\s+/g, '_')}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function compartirWhatsAppReserva() {
    const reserva = window.ultimaReserva;
    if (!reserva) {
        alert("No hay detalles de la reserva registrados.");
        return;
    }

    generarYCopiarVoucherReservaSilencioso(reserva);

    let cleanPhone = reserva.telefono.replace(/\D/g, '');
    if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
        cleanPhone = '56' + cleanPhone;
    }
    const targetPhone = cleanPhone ? cleanPhone : '56967459137';

    const mensaje = `*Confirmación de Reserva - El Tizzón*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${reserva.nombre}
📅 *Fecha:* ${reserva.fechaLegible}
⏰ *Hora:* ${reserva.hora} hrs
📍 *Sector:* ${reserva.sectorLabel}
🪑 *Mesa(s):* Nº ${reserva.mesa}
👥 *Capacidad:* ${reserva.pax} personas
📞 *Contacto:* ${reserva.telefono}
━━━━━━━━━━━━━━━━━━━━━━━━━━
¡Hola! Aquí tienes el resumen y voucher de tu reserva en El Tizzón. ¡Te esperamos!`;

    const urlWa = `https://wa.me/${targetPhone}?text=${encodeURIComponent(mensaje)}`;
    alert("¡Voucher copiado al portapapeles! Ahora se abrirá WhatsApp. Pega la imagen (Ctrl+V) en el chat para enviarla.");
    window.open(urlWa, '_blank');
}

function generarYCopiarVoucherReservaSilencioso(reserva) {
    const cardMargin = 15;
    const circleY = cardMargin + 50;

    const rows = [
        { label: "Cliente", value: reserva.nombre },
        { label: "Fecha", value: reserva.fechaLegible },
        { label: "Turno", value: `${reserva.hora} hrs` },
        { label: "Sector", value: reserva.sectorLabel },
        { label: "Mesa(s)", value: `Mesa(s) Nº ${reserva.mesa}` },
        { label: "Personas", value: `${reserva.pax} pax` },
        { label: "Contacto", value: reserva.telefono }
    ];

    let calcY = circleY + 95;
    calcY += 25;
    calcY += rows.length * 36;

    const detailH = (calcY - 8) - (circleY + 95);
    const notaH = 40;
    const cardH = (circleY + 95) + detailH + 20 + notaH + 15;
    const canvasWidth = 460;
    const canvasHeight = cardH + (cardMargin * 2);

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = '#161616';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardW = canvasWidth - (cardMargin * 2);
    const radius = 18;

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    ctx.fillStyle = '#1f1f1f';
    roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#2c2c2c';
    ctx.stroke();

    const circleX = canvasWidth / 2;
    const circleRadius = 26;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#c4836a';
    ctx.fill();

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#161616';
    ctx.fillText('✓', circleX, circleY + 1);

    ctx.font = '700 22px Playfair Display, Georgia, serif';
    ctx.fillStyle = '#c4836a';
    ctx.textAlign = 'center';
    ctx.fillText('¡Mesa Reservada!', circleX, circleY + 52);

    ctx.font = 'italic 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#a09590';
    ctx.fillText('Tu reserva ha sido registrada con éxito', circleX, circleY + 74);

    const detailX = cardX + 20;
    const detailY = circleY + 95;
    const detailW = cardW - 40;

    ctx.fillStyle = '#161616';
    ctx.strokeStyle = '#2c2c2c';
    roundRect(detailX, detailY, detailW, detailH, 12);
    ctx.fill();
    ctx.stroke();

    let rowY = detailY + 25;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    function drawRow(labelText, valueText) {
        ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#9e938f';
        ctx.fillText(labelText.toUpperCase(), detailX + 16, rowY);

        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#E4E4E4';
        ctx.textAlign = 'right';
        ctx.fillText(valueText, detailX + detailW - 16, rowY);

        ctx.beginPath();
        ctx.moveTo(detailX + 16, rowY + 18);
        ctx.lineTo(detailX + detailW - 16, rowY + 18);
        ctx.strokeStyle = 'rgba(44, 44, 44, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'left';
        rowY += 36;
    }

    rows.forEach(r => {
        drawRow(r.label, r.value);
    });

    const notaText = 'Te esperamos en El Tizzón · Recuerda presentarte 10 minutos antes.';
    ctx.font = 'italic 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#c8beba';
    ctx.textAlign = 'center';
    ctx.fillText(notaText, circleX, detailY + detailH + 24);

    canvas.toBlob(function (blob) {
        if (!blob) return;

        // Descargar la reserva
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Reserva_El_Tizzon_${reserva.nombre.replace(/\s+/g, '_')}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Copiar al portapapeles
        try {
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
        } catch (e) {
            console.error("No se pudo copiar automáticamente la reserva en segundo plano:", e);
        }
    }, 'image/png');
}

function cerrarConfirmacionPedido() {
    const modal = document.getElementById('pedidoConfirmModal');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300);
        releaseFocus();
    }
}

function inicializarScrollHorizontal(elementId) {
    const slider = document.getElementById(elementId);
    if (!slider) return;

    // Variables y funciones para el auto-desplazamiento
    let animationFrameId = null;
    let scrollSpeed = 0;

    function startAutoScroll() {
        if (animationFrameId) return;
        const scrollStep = () => {
            if (scrollSpeed !== 0) {
                slider.scrollLeft += scrollSpeed;
                actualizarScrollShadows(slider);
            }
            animationFrameId = requestAnimationFrame(scrollStep);
        };
        animationFrameId = requestAnimationFrame(scrollStep);
    }

    function stopAutoScroll() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        scrollSpeed = 0;
    }

    // Redireccionar rueda del mouse vertical a horizontal
    slider.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            slider.scrollLeft += e.deltaY * 0.8;
            actualizarScrollShadows(slider);
        }
    }, { passive: false });

    // Control de eventos de mouse consolidado para auto-desplazamiento y realce
    slider.addEventListener('mousemove', (e) => {
        const rect = slider.getBoundingClientRect();
        const mouseX = e.clientX;
        const viewportWidth = window.innerWidth;
        
        // Zona de activación: 180px para una transición de realce más suave y gradual
        const edgeZone = 180;
        
        // Calcular distancias a los bordes izquierdo/derecho del viewport y del propio contenedor
        const distToLeftViewport = mouseX;
        const distToRightViewport = viewportWidth - mouseX;
        const distToLeftContainer = mouseX - rect.left;
        const distToRightContainer = rect.right - mouseX;

        // Decidir si está cerca del borde izquierdo o derecho
        const nearLeft = distToLeftViewport < edgeZone || distToLeftContainer < edgeZone;
        const nearRight = distToRightViewport < edgeZone || distToRightContainer < edgeZone;

        // Calcular la proximidad (de 0 a 1) para el realce visual dinámico en CSS
        let proximity = 0;
        if (nearLeft) {
            const minDist = Math.min(distToLeftViewport, distToLeftContainer);
            proximity = Math.max(0, Math.min(1, (edgeZone - minDist) / edgeZone));
        } else if (nearRight) {
            const minDist = Math.min(distToRightViewport, distToRightContainer);
            proximity = Math.max(0, Math.min(1, (edgeZone - minDist) / edgeZone));
        }

        // Aplicar la proximidad como variable CSS para que los bordes y el fondo brillen progresivamente
        slider.style.setProperty('--edge-proximity', proximity.toFixed(2));

        // Lógica de auto-desplazamiento al acercarse a las orillas
        if (nearLeft && !nearRight) {
            const minDist = Math.min(distToLeftViewport, distToLeftContainer);
            const intensity = Math.max(0, Math.min(1, (edgeZone - minDist) / edgeZone));
            scrollSpeed = -intensity * 12; // Velocidad máxima de 12px por frame
            startAutoScroll();
        } else if (nearRight && !nearLeft) {
            const minDist = Math.min(distToRightViewport, distToRightContainer);
            const intensity = Math.max(0, Math.min(1, (edgeZone - minDist) / edgeZone));
            scrollSpeed = intensity * 12; // Velocidad máxima de 12px por frame
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    });

    slider.addEventListener('mouseleave', () => {
        stopAutoScroll();
        slider.style.setProperty('--edge-proximity', '0');
    });
}

/* ─────────────────────────────────────────
   HORARIOS DINÁMICOS POR DÍA
───────────────────────────────────────── */

// Turnos por día de la semana (0 = Domingo, 1 = Lunes ... 6 = Sábado)
// Horarios de atención y reserva por día (0 = Domingo, 1 = Lunes ... 6 = Sábado)
// La última reserva se puede realizar hasta media hora antes del cierre.
const HORARIOS_ATENCION = {
    1: { start: "12:30", end: "22:30" }, // Lunes (cierre 23:00)
    2: { start: "12:30", end: "22:30" }, // Martes (cierre 23:00)
    3: { start: "12:30", end: "22:30" }, // Miércoles (cierre 23:00)
    4: { start: "12:30", end: "22:30" }, // Jueves (cierre 23:00)
    5: { start: "12:30", end: "23:30" }, // Viernes (cierre 00:00)
    6: { start: "12:30", end: "23:30" }, // Sábado (cierre 00:00)
    0: { start: "12:30", end: "16:30" }  // Domingo (cierre 17:00)
};

function actualizarHorariosSegunFecha() {
    const fechaInput = document.getElementById('res_fecha');
    const horaInput = document.getElementById('res_hora');
    if (!fechaInput || !horaInput) return;

    const fechaStr = fechaInput.value;
    if (!fechaStr) {
        horaInput.innerHTML = '<option value="">-- Elige la hora --</option>';
        return;
    }

    // Parsear la fecha como local (evitar desfase UTC)
    const [yr, mo, dy] = fechaStr.split('-').map(Number);
    const diaSemana = new Date(yr, mo - 1, dy).getDay(); // 0=Dom, 1=Lun...

    const rango = HORARIOS_ATENCION[diaSemana];
    if (!rango) {
        horaInput.innerHTML = '<option value="">-- Elige la hora --</option>';
        return;
    }

    // Intentar rescatar la hora seleccionada anteriormente
    const valorPrevio = horaInput.value;

    // Poblar las opciones en intervalos de 15 minutos
    horaInput.innerHTML = "";
    
    const startMins = parseTimeToMinutes(rango.start);
    const endMins = parseTimeToMinutes(rango.end);

    if (startMins !== null && endMins !== null) {
        for (let time = startMins; time <= endMins; time += 15) {
            const hrs = Math.floor(time / 60);
            const mins = time % 60;
            const hrStr = String(hrs).padStart(2, '0');
            const minStr = String(mins).padStart(2, '0');
            const timeStr = `${hrStr}:${minStr}`;

            const option = document.createElement("option");
            option.value = timeStr;
            option.textContent = `${timeStr} hrs`;
            horaInput.appendChild(option);
        }
    }

    // Intentar restaurar el valor previo si todavía es válido
    if (valorPrevio && parseTimeToMinutes(valorPrevio) >= startMins && parseTimeToMinutes(valorPrevio) <= endMins) {
        horaInput.value = valorPrevio;
    } else {
        horaInput.value = rango.start;
    }

    // Redibujar el mapa con el horario seleccionado
    dibujarMapaMesas();
}

function validarYFijarHoraInput() {
    // No-op. El select restringe las entradas a horas válidas automáticamente.
}

window.addEventListener('DOMContentLoaded', async () => {
    renderCarta(null);
    cargarReservasPlanilla();
    await cargarCartaLocal();
    setModoEntrega('takeaway');
    inicializarScrollHorizontal('subcategoriesContainer');
    inicializarScrollHorizontal('categoriesContainer');
    updateCartUI();

    const dateInput = document.getElementById('res_fecha');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;

        // Poblar horarios correspondientes al día de hoy al cargar la página
        actualizarHorariosSegunFecha();
    }

    const horaInput = document.getElementById('res_hora');
    if (horaInput) {
        horaInput.addEventListener('change', () => {
            dibujarMapaMesas();
        });
    }

    // Cerrar el panel del carrito al hacer clic afuera
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('cartPanel');
        const toggleBtn = document.querySelector('.sidebar-cart-toggle');
        const navCartBtn = document.querySelector('.navbar-cart-btn');
        if (!panel || !panel.classList.contains('open')) return;

        // Evitar cerrar si se hace clic en botones de agregar plato o controles de cantidad del carrito
        if (e.target.closest('.btn-add') || e.target.closest('.cart-qty-btn') || e.target.closest('.cart-delete-btn')) return;

        // Si el elemento fue removido del DOM durante la actualización del carrito (ej. botones + / - o eliminar), evitar cerrar
        if (!document.documentElement.contains(e.target)) return;

        // Si el clic es fuera del panel y fuera de los botones de alternar (flotante y navbar), cerrar
        const isToggleClick = (toggleBtn && toggleBtn.contains(e.target)) || (navCartBtn && navCartBtn.contains(e.target));
        if (!panel.contains(e.target) && !isToggleClick) {
            toggleCartPanel();
        }
    });

    // Forzar HTTPS en producción (Chile Ley de protección de datos / Seguridad)
    if (location.protocol === 'http:' && !location.hostname.includes('localhost') && !location.hostname.includes('127.0.0.1')) {
        location.replace('https://' + location.hostname + location.pathname + location.search + location.hash);
    }
    
    verificarConsentimientoCookies();
});

/* ─────────────────────────────────────────
   HELPER FUNCTIONS: SEGURIDAD (SANITIZACIÓN) Y ACCESIBILIDAD (FOCUS LOCK)
   ───────────────────────────────────────── */

function sanitizarEntrada(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>/g, '') // Eliminar tags HTML (Anti XSS)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '')
        .trim();
}

let activeFocusTrap = null;
let previousActiveElement = null;

function lockFocus(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    previousActiveElement = document.activeElement;

    // Obtener todos los elementos enfocables del modal
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));
    if (focusableElements.length === 0) return;

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    // Dar foco inicial
    setTimeout(() => {
        if (firstEl && typeof firstEl.focus === 'function') firstEl.focus();
    }, 100);

    // Evitar acumulaciones previas
    if (activeFocusTrap) {
        modal.removeEventListener('keydown', activeFocusTrap);
    }

    activeFocusTrap = function(e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstEl) {
                lastEl.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastEl) {
                firstEl.focus();
                e.preventDefault();
            }
        }
    };

    modal.addEventListener('keydown', activeFocusTrap);
}

function releaseFocus() {
    if (activeFocusTrap) {
        // Remover de cualquier modal que lo tenga asignado
        const activeModal = document.querySelector('.reserva-modal-overlay.visible, .privacy-modal-overlay.visible');
        if (activeModal) {
            activeModal.removeEventListener('keydown', activeFocusTrap);
        }
        activeFocusTrap = null;
    }
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
        previousActiveElement = null;
    }
}

/* ─────────────────────────────────────────
   SISTEMA DE COOKIES Y CUMPLIMIENTO LEY 19.628
   ───────────────────────────────────────── */

function verificarConsentimientoCookies() {
    const cachedPreferences = localStorage.getItem('tizoon_cookie_preferences');
    if (!cachedPreferences) {
        setTimeout(() => {
            const banner = document.getElementById('cookieConsentBanner');
            if (banner) banner.classList.add('show');
        }, 1000);
    } else {
        try {
            const prefs = JSON.parse(cachedPreferences);
            inicializarScriptsDeSeguimiento(prefs);
        } catch (e) {
            console.error("Error al leer preferencias de cookies:", e);
        }
    }
}

function aceptarTodasCookies() {
    const prefs = { necesarias: true, estadisticas: true, marketing: true };
    localStorage.setItem('tizoon_cookie_preferences', JSON.stringify(prefs));
    cerrarBannerCookies();
    inicializarScriptsDeSeguimiento(prefs);
}

function rechazarTodasCookies() {
    const prefs = { necesarias: true, estadisticas: false, marketing: false };
    localStorage.setItem('tizoon_cookie_preferences', JSON.stringify(prefs));
    cerrarBannerCookies();
    inicializarScriptsDeSeguimiento(prefs);
}

function abrirConfiguracionCookies() {
    const configModal = document.getElementById('cookieConfigModal');
    if (configModal) {
        const cachedPreferences = localStorage.getItem('tizoon_cookie_preferences');
        if (cachedPreferences) {
            try {
                const prefs = JSON.parse(cachedPreferences);
                const statsCheck = document.getElementById('cookie_stats');
                const marketingCheck = document.getElementById('cookie_marketing');
                if (statsCheck) statsCheck.checked = !!prefs.estadisticas;
                if (marketingCheck) marketingCheck.checked = !!prefs.marketing;
            } catch (e) {}
        }
        configModal.style.display = 'flex';
        setTimeout(() => configModal.classList.add('visible'), 50);
    }
}

function cerrarConfiguracionCookies() {
    const configModal = document.getElementById('cookieConfigModal');
    if (configModal) {
        configModal.classList.remove('visible');
        setTimeout(() => configModal.style.display = 'none', 300);
    }
}

function guardarPreferenciasCookies() {
    const statsVal = document.getElementById('cookie_stats')?.checked || false;
    const marketingVal = document.getElementById('cookie_marketing')?.checked || false;
    const prefs = { necesarias: true, estadisticas: statsVal, marketing: marketingVal };
    localStorage.setItem('tizoon_cookie_preferences', JSON.stringify(prefs));
    cerrarConfiguracionCookies();
    cerrarBannerCookies();
    inicializarScriptsDeSeguimiento(prefs);
}

function cerrarBannerCookies() {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) banner.classList.remove('show');
}

function inicializarScriptsDeSeguimiento(prefs) {
    console.log("Inicializando scripts según preferencias de cookies:", prefs);
    if (prefs.estadisticas) {
        console.log("-> Cookies de estadísticas permitidas (Carga de Google Analytics u otros permitida).");
        if (!window.gaTrackingInitialized) {
            window.gaTrackingInitialized = true;
        }
    } else {
        console.log("-> Cookies de estadísticas bloqueadas/desactivadas.");
    }

    if (prefs.marketing) {
        console.log("-> Cookies de marketing permitidas (Carga de Meta Pixel / Google Ads permitida).");
        if (!window.marketingTrackingInitialized) {
            window.marketingTrackingInitialized = true;
        }
    } else {
        console.log("-> Cookies de marketing bloqueadas/desactivadas.");
    }
}

/* ─────────────────────────────────────────
   MODAL DE PRIVACIDAD Y DERECHOS ARCO+P
   ───────────────────────────────────────── */

function abrirModalPrivacidad() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 50);
    }
}

function cerrarModalPrivacidad() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

function procesarFormularioARCO(event) {
    event.preventDefault();
    const nombre = document.getElementById('arco_nombre')?.value || '';
    const telefono = document.getElementById('arco_telefono')?.value || '';
    const derecho = document.getElementById('arco_derecho')?.value || '';
    const descripcion = document.getElementById('arco_descripcion')?.value || '';

    const cleanPhone = telefono.replace(/\D/g, '');

    // Registrar requerimiento en Google Sheets
    const bodyData = {
        tipo: 'ARCO_P',
        nombre: nombre,
        telefono: cleanPhone,
        derecho: derecho,
        descripcion: descripcion,
        timestamp: new Date().toISOString()
    };

    if (GOOGLE_SHEETS_APP_SCRIPT_URL) {
        fetch(GOOGLE_SHEETS_APP_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        }).catch(err => console.error("Error al registrar ARCO en Sheets:", err));
    }

    // Generar mensaje formal para WhatsApp del administrador
    const waMsg = `*SOLICITUD DERECHOS ARCO+P - EL TIZZÓN*\n\n` +
                  `*Cliente:* ${nombre}\n` +
                  `*Teléfono:* ${telefono}\n` +
                  `*Derecho ejercido:* ${derecho}\n` +
                  `*Detalle:* ${descripcion}\n\n` +
                  `Solicito procesar este requerimiento de forma gratuita de acuerdo con la Ley N° 19.628 de protección de datos personales.`;

    const waUrl = `https://wa.me/56967459137?text=${encodeURIComponent(waMsg)}`;
    
    alert("Tu solicitud de derechos ARCO+P ha sido generada con éxito. Te redirigiremos a nuestro canal de WhatsApp para que envíes el requerimiento formal de inmediato.");
    
    cerrarModalPrivacidad();
    
    window.open(waUrl, '_blank');
    document.getElementById('arcoForm')?.reset();
}
