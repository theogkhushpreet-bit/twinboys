const { supabaseAdmin, json, method, verifySignature } = require('./_lib');
module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (![orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => typeof v === 'string' && v.length > 0)) return json(res, 400, { error: 'Payment verification details are incomplete.' });
    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return json(res, 400, { error: 'Payment signature could not be verified.' });
    const db = supabaseAdmin();
    const { data: order, error } = await db.from('orders').select('id,razorpay_order_id,payment_status').eq('id', orderId).single();
    if (error || !order || order.razorpay_order_id !== razorpay_order_id) return json(res, 404, { error: 'Order not found.' });
    // Browser verification is a fast UX update; the signed provider webhook remains the source of truth.
    const { error: updateError } = await db.from('orders').update({ razorpay_payment_id: razorpay_payment_id, payment_status: 'verification_pending' }).eq('id', orderId);
    if (updateError) throw updateError;
    json(res, 200, { ok: true, orderId, paymentStatus: 'verification_pending', message: 'Payment details received. Final confirmation follows the provider webhook.' });
  } catch (error) {
    console.error('verify-payment failed', error.message);
    json(res, 500, { error: 'Payment verification could not be completed.' });
  }
};
