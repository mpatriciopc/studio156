# Guardrails de Seguridad, Arquitectura y Checkout

## 1. Seguridad de Credenciales y Entorno
* `AIRTABLE_PAT` debe existir únicamente en variables de servidor (Node.js/Edge). Prohibido prefijo `PUBLIC_`.
* Scopes restringidos: Solo lectura para catálogo; escritura únicamente en endpoints de backend.
* Navegación forzada en HTTPS / TLS 1.3.

## 2. Blindaje e Integridad del Checkout
* **Validación Cero-Confianza:** El cliente solo envía `{ sku, cantidad }` y datos de envío. El endpoint `/api/checkout/create-order` consulta Airtable, valida precios oficiales y calcula el total exacto.
* **Cálculo de Despacho por Peso:** El servidor suma `peso_kg * cantidad` y cruza con `Configuracion_Envios` para evitar pérdidas comerciales por bultos pesados. Si una comuna no se encuentra, se aplica automáticamente la tarifa de resguardo por defecto (*Fallback Rate*).
* **Privacidad de Pedidos (Anti-Enumeración):** URLs públicas de seguimiento deben requerir obligatoriamente `id_orden` y `hash_seguridad` (UUID v4).
* **Control de Sobreventas:** Pre-validación de stock antes de iniciar pago. Descuento en webhook de confirmación. Si concurrencia genera `stock < 0`, se asigna estado `Alerta: Sobreventa` y se notifica al administrador sin perder la compra.
* **Limpieza de Pedidos Huérfanos:** Cronjob serverless cada 15 min cancela automáticamente las órdenes en estado `Pendiente` con más de 30 minutos de antigüedad (evita acumulación de carritos abandonados).

## 3. Límites de API y Assets Multimedia
* Caché estática (SSG/ISR) para catálogo; cero llamadas dinámicas a Airtable por visitas normales.
* **Mitigación de Rate Limit (5 req/s):** Endpoint de checkout implementa retento con retardo exponencial (*Exponential Backoff with Jitter*) ante respuestas `HTTP 429`.
* Prohibido usar URLs crudas de adjuntos de Airtable. El optimizador de Astro/Next debe cachear las imágenes localmente en la CDN.
* Webhook de pagos con registro de `transaccion_id` para garantizar idempotencia y evitar descuentos duplicados.

