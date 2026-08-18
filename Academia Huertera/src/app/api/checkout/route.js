import { MercadoPagoConfig, Preference } from 'mercadopago';
import { validateCheckoutInput } from '@/lib/guardrails/validator';

export async function POST(req) {
  try {
    const rawBody = await req.json();

    // GUARDRAIL 1: Validación y sanitización de entrada
    const { isValid, errors, sanitized } = validateCheckoutInput(rawBody);
    if (!isValid) {
      return Response.json({ error: 'Validación fallida', details: errors }, { status: 400 });
    }

    const { userEmail, userId, courseId } = sanitized;
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      // Retornar fallback simulado para entorno de desarrollo/prueba sin token activo
      return Response.json({ 
        init_point: `${process.env.NEXT_PUBLIC_APP_URL || ''}/curso/dashboard?pago=exito_demo` 
      });
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: courseId || 'c801f6d3-2415-46a2-94f4-526487e411b9',
            title: 'Curso Completo de Horticultura Comercial - Academia Huertera',
            quantity: 1,
            unit_price: 59000,
            currency_id: 'CLP',
          }
        ],
        payer: {
          email: userEmail,
        },
        metadata: {
          user_id: userId || 'demo-user-id',
          course_id: courseId || 'c801f6d3-2415-46a2-94f4-526487e411b9',
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/curso/dashboard?pago=exito`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?pago=fallo`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?pago=pendiente`,
        },
        auto_return: 'approved',
      }
    });

    return Response.json({ init_point: response.init_point });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
