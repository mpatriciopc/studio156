# 📄 Propuesta Comercial & Técnica: Plataforma E-Commerce Lola Pet SpA

**Cliente:** Lola Pet SpA  
**Proveedor:** Studio 156 — Agencia & Consultoría Digital  
**Fecha:** Septiembre 2026  
**Versión:** 1.0 (Producción / Final)  

---

## 1. Resumen Ejecutivo

La presente propuesta contempla el diseño, desarrollo, blindaje de seguridad e implementación de la plataforma e-commerce de alto rendimiento para **Lola Pet SpA**, especializada en la venta de alimentos Super Premium, accesorios y artículos de salud felina y canina en Chile.

La solución se concibió bajo una arquitectura **Headless E-Commerce** optimizada para máxima velocidad de carga, experiencia de usuario fluida (sin fricción de inicio de sesión) y un backend desacoplado gestionable directamente desde **Airtable**, eliminando costos recurrentes de licencias de comercio electrónico tradicional.

---

## 2. Arquitectura & Stack Tecnológico

| Componente | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Frontend / UI** | React / Next.js / TypeScript | Carga ultrarrápida, SEO optimizado e interfaz moderna con diseño responsive. |
| **Diseño / Estilos** | Vanilla CSS (Tokens HSL `Pet Teal`) | Flexibilidad total, cero dependencias pesadas y rendimiento fluido en móviles. |
| **Base de Datos / CMS** | Airtable API (Headless Engine) | Gestión intuitiva de productos, variantes, inventario y pedidos por el cliente. |
| **Checkout Flow** | Guest Checkout (ADR-001) | Cero fricción de registro; incremento directo de la tasa de conversión. |
| **Pagos Híbridos** | Webpay Plus, Mercado Pago & WhatsApp | Cobertura total de medios de pago locales e integración directa con atención B2B/B2C. |

---

## 3. Características Principales de la Plataforma

### 🛒 A. Experiencia del Cliente (Storefront)
1. **Selector de Especie Dinámico:** Switcher fluido **Perros 🐶 / Gatos 🐱** que filtra instantáneamente el catálogo.
2. **Filtrado por Categorías (Pills):** Clasificación por *Alimentos Super Premium*, *Snacks & Premios*, *Farmacia & Pipetas* y *Arenas Sanitarias*.
3. **Etiquetas de Producto (Badges Flat SVG):** Distintivos visuales para `OFERTA` (con precio tachado), `DESTACADO` y `NUEVO`.
4. **Ficha de Producto Individual (PDP Modal):** Ventana emergente interactiva con descripción técnica, lista de beneficios destacados, stock en bodega y acceso directo a asesoría por WhatsApp.
5. **Hero Banner de Alto Impacto:** Fondo con degradado oscuro (`Pet Teal` overlay layer) para legibilidad óptima y llamadas a la acción directas.
6. **Carrito de Compras Deslizante:** Calculador dinámico de subtotal con barra de progreso para **Envío Gratis** (ej. *Agrega $5.000 más para despacho gratuito*).

### 🔐 B. Checkout Seguro sin Login (ADR-001)
1. **Captura Completa para Facturación:** Formulario Guest con validación estricta de RUT chileno, email, teléfono, dirección y comuna.
2. **Recálculo de Precios Cero-Confianza (Zero-Trust):** El servidor recalcula el subtotal y el costo de envío directamente contra Airtable para evitar manipulación de precios desde el cliente.
3. **Privacidad de Datos PII:** Opción para el cliente de borrar sus datos guardados localmente (`localStorage`) con un solo clic.
4. **URLs de Confirmación Anti-IDOR:** Generación de `hash_seguridad` único (UUID v4) para proteger la privacidad de la boleta y el pedido (`/pedido-confirmado?id=REC123&hash=...`).

### 🛠️ C. Panel de Gestión (Backend Airtable Integrado)
1. **Gestión Centralizada de Pedidos:** Tabla `Pedidos` sincronizada en tiempo real con estados (`Pendiente`, `Pagado`, `Enviado`, `Cancelado`).
2. **Control de Inventario & Alerta de Sobreventa:** Flag automático `Alerta: Sobreventa` si el stock disponible es superado durante transacciones simultáneas.
3. **Limpieza Automática de Pedidos Huérfanos:** Protocolo de liberación de stock si una sesión de pago es abandonada antes de completar el pago.

---

## 4. Blindaje de Seguridad & Auditoría Senior Aplicada

El sistema fue sometido a una auditoría adversarial estricta e incluye mitigación completa para las siguientes vulnerabilidades:

- **SEC-01 (Rate Limit / Anti-DDoS):** Control de reintentos con algoritmo *Exponential Backoff & Jitter* para evitar bloqueos por límite de peticiones (HTTP 429 de Airtable).
- **SEC-02 (Cero Manipulación de Precios):** Validación de SKU y stock en servidor previo a la generación de la transacción de pago.
- **SEC-03 (Protección de Adjuntos Expire-Safe):** Proxy del servidor para imágenes de producto evitando links rotos por caducidad de firmas CDN de Airtable.
- **SEC-04 (Control de Desbordamiento de Celdas):** Truncado seguro de payloads JSON de detalle de pedidos a 50.000 caracteres.
- **SEC-05 (Tarifa de Envío Contingente):** Matriz de respaldo de costos de despacho en caso de fallas temporales de comunicación con la API de envíos.

---

## 5. Entregables del Proyecto

1. **Código Fuente Completo:** Repositorio en GitHub (`https://github.com/mpatriciopc/studio156.git`).
2. **Demostración Interactiva:** Archivos `index.html` (Catálogo y PDP) y `checkout.html` (Checkout seguro sin login).
3. **Base de Datos Airtable Configurada:** Esquema relacional optimizado con tablas `Productos`, `Variantes`, `Pedidos`, `Configuracion_Envios` y `Cupones`.
4. **Documentación Técnica & Especificaciones:** Documentos de arquitectura en la carpeta `siteplan/` (`specs.md`, `bdentities.md`, `guardrails.md`, `payment_methods_specs.md`).

---

## 6. Presupuesto & Plan de Inversión

| Ítem | Descripción | Inversión (CLP) |
| :--- | :--- | :---: |
| **Desarrollo Frontend & UX/UI** | Catálogo responsivo, filtro por especie/categoría, PDP modal y Hero Banner con capa de contraste. | $850.000 |
| **Arquitectura Headless Airtable** | Conexión API con retries, resiliencia HTTP 429 y sincronización de pedidos. | $650.000 |
| **Módulo Checkout & Pagos Híbridos** | Guest Checkout (ADR-001), Webpay Plus, Mercado Pago e integración WhatsApp. | $550.000 |
| **Auditoría & Blindaje de Seguridad** | Protección Cero-Confianza, Anti-IDOR, sanitización PII y mitigación de race conditions. | $450.000 |
| **TOTAL INVERSIÓN PROYECTO** | **Solución Llave en Mano (Sin costo recurrente de plataforma)** | **$2.500.000 IVA incl.** |

---

## 7. Mantenimiento & Soporte Post-Lanzamiento

- **Garantía Técnica:** 90 días de soporte correctivo ante cualquier anomalía de software.
- **Plan de Mantenimiento Opcional:** $150.000 / mes (incluye actualización de seguridad, monitoreo de la API de Airtable y respaldos periódicos).

---

*Propuesta preparada y respaldada por el equipo de ingeniería de Studio 156.*
