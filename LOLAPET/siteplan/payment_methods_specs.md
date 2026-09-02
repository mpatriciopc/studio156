# Especificación de Métodos de Pago: Pasarela y WhatsApp

## 1. Flujo de Pago Híbrido
* **Opción A (Pasarela Automática):** Tarjetas de débito/crédito vía Webpay Plus o Mercado Pago. Sesión creada por el servidor con total recalculado. Webhook confirma y descuenta stock automáticamente.
* **Opción B (WhatsApp Asistido):** Registra orden en estado `WhatsApp por Confirmar` y genera enlace directo con mensaje preformateado conteniendo ID, detalle y dirección para que el comercio envíe link de cobro o datos de transferencia.

## 2. Idempotencia en Webhook de Pasarela
* Endpoint `/api/webhooks/payment` verifica si `transaccion_id` ya fue procesado antes de descontar stock. Si ya existe, retorna `HTTP 200 OK` inmediatamente.
