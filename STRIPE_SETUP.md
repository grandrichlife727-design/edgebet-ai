# Stripe Implementation Checklist for EdgeBet AI

## Step 1: Configure Stripe Dashboard

### Create Products & Prices
1. Go to https://dashboard.stripe.com/products
2. Create "Pro Plan" product:
   - Price: $19.99/month
   - Recurring: Monthly
   - Metadata: `plan: pro`
3. Create "Sharp Plan" product:
   - Price: $49.99/month
   - Recurring: Monthly
   - Metadata: `plan: sharp`

### Set Up Payment Links
1. Go to https://dashboard.stripe.com/payment-links
2. Create links for each plan
3. Configure:
   - **Success URL**: `https://edgebet.app/?payment=success&plan=pro`
   - **Cancel URL**: `https://edgebet.app/?payment=cancelled`
   - Enable "Collect email address"

### Configure Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://YOUR-BACKEND.onrender.com/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (starts with `whsec_`)

## Step 2: Environment Variables

Add these to your backend environment:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

And for development:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 3: Database Schema

Add a `subscriptions` table:

```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(255) UNIQUE NOT NULL,  -- Stripe customer ID
  email VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL,  -- 'pro' or 'sharp'
  subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',  -- 'active', 'past_due', 'cancelled'
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
```

## Step 4: Testing

### Test the Payment Flow
1. Use Stripe test mode
2. Test card: `4242 4242 4242 4242`
3. Any future date, any 3-digit CVC, any ZIP

### Test Webhooks Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhook
```

### Test Security
1. Try setting `localStorage.setItem('edgebet_plan', 'pro')` - should not work
2. Backend should always verify against database

## Step 5: Production Checklist

- [ ] Switch to Stripe Live mode
- [ ] Update all URLs to production domain
- [ ] Set up Stripe Customer Portal for subscription management
- [ ] Configure email receipts in Stripe Dashboard
- [ ] Add Terms of Service and Privacy Policy links
- [ ] Test full flow end-to-end with real card (small amount)
- [ ] Set up monitoring/alerts for failed webhooks

## Quick Fixes for Current Implementation

### Immediate (5 minutes):
1. Update PLANS array with redirect URLs (see auth-upgrade.js)
2. Add payment redirect handling to Page component
3. Add basic backend verification endpoint

### Short-term (1 hour):
1. Set up webhook endpoint
2. Add database storage for subscriptions
3. Implement periodic plan verification

### Long-term (1 day):
1. Full subscription management portal
2. Invoice history
3. Subscription analytics dashboard
