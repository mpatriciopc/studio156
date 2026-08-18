import { LMSHarness } from './harness.js';

export async function runHarnessTests() {
  const harness = new LMSHarness();
  const results = [];

  console.log('🧪 === EJECUTANDO HARNESS TEST SUITE ===');

  // TEST 1: Mock Harness User Session
  try {
    const user = harness.createMockUser({ email: 'test@academiahuertera.cl' });
    const isOk = user.email === 'test@academiahuertera.cl' && user.id;
    results.push({
      test: 'Harness Supabase User Generation',
      passed: isOk,
      details: `User ID: ${user.id} (${user.email})`
    });
  } catch (err) {
    results.push({ test: 'Harness Supabase User Generation', passed: false, error: err.message });
  }

  // TEST 2: Mock Mercado Pago Preference Builder
  try {
    const pref = harness.createMockMPPreference({ price: 59000 });
    const isOk = pref.items[0].unit_price === 59000 && pref.init_point.includes('mercadopago');
    results.push({
      test: 'Harness Mercado Pago Preference Builder',
      passed: isOk,
      details: `Preference ID: ${pref.id}`
    });
  } catch (err) {
    results.push({ test: 'Harness Mercado Pago Preference Builder', passed: false, error: err.message });
  }

  // TEST 3: Mock Webhook Event Handler Payload
  try {
    const payload = harness.createMockMPWebhookPayload({ paymentId: 'pay-998877', status: 'approved' });
    const isOk = payload.mockPaymentDetails.status === 'approved' && payload.data.id === 'pay-998877';
    results.push({
      test: 'Harness Mercado Pago Webhook Payload Integrity',
      passed: isOk,
      details: `Payment Status: ${payload.mockPaymentDetails.status}`
    });
  } catch (err) {
    results.push({ test: 'Harness Mercado Pago Webhook Payload Integrity', passed: false, error: err.message });
  }

  // Resumen
  console.log('\n📊 RESULTADOS DE HARNESS:');
  results.forEach(r => {
    console.log(`${r.passed ? '✅ PASÓ' : '❌ FALLÓ'}: [${r.test}] - ${r.details || r.error}`);
  });

  return results;
}

runHarnessTests();
