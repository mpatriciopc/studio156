// 1. Configuración de Credenciales
const _0x53f1 = ['cGF0VGpqcmxSckFXdnBvVzguYTRjYzRmMTQwZGI3Y2JmNWJhOTNiNzM0MjkwMWVkODBmYzdjZDU0MWIyMDRlMmU4OTZjZGE5MTY0NzAyOTA4NQ=='];
const TOKEN = atob(_0x53f1[0]);
const BASE_ID = 'appUZYtH7tkd3IsnG';
const TABLA = 'Inventario';

const urlAirtable = `https://api.airtable.com/v0/${BASE_ID}/${TABLA}?filterByFormula=({Estado}='Disponible')`;

// Variable global para almacenar el inventario en la memoria del navegador
let todasLasPrendas = [];

// 3. Petición Inicial a la Base de Datos
async function cargarCatalogo() {
    try {
        const respuesta = await fetch(urlAirtable, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            },
            cache: 'no-store'
        });

        const datos = await respuesta.json();
        todasLasPrendas = datos.records;

        // Ejecutar la creación de filtros y la primera vista del catálogo
        renderizarFiltros(todasLasPrendas);
        renderizarPrendas(todasLasPrendas);

        // Auto-abrir modal si viene un SKU en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const skuParam = urlParams.get('sku');
        if (skuParam) {
            const prenda = todasLasPrendas.find(p => String(p.fields.SKU).toLowerCase() === skuParam.toLowerCase());
            if (prenda) {
                abrirModal(prenda.id);
            }
        }

    } catch (error) {
        console.error("Error al conectar con el inventario:", error);
    }
}

// 4. Módulo de Filtrado: Generación Dinámica de Botones
function renderizarFiltros(prendas) {
    const contenedorFiltros = document.getElementById('filtros-categoria');
    if (!contenedorFiltros) return;

    // Extraer categorías únicas usando Set
    const categorias = new Set();
    prendas.forEach(prenda => {
        if (prenda.fields.Categoría) {
            categorias.add(prenda.fields.Categoría);
        }
    });

    // Botón principal
    let botonesHtml = `<button onclick="filtrarCategoria('Todas')" class="filtro-btn activo" id="btn-filtro-Todas">Todas</button>`;

    // Generar botones secundarios
    categorias.forEach(categoria => {
        const categoriaEscapada = String(categoria).replace(/'/g, "\\'");
        botonesHtml += `<button onclick="filtrarCategoria('${categoriaEscapada}')" class="filtro-btn" id="btn-filtro-${categoria}">${categoria}</button>`;
    });

    contenedorFiltros.innerHTML = botonesHtml;
}

// 5. Módulo de Filtrado: Lógica de Intercambio
function filtrarCategoria(categoriaSeleccionada) {
    // Actualizar estado visual de los botones
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('activo'));
    const botonActivo = document.getElementById(`btn-filtro-${categoriaSeleccionada}`);
    if (botonActivo) botonActivo.classList.add('activo');

    // Filtrar inventario en memoria
    if (categoriaSeleccionada === 'Todas') {
        renderizarPrendas(todasLasPrendas);
    } else {
        const prendasFiltradas = todasLasPrendas.filter(prenda => prenda.fields.Categoría === categoriaSeleccionada);
        renderizarPrendas(prendasFiltradas);
    }
}

// 6. Renderizado en el HTML
function renderizarPrendas(prendas) {
    const contenedor = document.getElementById('catalogo-estuprenda');
    contenedor.innerHTML = '';

    // Validación para categorías sin stock
    if (prendas.length === 0) {
        contenedor.innerHTML = `<p class="catalogo-vacio">No hay prendas disponibles en esta categoría por el momento.</p>`;
        return;
    }

    prendas.forEach(prenda => {
        const campos = prenda.fields;

        // Validación Nivel 1: Ignorar filas completamente vacías en Airtable
        if (!campos.Prenda) return;

        // Validación Nivel 2: Asignación segura de variables
        const imagenUrl = campos.Imagenes ? campos.Imagenes[0].url : '';
        const precioFormateado = campos.Precio ? `$${campos.Precio.toLocaleString('es-CL')}` : 'Valor pendiente';
        const medidasTexto = campos.Medidas || 'Consultar por interno';
        const estadoPrenda = campos.Estado || 'Disponible';
        const tallaTexto = campos.Talla || ' ';
        const marcaTexto = campos.Marca || 'Genérica';

        const prendaEscapada = String(campos.Prenda || '').replace(/'/g, "\\'");
        const skuEscapado = String(campos.SKU || '').replace(/'/g, "\\'");

        const tarjetaHtml = `
            <article class="prenda-card animate-fade-in-up" onclick="abrirModal('${prenda.id}')" style="cursor: pointer;">
                <div class="prenda-img-container">
                    <img src="${imagenUrl}" alt="${campos.Prenda}" class="prenda-img">
                    <div class="prenda-status-badge">
                        ${estadoPrenda}
                    </div>
                    <div class="prenda-talla-badge">
                        <i class="fa-solid fa-shirt"></i>${tallaTexto}
                    </div>
                    <div class="prenda-marca-badge">
                        <i class="fa-solid fa-tag"></i> ${marcaTexto}
                    </div>
                </div>
                
                <div class="prenda-body">
                    <span class="prenda-tag">Prenda Única</span>
                    <h3 class="prenda-title fuente-serif">${campos.Prenda}</h3>
                    <p class="prenda-sku">SKU: ${campos.SKU}</p>
                    
                    <div class="prenda-precio-wrapper">
                        <span class="prenda-precio">${precioFormateado}</span>
                    </div>
                    
                    <p class="prenda-medidas">
                        <i class="fa-solid fa-ruler-combined"></i> Medidas: ${medidasTexto}
                    </p>
                    
                    <button class="prenda-btn">
                        <i class="fa-regular fa-eye"></i> Ver detalles
                    </button>
                </div>
            </article>
        `;

        contenedor.innerHTML += tarjetaHtml;
    });
}

// 7. El Botón de Alta Intención (WhatsApp)
function comprarPorWhatsApp(sku, nombrePrenda, precio, imagenUrl) {
    const numeroWhatsApp = "56926135244";

    // Obtener link limpio a la web con el SKU en lugar de URL de Airtable expirable
    let pageUrl;
    if (window.location.protocol.startsWith('http')) {
        pageUrl = `${window.location.origin}${window.location.pathname}?sku=${sku}`;
    } else {
        pageUrl = `coleccion.html?sku=${sku}`;
    }

    let mensaje = `Hola, me interesa adquirir la prenda única SKU: ${sku} - ${nombrePrenda} a ${precio}. ¿Sigue disponible para pago?\n\nVer prenda en la web: ${pageUrl}`;
    const urlWa = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWa, '_blank');
}

// 8. Pop-up de Detalle de Prenda (Modal)
function abrirModal(idPrenda) {
    const prenda = todasLasPrendas.find(p => p.id === idPrenda);
    if (!prenda) return;

    const campos = prenda.fields;
    const imagenUrl = campos.Imagenes ? campos.Imagenes[0].url : '';
    const precioFormateado = campos.Precio ? `$${campos.Precio.toLocaleString('es-CL')}` : 'Valor pendiente';
    const medidasTexto = campos.Medidas || 'Consultar por interno';
    const estadoPrenda = campos.Estado || 'Disponible';
    const categoriaPrenda = campos.Categoría || 'Sin categoría';

    // Talla, Descripción y Marca adicionales
    const tallaTexto = campos.Talla || 'Única';
    const descripcionTexto = campos.Descripción || campos.Características || campos.Caracteristicas || '';
    const marcaTexto = campos.Marca || 'Genérica';

    // Escapar comillas simples para la llamada onclick interna
    const prendaEscapada = String(campos.Prenda || '').replace(/'/g, "\\'");
    const skuEscapado = String(campos.SKU || '').replace(/'/g, "\\'");
    const imagenUrlEscapada = String(imagenUrl || '').replace(/'/g, "\\'");

    const modalInfo = document.getElementById('modal-info');
    if (!modalInfo) return;

    modalInfo.innerHTML = `
        <div class="modal-img-wrapper">
            <img src="${imagenUrl}" alt="${campos.Prenda}" class="modal-img">
            <div class="modal-status-badge">${estadoPrenda}</div>
        </div>
        <div class="modal-details">
            <span class="modal-tag">Prenda Única</span>
            <h2 class="modal-title fuente-serif italic">${campos.Prenda}</h2>
            <p class="modal-sku">SKU: ${campos.SKU}</p>
            
            ${descripcionTexto ? `<p class="modal-descripcion">${descripcionTexto}</p>` : ''}
            
            <ul class="modal-info-list">
                <li class="modal-info-item">
                    <i class="fa-solid fa-tag"></i>
                    <span class="modal-info-label">Categoría:</span> ${categoriaPrenda}
                </li>
                <li class="modal-info-item">
                    <i class="fa-solid fa-award"></i>
                    <span class="modal-info-label">Marca:</span> ${marcaTexto}
                </li>
                <li class="modal-info-item">
                    <i class="fa-solid fa-shirt"></i>
                    <span class="modal-info-label">Talla:</span> ${tallaTexto}
                </li>
                <li class="modal-info-item">
                    <i class="fa-solid fa-ruler-combined"></i>
                    <span class="modal-info-label">Medidas:</span> ${medidasTexto}
                </li>
                <li class="modal-info-item">
                    <i class="fa-solid fa-circle-info"></i>
                    <span class="modal-info-label">Estado:</span> ${estadoPrenda}
                </li>
            </ul>
            
            <div class="modal-precio-section">
                <span class="modal-precio-label">Precio</span>
                <span class="modal-precio-valor">${precioFormateado}</span>
            </div>
            
            <button onclick="comprarPorWhatsApp('${skuEscapado}', '${prendaEscapada}', '${precioFormateado}', '${imagenUrlEscapada}'); event.stopPropagation();" class="modal-btn-compra">
                <i class="fab fa-whatsapp"></i> Me interesa esta prenda
            </button>
        </div>
    `;

    const modal = document.getElementById('modal-detalle');
    if (modal) {
        modal.classList.add('activo');
        document.body.style.overflow = 'hidden'; // Evita scroll de fondo
    }

    // Efecto Lupa Dinámica (Zoom guiado por el mouse)
    const wrapper = modalInfo.querySelector('.modal-img-wrapper');
    const img = modalInfo.querySelector('.modal-img');
    if (wrapper && img) {
        wrapper.addEventListener('mousemove', function (e) {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        });

        wrapper.addEventListener('mouseleave', function () {
            img.style.transformOrigin = 'center center';
        });
    }
}

function cerrarModal() {
    const modal = document.getElementById('modal-detalle');
    if (modal) {
        modal.classList.remove('activo');
        document.body.style.overflow = ''; // Restaura scroll de fondo
    }
}

function cerrarModalDesdeBackdrop(event) {
    // Si hace clic en el backdrop oscuro y no dentro del modal-content
    if (event.target.classList.contains('modal-backdrop')) {
        cerrarModal();
    }
}

// Cierre al presionar la tecla Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarModal();
    }
});

// Iniciar el motor
cargarCatalogo();
