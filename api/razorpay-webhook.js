const crypto = require('node:crypto');
const { env, supabaseAdmin, json, method } = require('./_lib');
module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) return json(res, 400, { error: 'Missing webhook signature.' });
    // Configure this endpoint with Razorpay's webhook secret. Vercel must preserve the raw body for verification.
    const raw = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const expected = crypto.createHmac('sha256', env('RAZORPAY_WEBHOOK_SECRET')).update(raw).digest('hex');
    const a = Buffer.from(expected); const b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return json(res, 400, { error: 'Invalid webhook signature.' });
    const event = req.body;
    const payment = event?.payload?.payment?.entity;
    const rpOrderId = payment?.order_id || event?.payload?.order?.entity?.id;
    if (!rpOrderId) return json(res, 200, { received: true, ignored: true });
    const db = supabaseAdmin();
    if (event.event === 'payment.captured' && payment?.status === 'captured') {
      const { error } = await db.from('orders').update({ payment_status: 'paid', razorpay_payment_id: payment.id, paid_at: new Date().toISOString() }).eq('razorpay_order_id', rpOrderId);
      if (error) throw error;
    } else if (event.event === 'payment.failed') {
      const { error } = await db.from('orders').update({ payment_status: 'failed', razorpay_payment_id: payment?.id || null }).eq('razorpay_order_id', rpOrderId).neq('payment_status', 'paid');
      if (error) throw error;
    }
    json(res, 200, { received: true });
  } catch (error) {
    console.error('razorpay webhook failed', error.message);
    json(res, 500, { error: 'Webhook processing failed.' });
  }
};
