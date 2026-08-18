import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    if (topic === 'payment' && id && token && supabaseUrl && serviceRoleKey) {
      const mpClient = new MercadoPagoConfig({ accessToken: token });
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id });

      if (paymentData.status === 'approved') {
        const { user_id, course_id } = paymentData.metadata;

        await supabaseAdmin.from('enrollments').upsert({
          user_id: user_id,
          course_id: course_id,
          payment_id: id.toString(),
          payment_status: 'approved',
          amount_paid: paymentData.transaction_amount,
          enrolled_at: new Date().toISOString()
        }, { onConflict: 'user_id,course_id' });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Webhook Error', { status: 500 });
  }
}
