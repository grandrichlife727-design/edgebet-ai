# EdgeBet AI - Stripe Integration Deployment Guide

## Overview
This guide walks you through deploying the secure Stripe integration for EdgeBet AI.

## Files Created

| File | Purpose |
|------|---------|
| `edgebet.html` (updated) | Frontend with security fixes and redirect handling |
| `edgebet-backend/server.js` | Express API with Stripe webhooks |
| `edgebet-backend/package.json` | Dependencies |
| `edgebet-backend/schema.sql` | Database schema |

## Step 1: Set Up PostgreSQL Database

### Option A: Render PostgreSQL (Recommended)
1. Go to https://dashboard.render.com
2. Create a new **PostgreSQL** service
3. Copy the **Internal Database URL** (starts with `postgres://`)
4. Note: Render provides this for free

### Option B: Local/Other Provider
1. Create a PostgreSQL database
2. Run the schema:
   ```bash
   psql -d your_database -f edgebet-backend/schema.sql
   ```

## Step 2: Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Create a new **Web Service**
3. Connect your GitHub repo or upload the `edgebet-backend` folder
4. Configure:
   - **Name**: `edgebet-api`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgres_url_here
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. Deploy!

## Step 3: Configure Stripe

### Create Products & Prices
1. Go to https://dashboard.stripe.com/products
2. Create "Pro Plan":
   - Price: $19.99/month, recurring
   - Add metadata: `plan = pro`
3. Create "Sharp Plan":
   - Price: $49.99/month, recurring
   - Add metadata: `plan = sharp`

### Get API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Secret key** (starts with `sk_live_`)
3. Add to Render environment variables

### Configure Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://edgebet-api.onrender.com/webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to Render environment variables

### Configure Payment Links
1. Go to https://dashboard.stripe.com/payment-links
2. Create link for Pro Plan
3. Set:
   - Success URL: `https://edgebet.app/?payment=success&plan=pro`
   - Cancel URL: `https://edgebet.app/?payment=cancelled`
4. Repeat for Sharp Plan

## Step 4: Update Frontend

1. Update `BACKEND` URL in `edgebet.html`:
   ```javascript
   const BACKEND = "https://edgebet-api.onrender.com";
   ```

2. Update Stripe Payment Links in `PLANS` array:
   ```javascript
   stripeLink: "https://buy.stripe.com/YOUR_PRO_LINK_HERE"
   ```

## Step 5: Test the Flow

### Test Mode (Before Going Live)
1. Use Stripe test keys (`sk_test_`)
2. Use test card: `4242 4242 4242 4242`
3. Any future date, any 3-digit CVC
4. Complete a purchase
5. Check webhook delivery in Stripe Dashboard
6. Verify database entry created

### Test Webhooks Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhook
```

## Step 6: Go Live

1. Switch to Stripe Live mode
2. Update environment variables with live keys
3. Redeploy backend
4. Update frontend with live Payment Links
5. Test with real card (small amount)

## Troubleshooting

### Webhook not working?
- Check Render logs: `https://dashboard.render.com/web-services/edgebet-api/logs`
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure endpoint URL is publicly accessible

### Database connection failing?
- Verify `DATABASE_URL` format: `postgres://user:pass@host:5432/dbname`
- Check Render PostgreSQL is running
- For local dev, use `postgresql://localhost:5432/edgebet`

### Frontend not detecting subscription?
- Check browser Network tab for `/subscription/:email` calls
- Verify backend is responding with correct plan
- Clear localStorage and refresh

## Security Notes

✅ **What's Protected:**
- Plan status verified server-side (can't be bypassed with DevTools)
- Webhook signatures verified
- Database stores canonical subscription state

⚠️ **Still To Do:**
- Add rate limiting to API endpoints
- Implement JWT authentication for API calls
- Add IP allowlisting for webhook endpoint (optional)

## Next Steps

1. **Add analytics** - Track conversion rates, churn
2. **Email receipts** - Configure in Stripe Dashboard
3. **Dunning management** - Handle failed payments
4. **Cancellation flow** - Add survey before cancelling

## Support

- Stripe Docs: https://stripe.com/docs
- Render Docs: https://render.com/docs
- Webhook Testing: https://dashboard.stripe.com/test/webhooks
