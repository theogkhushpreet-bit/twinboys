# TWIN BOYS — Storefront milestone prototype

A responsive, no-build-step frontend for the TWIN BOYS honey brand. This milestone adds displayed pricing, weight variants, cart quantity controls, subtotal calculations, and a local checkout/order-summary flow.

## Run locally

1. Extract the ZIP.
2. Open `twin-boys-website/index.html` in a modern browser, or run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.
3. Use the collection cards to select a weight and add products to the bag. Adjust quantities, review the subtotal, and try the delivery form to generate a downloadable local JSON summary.

## Prices currently configured

All prices are in INR and entered as supplied by the owner:

- Mustard Honey — ₹600/kg
- Multiflora Honey — ₹600/kg
- Eucalyptus Honey — ₹600/kg
- Bee Pollen — ₹1,200/kg
- Comb Honey — ₹1,800/kg

The UI offers 250 g, 500 g, and 1 kg quantities, priced proportionally from the per-kilogram price. This is a display/calculation choice, not confirmation that each package size is physically available. Confirm available pack sizes before accepting real orders.

## Included

- Responsive landing page and mobile navigation.
- Golden Drop-inspired intro, skip control, and reduced-motion support.
- Product collection and prices/weight selectors.
- Working client-side bag with increment/decrement/remove controls and subtotal.
- Delivery detail form with required-field validation and six-digit PIN validation.
- Local downloadable order-summary JSON.
- Honey Finder quiz.
- Supplied original product photos as references; individual variety-specific photos are not yet available.

## Critical limitations — not production checkout

**This is still a frontend prototype, not a live e-commerce system.** Checkout creates an order summary in the browser only. It does not send customer details to TWIN BOYS, persist orders on a server, reserve inventory, calculate shipping, send confirmations, or collect/verify payments. The generated order ID is not a real confirmed order number. Do not use this prototype to accept real customer orders or payments.

Before launch, implement and test:

1. A backend/database (for example, Supabase) with row-level security, private admin access, and server-side order creation.
2. A suitable India-supported payment provider, provider-hosted checkout, server-side signature/webhook verification, idempotency, and reliable payment-status handling.
3. Shipping and PIN-code serviceability, inventory/availability, real order notifications, cancellation/returns/refund rules, privacy terms, and support details.
4. Admin authentication, order fulfilment, inventory management, and real order history.
5. Verified product labels/facts including net quantity, ingredients, manufacturer/packer details, FSSAI details where applicable, batch/best-before and storage information. No such facts are invented in this prototype.
6. Variety-specific product photos and owner approval of all final visuals.

## Packaging and image fidelity

`assets/real-honey-jars.jpg` is the user-supplied photo of three real jars and is the primary packaging reference. `assets/honey-promo-reference.jpg` is promotional inspiration. The same group photograph is reused temporarily for honey varieties; the artwork does not establish which jar is which variety. Do not use generated artwork as a replacement for the authentic logo or packaging.

## Deployment

This static prototype can be previewed on a compatible static host, but it is **not ready for commercial checkout**. Do not commit secrets to frontend files. Deploy a production store only after the backend, access controls, payment verification, and order workflow are implemented and tested. Hosting may have a free tier; domain, payment-provider fees, shipping, and some production services may still cost money.

## Repo-ready backend integration scaffold (not yet live checkout)

This repository now also contains:

- `api/products.js`: server endpoint for the published price list.
- `api/create-order.js`: server-side cart validation, order record creation, and Razorpay order creation.
- `api/verify-payment.js`: Razorpay checkout signature validation and a pending state.
- `api/razorpay-webhook.js`: webhook signature validation and payment-status updates.
- `supabase/schema.sql`: private orders table with Row Level Security enabled and no public policies.
- `.env.example`: environment variable names; no secrets included.
- `vercel.json`, `package.json`, and `.gitignore` for deployment/repository setup.

**Important:** These server routes are an integration scaffold, not a fully tested production payment system. The existing `index.html` checkout has not yet been wired to call these endpoints, the webhook raw-body handling must be configured and tested with Razorpay's current Vercel runtime behavior, shipping is currently a placeholder, and the admin/customer account/order-tracking features are not implemented. Do not accept live payments until the full end-to-end flow has been connected and tested in Razorpay test mode and then approved for production.

## Environment setup

Copy `.env.example` to `.env.local` for local development and fill in credentials from your own Supabase and Razorpay accounts. Never commit `.env.local`, service-role keys, Razorpay secrets, or webhook secrets. In Vercel, add the same values under Project Settings → Environment Variables, separately for Preview and Production as appropriate.

### Supabase

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy the project URL and service-role key into server-only environment variables. The service-role key must never appear in `index.html` or `app.js`.
4. Before launch, add authenticated admin access, audit logging, retention rules, and tested authorization for every admin operation.

### Razorpay

1. Create a Razorpay account and complete the business onboarding/KYC that Razorpay requests.
2. Start with test-mode API credentials and enable the required payment methods in the Razorpay dashboard.
3. Configure the webhook URL as `https://YOUR-VERCEL-DOMAIN/api/razorpay-webhook` and subscribe to `payment.captured` and `payment.failed`.
4. Set the webhook secret in `RAZORPAY_WEBHOOK_SECRET`. Do not confuse it with the API key secret.
5. Implement the browser checkout call to `/api/create-order`, open Razorpay Checkout with the returned order ID, post the checkout result to `/api/verify-payment`, and show the order as paid only after the signed webhook or a trusted server-side provider API check confirms capture.
6. Test success, failure, cancellation, duplicate webhooks, amount mismatch, invalid signature, and retry/idempotency scenarios before switching to live keys.

The customer must never be asked to share their UPI PIN, OTP, or banking password. A screenshot is not proof of payment.

## GitHub + Vercel deployment

1. Create a new GitHub repository named `twin-boys-storefront` under your own account.
2. Upload the contents of this folder (not the enclosing folder) or run `git init`, `git add .`, `git commit -m "Initial TWIN BOYS storefront"`, then add your new GitHub remote and push to `main`.
3. In Vercel, choose **Add New → Project**, import that GitHub repository, and deploy. Vercel can create preview deployments for branches and production deployments from the production branch.
4. Add environment variables in Vercel before enabling backend routes, redeploy, and test the API endpoints.
5. Do not add live payment credentials until test-mode verification and order handling pass.

A GitHub repository and Vercel project have **not** been created or connected from this environment; you must authorize those actions in your own accounts. Vercel's Git integration documentation: https://vercel.com/docs/git

## Known launch blockers

- Frontend checkout integration with the API and Razorpay Checkout.
- Webhook raw-body handling and idempotent event processing verified in deployed tests.
- Admin sign-in, role checks, order list/detail views, fulfilment updates, product/inventory editing.
- Customer order confirmation, order history/Buy Again, secure lookup or account system.
- Actual shipping charges, PIN-code serviceability, delivery estimates, refunds/cancellation policies, customer support details.
- Verified legal/product label information, privacy policy and terms, tax/accounting configuration as applicable.
- Automated tests and real browser/device QA; this code has not been independently security-audited.
