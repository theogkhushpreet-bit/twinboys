const { supabaseAdmin, razorpay, json, method, parseItems } = require('./_lib');
function validText(v, max) { return typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max; }
module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;
  try {
    const { customer, items } = req.body || {};
    if (!customer || !validText(customer.name, 100) || !/^[+]?[0-9 ()-]{10,16}$/.test(customer.phone || '') || !validText(customer.address, 400) || !validText(customer.city, 80) || !/^[1-9][0-9]{5}$/.test(customer.pincode || '')) return json(res, 400, { error: 'Please provide valid delivery details.' });
    const cleanItems = parseItems(items);
    const subtotalPaise = cleanItems.reduce((sum, item) => sum + item.line_amount_paise, 0);
    if (subtotalPaise < 100 || subtotalPaise > 50000000) return json(res, 400, { error: 'Order amount is outside the supported range.' });
    const db = supabaseAdmin();
    const { data: order, error: dbError } = await db.from('orders').insert({ customer_name: customer.name.trim(), customer_phone: customer.phone.trim(), address: customer.address.trim(), city: customer.city.trim(), pincode: customer.pincode, notes: validText(customer.notes || '', 300) ? customer.notes.trim() : null, items: cleanItems, subtotal_paise: subtotalPaise, shipping_paise: 0, total_paise: subtotalPaise, currency: 'INR', payment_status: 'created', fulfilment_status: 'new' }).select('id').single();
    if (dbError) throw dbError;
    const rp = await razorpay().orders.create({ amount: subtotalPaise, currency: 'INR', receipt: order.id, notes: { internal_order_id: order.id } });
    const { error: updateError } = await db.from('orders').update({ razorpay_order_id: rp.id }).eq('id', order.id);
    if (updateError) throw updateError;
    json(res, 200, { orderId: order.id, razorpayOrderId: rp.id, amount: subtotalPaise, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('create-order failed', error.message);
    json(res, 500, { error: 'We could not create your order. Please try again.' });
  }
};
