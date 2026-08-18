import crypto from 'crypto';

/**
 * GUARDRAIL DE SEGURIDAD PARA MERCADO PAGO WEBHOOKS
 * Verifica la autenticidad y la firma x-signature emitida por Mercado Pago.
 */
export function verifyMercadoPagoSignature(req, secret = process.env.MERCADOPAGO_WEBHOOK_SECRET) {
  // Si no hay secret configurado en desarrollo local, permitir con advertencia en logs
  if (!secret) {
    return { isValid: true, mode: 'DEV_UNVERIFIED_PASSTHROUGH' };
  }

  try {
    const xSignature = req.headers?.get('x-signature');
    const xRequestId = req.headers?.get('x-request-id');

    if (!xSignature || !xRequestId) {
      return { isValid: false, reason: 'Falta cabecera x-signature o x-request-id' };
    }

    // Extraer ts y v1 de la cabecera x-signature (Formato: ts=1234567,v1=hash...)
    const parts = xSignature.split(',');
    let ts = null;
    let hash = null;

    parts.forEach(part => {
      const [key, value] = part.trim().split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') hash = value;
    });

    if (!ts || !hash) {
      return { isValid: false, reason: 'Formato inválido de x-signature' };
    }

    const url = new URL(req.url);
    const dataID = url.searchParams.get('data.id') || url.searchParams.get('id');

    const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;
    const computedHash = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
    return { isValid, reason: isValid ? null : 'Firma HMAC inváilda' };
  } catch (error) {
    return { isValid: false, reason: error.message };
  }
}
