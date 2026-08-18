/**
 * TEST HARNESS: ACADEMIA HUERTERA LMS
 * Entorno de pruebas integradas y simulador de entorno para pagos y autenticación.
 */

export class LMSHarness {
  constructor() {
    this.logs = [];
  }

  log(msg) {
    this.logs.push(`[${new Date().toISOString()}] ${msg}`);
  }

  /**
   * Genera un mock de usuario autenticado para pruebas de Supabase
   */
  createMockUser({ id = 'user-test-123', email = 'huertero.test@ejemplo.com', name = 'Estudiante Test' } = {}) {
    return {
      id,
      email,
      user_metadata: { full_name: name },
      created_at: new Date().toISOString()
    };
  }

  /**
   * Genera un payload de simulación de respuesta de Mercado Pago Checkout Pro
   */
  createMockMPPreference({ courseId = 'c801f6d3-2415-46a2-94f4-526487e411b9', price = 59000 } = {}) {
    return {
      id: `pref-${Date.now()}`,
      init_point: `https://www.mercadopago.cl/checkout/v1/redirect?pref_id=pref-${Date.now()}`,
      sandbox_init_point: `https://sandbox.mercadopago.cl/checkout/v1/redirect?pref_id=pref-${Date.now()}`,
      items: [
        {
          id: courseId,
          title: 'Curso Completo de Horticultura Comercial - Academia Huertera',
          quantity: 1,
          unit_price: price,
          currency_id: 'CLP'
        }
      ]
    };
  }

  /**
   * Genera un payload de notificación webhook de Mercado Pago
   */
  createMockMPWebhookPayload({ paymentId = '123456789', status = 'approved', userId = 'user-test-123', courseId = 'c801f6d3-2415-46a2-94f4-526487e411b9' } = {}) {
    return {
      action: 'payment.created',
      api_version: 'v1',
      data: { id: paymentId },
      date_created: new Date().toISOString(),
      id: paymentId,
      live_mode: false,
      type: 'payment',
      user_id: 'mp-seller-id',
      mockPaymentDetails: {
        id: paymentId,
        status: status,
        transaction_amount: 59000,
        metadata: {
          user_id: userId,
          course_id: courseId
        }
      }
    };
  }

  /**
   * Simula la invocación HTTP a una ruta de API de Next.js
   */
  async simulateApiRoute(handler, { method = 'POST', body = null, searchParams = {} } = {}) {
    const url = new URL('http://localhost:3000/api/test');
    Object.keys(searchParams).forEach(k => url.searchParams.append(k, searchParams[k]));

    const req = {
      method,
      url: url.toString(),
      json: async () => body,
      nextUrl: url
    };

    const res = await handler(req);
    const status = res.status;
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = await res.text();
    }

    return { status, data };
  }
}
