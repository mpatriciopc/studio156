# Especificaciones del Proyecto (Specs) - Versión Definitiva

## 1. Visión General
E-commerce ultra-rápido (<1.2s LCP) para tienda de mascotas (<100 productos) con arquitectura Headless (Frontend estático/Edge + Airtable como CMS/DB transaccional + Checkout como Invitado).

## 2. Requerimientos Funcionales (RF)
* **RF-01 (Catálogo Segmentado):** División visual inmediata entre universos Perros y Gatos con navegación por categorías (Alimento, Snacks, Farmacia, Accesorios).
* **RF-02 (Variantes y Atributos):** Soporte para formatos/pesos (ej. 3kg, 15kg) con sincronización de precio, stock y peso individual para flete.
* **RF-03 (Carrito Persistente):** Drawer lateral reactivo persistido en `localStorage` sin requerir registro de usuario.
* **RF-04 (Checkout sin Fricción):** Formulario de entrega único (Nombre, RUT, Email, Teléfono, Dirección, Comuna) con autocompletado nativo.
* **RF-05 (Cotizador de Envíos por Peso):** Cálculo dinámico del flete en servidor basado en la suma de `peso_kg` y la comuna de destino.
* **RF-06 (Pago Híbrido):** Soporte dual: Pasarela online (Webpay Plus / Mercado Pago) o Pedido Asistido vía WhatsApp con link de pago.
* **RF-07 (Trazabilidad Segura):** URLs de confirmación y seguimiento protegidas mediante hash criptográfico no correlativo.
* **RF-08 (Panel de Administración):** Zona privada estilo WooCommerce para gestión de productos, inventario, variantes, pedidos y cupones.

## 3. Requerimientos No Funcionales (RNF)
* **RNF-01 (Seguridad Absoluta de Credenciales):** Tokens de Airtable y pasarelas aislados al 100% en backend serverless. Cero exposición en cliente.
* **RNF-02 (Cero Confianza en Precios del Cliente):** El servidor recalcula y valida matemáticamente el 100% de los totales cobrados.
* **RNF-03 (Mitigación de Rate Limit):** Catálogo pre-renderizado (SSG/ISR) para no saturar las 5 req/s de Airtable.
* **RNF-04 (Persistencia de Multimedia):** Pipeline de optimización de imágenes en build/servidor para resolver la expiración de URLs de Airtable.
