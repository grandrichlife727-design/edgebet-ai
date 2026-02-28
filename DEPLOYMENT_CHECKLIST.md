# EdgeBet AI - Complete Deployment Checklist

## Phase 1: Pre-Deployment (Before Render)

### ✅ Stripe Setup
- [ ] Create Stripe account (if not done)
- [ ] Switch to Test mode
- [ ] Create "Pro Plan" product ($19.99/month)
- [ ] Create "Sharp Plan" product ($49.99/month)
- [ ] Get Test API keys (sk_test_...)
- [ ] Save keys securely

### ✅ GitHub Repository
- [ ] Create new GitHub repo
- [ ] Push edgebet-backend folder
- [ ] Add README.md
- [ ] Create .gitignore (node_modules, .env)

### ✅ Local Testing
```bash
cd /Users/fortunefavors/clawd/edgebet-backend
npm install
# Create .env file with test keys
npm start
# Test: curl http://localhost:3000/health
```

---

## Phase 2: Render Deployment

### Step 1: Create PostgreSQL Database
1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Name: `edgebet-db`
4. Region: Oregon (or closest to you)
5. Instance Type: Starter ($7/month)
6. Click **Create Database**
7. Wait for status = "Available"
8. Copy **Internal Database URL**

### Step 2: Deploy Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - Name: `edgebet-api`
   - Region: Same as database
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Click **Advanced**
5. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://... (paste from step 1)
   STRIPE_SECRET_KEY=sk_test_...
   ```
6. Click **Create Web Service**
7. Wait for first deploy (may fail - that's OK)

### Step 3: Initialize Database
1. Go to your PostgreSQL service
2. Click **Connect**
3. Copy the PSQL command
4. Run in terminal:
   ```bash
   psql <connection string from Render>
   ```
5. Paste contents of schema.sql
6. Type `\q` to exit

### Step 4: Configure Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks (Test mode)
2. Click **Add endpoint**
3. Endpoint URL: `https://edgebet-api.onrender.com/webhook`
4. Select events:
   - checkout.session.completed
   - invoice.paid
   - invoice.payment_failed
   - customer.subscription.deleted
   - customer.subscription.updated
5. Click **Add endpoint**
6. Click on the new endpoint
7. Copy **Signing secret** (whsec_...)
8. Go back to Render → your web service → Environment
9. Add: `STRIPE_WEBHOOK_SECRET=whsec_...`
10. Click **Save Changes**
11. Click **Manual Deploy** → **Deploy latest commit**

### Step 5: Verify Deployment
```bash
# Test health endpoint
curl https://edgebet-api.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"...","database":"connected","services":{"stripe":"configured"}}
```

---

## Phase 3: Frontend Updates

### Update edgebet.html
1. Change BACKEND URL:
   ```javascript
   const BACKEND = "https://edgebet-api.onrender.com";
   ```

2. Update Stripe Payment Links:
   ```javascript
   stripeLink: "https://buy.stripe.com/14A28r6qJ9nh206gEcgYU00?success_url=https%3A%2F%2Fedgebet.app%2F%3Fpayment%3Dsuccess%26plan%3Dpro&cancel_url=https%3A%2F%2Fedgebet.app%2F"
   ```

### Update landing.html
Same Stripe links as above (already done ✓)

---

## Phase 4: Testing

### Test Payment Flow
1. Open edgebet.html in browser
2. Log in as test user
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future date, any CVC, any ZIP
6. Complete payment
7. Check webhook logs in Stripe Dashboard
8. Verify database has subscription record
9. Check app shows "Pro" plan

### Test Webhook Locally (Optional)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/webhook

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

---

## Phase 5: Go Live

### Switch to Production
1. In Stripe Dashboard, switch to **Live mode**
2. Create products again in Live mode
3. Get Live API keys (sk_live_...)
4. Update Render environment variables with LIVE keys
5. Update Stripe webhook to use LIVE endpoint secret
6. Update frontend with Live Payment Links
7. Redeploy

### Final Checklist
- [ ] Test with real card (small amount, then refund)
- [ ] Verify email receipts work
- [ ] Test customer portal
- [ ] Test cancellation flow
- [ ] Set up monitoring/alerts
- [ ] Document any issues

---

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL format
- Ensure database is in same region as web service
- Try using External Database URL temporarily

### "Webhook signature verification failed"
- Double-check STRIPE_WEBHOOK_SECRET
- Ensure no extra whitespace
- Check webhook URL matches exactly

### "Subscription not updating"
- Check Stripe webhook delivery logs
- Verify webhook is returning 200
- Check server logs on Render

### "CORS errors in browser"
- Add your domain to CORS_ORIGINS
- Include http:// and https:// variants
- Include www and non-www

---

## Post-Deployment

### Monitoring
- Set up UptimeRobot (free) to ping /health every 5 minutes
- Check Render logs weekly
- Monitor Stripe webhook failures

### Scaling
- Upgrade database plan if needed
- Add Redis for caching (optional)
- Enable connection pooling

### Backup
- Render PostgreSQL has automated backups
- Export data monthly: `pg_dump $DATABASE_URL > backup.sql`

---

## Quick Commands Reference

```bash
# Check logs
render logs --service edgebet-api

# Restart service
render deploy --service edgebet-api

# Database connection
psql $DATABASE_URL

# Health check
curl https://edgebet-api.onrender.com/health

# Subscription check
curl https://edgebet-api.onrender.com/subscription/user@example.com
```

---

## Support Resources

- Render Docs: https://render.com/docs
- Stripe Docs: https://stripe.com/docs/webhooks
- Webhook Testing: https://dashboard.stripe.com/test/webhooks
- API Reference: https://stripe.com/docs/api

---

**Estimated Time:** 30-45 minutes for first deploy
**Estimated Cost:** $7/month (Render Starter DB) + usage

You've got this! 🚀
