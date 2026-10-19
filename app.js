const products = [
  { id: 'mustard', name: 'Mustard Honey', price: 600, unit: 'kg', note: 'Distinctive honey variety', image: 'honey' },
  { id: 'multiflora', name: 'Multiflora Honey', price: 600, unit: 'kg', note: 'Honey from multiple floral sources', image: 'honey' },
  { id: 'eucalyptus', name: 'Eucalyptus Honey', price: 600, unit: 'kg', note: 'A distinctive honey variety', image: 'honey' },
  { id: 'pollen', name: 'Bee Pollen', price: 1200, unit: 'kg', note: 'Bee pollen', image: 'jars' },
  { id: 'comb', name: 'Comb Honey', price: 1800, unit: 'kg', note: 'Honey presented in its comb', image: 'promo' }
];
const weights = [0.25, 0.5, 1];
const cart = new Map();
const $ = (selector) => document.querySelector(selector);
const productGrid = $('#productGrid');
const toast = $('#toast');
let toastTimer;
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
const weightLabel = kg => kg === 1 ? '1 kg' : `${kg * 1000} g`;
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600); }
function productPrice(product, kg) { return Math.round(product.price * kg * 100) / 100; }
function renderProducts() {
  productGrid.innerHTML = products.map((product, index) => `
    <article class="product-card">
      <div class="product-photo"><span class="product-index">TB / 0${index + 1}</span><img src="${product.image === 'promo' ? 'assets/honey-promo-reference.jpg' : 'assets/real-honey-jars.jpg'}" alt="${product.name} — Twin Boys product range reference" loading="lazy"></div>
      <div class="product-info"><h3>${product.name}</h3><p>${product.note}. <strong>${money(product.price)} / kg</strong></p>
      <label class="weight-label" for="weight-${product.id}">Choose quantity</label>
      <select class="weight-select" id="weight-${product.id}" aria-label="Choose quantity for ${product.name}">${weights.map(kg => `<option value="${kg}">${weightLabel(kg)} — ${money(productPrice(product, kg))}</option>`).join('')}</select>
      <button class="product-action" data-add="${product.id}"><span>Add to bag</span><span>＋</span></button></div>
    </article>`).join('');
  productGrid.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => {
    const product = products.find(p => p.id === button.dataset.add);
    const kg = Number($(`#weight-${product.id}`).value);
    const key = `${product.id}:${kg}`;
    cart.set(key, (cart.get(key) || 0) + 1);
    updateCart(); openCart(); showToast(`${product.name} (${weightLabel(kg)}) added to your bag`);
  }));
}
function cartLines() {
  return [...cart.entries()].map(([key, qty]) => {
    const [id, kgText] = key.split(':'); const product = products.find(p => p.id === id); const kg = Number(kgText);
    return { key, product, kg, qty, unitPrice: productPrice(product, kg), total: productPrice(product, kg) * qty };
  });
}
function cartSubtotal() { return cartLines().reduce((sum, line) => sum + line.total, 0); }
function updateCart() {
  const count = [...cart.values()].reduce((sum, qty) => sum + qty, 0);
  $('#cartCount').textContent = count; $('#drawerCount').textContent = `(${count})`;
  $('#cartSubtotal').textContent = money(cartSubtotal()); $('#checkoutSubtotal').textContent = money(cartSubtotal());
  const cartItems = $('#cartItems');
  if (!count) { cartItems.innerHTML = '<p class="empty-cart">Your bag is waiting for something golden.</p>'; $('#checkoutButton').disabled = true; return; }
  $('#checkoutButton').disabled = false;
  cartItems.innerHTML = cartLines().map(line => `<div class="cart-row"><div><strong>${line.product.name}</strong><small>${weightLabel(line.kg)} each · ${money(line.unitPrice)} · Qty ${line.qty}<br><b>${money(line.total)}</b></small><div class="quantity-controls"><button data-dec="${line.key}" aria-label="Decrease ${line.product.name} quantity">−</button><span>${line.qty}</span><button data-inc="${line.key}" aria-label="Increase ${line.product.name} quantity">＋</button></div></div><button data-remove="${line.key}" aria-label="Remove ${line.product.name}">Remove</button></div>`).join('');
  cartItems.querySelectorAll('[data-inc]').forEach(button => button.addEventListener('click', () => { cart.set(button.dataset.inc, cart.get(button.dataset.inc) + 1); updateCart(); }));
  cartItems.querySelectorAll('[data-dec]').forEach(button => button.addEventListener('click', () => { const key = button.dataset.dec; const qty = cart.get(key) - 1; if (qty <= 0) cart.delete(key); else cart.set(key, qty); updateCart(); }));
  cartItems.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => { cart.delete(button.dataset.remove); updateCart(); }));
}
function openCart() { $('#cartOverlay').hidden = false; document.body.style.overflow = 'hidden'; $('#closeCart').focus(); }
function closeCart() { $('#cartOverlay').hidden = true; document.body.style.overflow = ''; $('#openCart').focus(); }
function openCheckout() {
  if (!cart.size) return;
  $('#cartOverlay').hidden = true; $('#checkoutOverlay').hidden = false; $('#checkoutSubtotal').textContent = money(cartSubtotal());
  $('#orderConfirmation').hidden = true; $('#checkoutForm').hidden = false; $('#closeCheckout').focus();
}
function closeCheckout() { $('#checkoutOverlay').hidden = true; document.body.style.overflow = ''; $('#openCart').focus(); }
$('#openCart').addEventListener('click', openCart); $('#closeCart').addEventListener('click', closeCart); $('#closeCartBackdrop').addEventListener('click', closeCart);
$('#checkoutButton').addEventListener('click', openCheckout);
$('#closeCheckout').addEventListener('click', closeCheckout); $('#closeCheckoutBackdrop').addEventListener('click', closeCheckout);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#checkoutOverlay').hidden) closeCheckout(); else if (!$('#cartOverlay').hidden) closeCart(); } });
$('#menuToggle').addEventListener('click', () => { const nav = $('#mainNav'); const open = nav.classList.toggle('is-open'); $('#menuToggle').setAttribute('aria-expanded', String(open)); });
$('#mainNav').querySelectorAll('a').forEach(a => a.addEventListener('click', () => { $('#mainNav').classList.remove('is-open'); $('#menuToggle').setAttribute('aria-expanded', 'false'); }));
function dismissIntro() { $('#intro').classList.add('is-gone'); try { sessionStorage.setItem('tbIntroSeen', '1'); } catch (_) {} }
$('#skipIntro').addEventListener('click', dismissIntro); $('#enterBtn').addEventListener('click', dismissIntro);
try { if (sessionStorage.getItem('tbIntroSeen') === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) $('#intro').classList.add('is-gone'); } catch (_) { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) $('#intro').classList.add('is-gone'); }
$('#year').textContent = new Date().getFullYear();
const quiz = [
  { question: 'What kind of flavour sounds good?', options: [{ label: 'A bold, distinctive character', value: 'mustard' }, { label: 'A balanced, varied character', value: 'multiflora' }, { label: 'A distinctive aromatic note', value: 'eucalyptus' }, { label: 'Something to explore by texture', value: 'comb' }] },
  { question: 'How would you most like to explore honey?', options: [{ label: 'Drizzled over breakfast', value: 'multiflora' }, { label: 'As a flavour to savour slowly', value: 'mustard' }, { label: 'In tea or a warm drink', value: 'eucalyptus' }, { label: 'In its natural comb form', value: 'comb' }] }
];
let quizIndex = 0; let quizAnswers = [];
function renderQuiz() {
  const q = quiz[quizIndex]; $('#quizStep').textContent = `QUESTION 0${quizIndex + 1} / 02`; $('#progressFill').style.width = `${(quizIndex + 1) * 50}%`; $('#quizQuestion').textContent = q.question;
  $('#quizOptions').hidden = false; $('#quizResult').hidden = true; $('#quizReset').hidden = true;
  $('#quizOptions').innerHTML = q.options.map(o => `<button class="quiz-option" data-answer="${o.value}">${o.label} <span>↗</span></button>`).join('');
  $('#quizOptions').querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => { quizAnswers.push(button.dataset.answer); if (quizIndex === 0) { quizIndex = 1; renderQuiz(); } else showQuizResult(); }));
}
function showQuizResult() {
  const tally = quizAnswers.reduce((acc, answer) => (acc[answer] = (acc[answer] || 0) + 1, acc), {}); const winner = Object.keys(tally).sort((a,b) => tally[b] - tally[a])[0];
  const names = { mustard: 'Mustard Honey', multiflora: 'Multiflora Honey', eucalyptus: 'Eucalyptus Honey', comb: 'Comb Honey' };
  $('#quizQuestion').textContent = 'Your honey to explore'; $('#quizOptions').hidden = true; $('#quizResult').hidden = false; $('#quizResult').innerHTML = `<strong>${names[winner] || 'Multiflora Honey'}</strong><br>This is a starting point based on your preferences. Explore the collection and choose what sounds right for you.`; $('#quizReset').hidden = false;
}
$('#quizReset').addEventListener('click', () => { quizIndex = 0; quizAnswers = []; renderQuiz(); });
$('#checkoutForm').addEventListener('submit', event => {
  event.preventDefault(); if (!cart.size) return;
  const form = new FormData(event.currentTarget); const orderId = `TB-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const order = { orderId, createdAt: new Date().toISOString(), customer: { name: form.get('name'), phone: form.get('phone'), address: form.get('address'), city: form.get('city'), pincode: form.get('pincode'), notes: form.get('notes') }, items: cartLines().map(line => ({ name: line.product.name, quantityKg: line.kg, quantity: line.qty, unitPrice: line.unitPrice, total: line.total })), subtotal: cartSubtotal(), status: 'UNSUBMITTED DEMO SUMMARY — NOT PAID' };
  $('#checkoutForm').hidden = true; const confirmation = $('#orderConfirmation'); confirmation.hidden = false;
  confirmation.innerHTML = `<span class="confirmation-mark">✓</span><h3>Order summary created</h3><p class="order-id">${order.orderId}</p><p>This is a local preview only. Your order has <strong>not</strong> been sent to TWIN BOYS, saved to a server, or paid for.</p><div class="confirmation-lines">${order.items.map(item => `<div><span>${item.name} · ${weightLabel(item.quantityKg)} × ${item.quantity}</span><strong>${money(item.total)}</strong></div>`).join('')}<div class="confirmation-grand"><span>Product subtotal</span><strong>${money(order.subtotal)}</strong></div></div><p class="checkout-note">Delivery charges and payment remain unconfirmed.</p><button class="button button-outline" id="downloadOrder">Download order summary</button> <button class="button button-gold" id="finishOrder">Back to store</button>`;
  $('#downloadOrder').addEventListener('click', () => { const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${order.orderId}.json`; link.click(); URL.revokeObjectURL(url); });
  $('#finishOrder').addEventListener('click', () => { cart.clear(); updateCart(); closeCheckout(); showToast('Demo summary finished. No order was submitted.'); });
});
renderProducts(); renderQuiz(); updateCart();
