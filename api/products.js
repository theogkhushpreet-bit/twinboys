const { PRODUCTS, json, method } = require('./_lib');
module.exports = (req, res) => {
  if (!method(req, res, ['GET'])) return;
  json(res, 200, { currency: 'INR', products: Object.values(PRODUCTS).map(p => ({ id: p.id, name: p.name, pricePerKg: p.paisePerKg / 100, currency: 'INR' })) });
};
