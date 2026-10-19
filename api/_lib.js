const { createClient } = require('@supabase/supabase-js');
const Razorpay = require('razorpay');
const crypto = require('node:crypto');

const PRODUCTS = {
  mustard: { id: 'mustard', name: 'Mustard Honey', paisePerKg: 60000 },
  multiflora: { id: 'multiflora', name: 'Multiflora Honey', paisePerKg: 60000 },
  eucalyptus: { id: 'eucalyptus', name: 'Eucalyptus Honey', paisePerKg: 60000 },
  pollen: { id: 'pollen', name: 'Bee Pollen', paisePerKg: 120000 },
  comb: { id: 'comb', name: 'Comb Honey', paisePerKg: 180000 }
};
function env(name) { const value = process.env[name]; if (!value) throw new Error(`Missing environment variable: ${name}`); return value; }
function supabaseAdmin() { return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } }); }
function razorpay() { return new Razorpay({ key_id: env('RAZORPAY_KEY_ID'), key_secret: env('RAZORPAY_KEY_SECRET') }); }
function json(res, status, body) { res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body)); }
function method(req, res, allowed) { if (!allowed.includes(req.method)) { res.setHeader('Allow', allowed.join(', ')); json(res, 405, { error: 'Method not allowed' }); return false; } return true; }
function parseItems(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) throw new Error('Cart is invalid.');
  return items.map(item => {
    const product = PRODUCTS[item.productId];
    const grams = Number(item.grams);
    const quantity = Number(item.quantity);
    if (!product || ![250, 500, 1000].includes(grams) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('A cart item is invalid.');
    const linePaise = Math.round(product.paisePerKg * grams / 1000) * quantity;
    return { product_id: product.id, product_name: product.name, grams, quantity, unit_amount_paise: Math.round(product.paisePerKg * grams / 1000), line_amount_paise: linePaise };
  });
}
function verifySignature(orderId, paymentId, signature) {
  const expected = crypto.createHmac('sha256', env('RAZORPAY_KEY_SECRET')).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected); const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
module.exports = { PRODUCTS, env, supabaseAdmin, razorpay, json, method, parseItems, verifySignature };
