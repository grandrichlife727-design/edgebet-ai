# 🚀 Complete Deployment Guide

This guide will walk you through deploying EdgeBet AI to production.

## 📋 Prerequisites

- GitHub account (✅ Done)
- Render account (free)
- Stripe account (free to start)
- The Odds API key (✅ Already configured)

---

## Part 1: Push Latest Code to GitHub

### Option A: GitHub Desktop (Easiest)
1. Open GitHub Desktop
2. You should see the new files (README.md, index.html)
3. Write commit message: "Add deployment files"
4. Click "Commit to main"
5. Click "Push origin"

### Option B: Command Line
```bash
cd /Users/fortunefavorites/clawd
git add -A
git commit -m "Add deployment files - README, index redirect, render config"
git push origin main
# Enter your GitHub username and Personal Access Token when prompted
```

---

## Part 2: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account
4. Authorize Render to access your repos

### Step 2: Create Web Service
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Find and select your `edgebet-ai` repo
3. Configure:
   ```
   Name: edgebet-api
   Region: Ohio (US East) - closest to most users
   Branch: main
   Root Directory: edgebet-backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Plan: Starter ($7/month) or Free
   ```
4. Click **"Create Web Service"**

### Step 3: Add Environment Variables
While the service is being created, click **"Environment"** tab:

```bash
# Required - Already have this
ODDS_API_KEY=316ba9e3bd49f1c65f604a292e1962a8

# Required - From Stripe (see Part 3)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Will be auto-added when you create database
DATABASE_URL=postgresql://...

# CORS settings
CORS_ORIGINS=https://grandrichlife727-design.github.io,http://localhost:3000
```

### Step 4: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `edgebet-db`
3. Plan: Free or Starter
4. Click **"Create Database"**
5. Wait for it to be created
6. Go back to your web service
7. The `DATABASE_URL` will be automatically added

### Step 5: Deploy
1. Go back to your web service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for build to complete (2-3 minutes)
4. Check the logs - you should see:
   ```
   ✅ Database connected
   ✅ Stripe configured
   ✅ The Odds API configured
   🚀 EdgeBet API server running on port 10000
   ```

### Step 6: Test Backend
```bash
# Visit these URLs in your browser:
https://your-service-name.onrender.com/health
# Should show: {"status":"ok","services":{"odds_api":"configured"}}

https://your-service-name.onrender.com/scan
# Should return real picks!
```

---

## Part 3: Set Up Stripe

### Step 1: Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Sign up (free)
3. Complete basic profile

### Step 2: Get API Keys
1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Click **"Create secret key"**
3. Copy the **Secret key** (starts with `sk_live_` or `sk_test_`)
4. Add to Render environment variables as `STRIPE_SECRET_KEY`

### Step 3: Create Products
1. Go to **Products** → **Add product**
2. Create Pro Plan:
   - Name: "Pro Plan"
   - Description: "Unlimited picks, all sports"
   - Price: $9.99 / month
3. Create Sharp Plan:
   - Name: "Sharp Plan"
   - Description: "Everything + Discord + early picks"
   - Price: $29.99 / month
4. Copy the **Price IDs** (starts with `price_`)
5. You'll need these for the checkout integration

### Step 4: Set Up Webhook
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-render-url.onrender.com/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Render as `STRIPE_WEBHOOK_SECRET`

---

## Part 4: Set Up GitHub Pages (Frontend)

### Step 1: Enable Pages
1. Go to https://github.com/grandrichlife727-design/edgebet-ai
2. Click **Settings** tab
3. In left sidebar, click **Pages**
4. Source: **Deploy from a branch**
5. Branch: **main** / **/(root)**
6. Click **Save**

### Step 2: Wait for Deployment
- Takes 2-3 minutes
- Refresh the page until you see:
  ```
  🟢 Your site is live at:
  https://grandrichlife727-design.github.io/edgebet-ai/
  ```

### Step 3: Update Backend URL in Frontend
1. Open `edgebet-preview.html` (or create a production version)
2. Find the `BACKEND` variable
3. Change from:
   ```javascript
   const BACKEND = "https://YOUR-NEW-BACKEND.onrender.com";
   ```
   To your actual Render URL:
   ```javascript
   const BACKEND = "https://edgebet-api.onrender.com";
   ```
4. Commit and push the change

---

## Part 5: Custom Domain (Optional)

### GitHub Pages Custom Domain
1. Buy domain (Namecheap, GoDaddy, etc.)
2. In GitHub repo: Settings → Pages → Custom domain
3. Enter: `www.yourdomain.com`
4. Add DNS records at your registrar:
   ```
   Type: CNAME
   Name: www
   Value: grandrichlife727-design.github.io
   ```

### Render Custom Domain
1. In Render dashboard, go to your web service
2. Settings → Custom Domain
3. Add your domain
4. Follow DNS instructions

---

## Part 6: Post-Deployment Checklist

### Test Everything
```bash
# 1. Frontend loads
open https://grandrichlife727-design.github.io/edgebet-ai/

# 2. Backend health check
curl https://your-render-url.onrender.com/health

# 3. Backend returns picks
curl https://your-render-url.onrender.com/scan

# 4. Stripe checkout works
# Click "Upgrade to Pro" in the app
# Should redirect to Stripe checkout
```

### Update Documentation
1. Update README.md with your actual URLs
2. Update Render environment variables if needed
3. Test payment flow with test card:
   - Card: 4242 4242 4242 4242
   - Exp: Any future date
   - CVC: Any 3 digits

### Launch!
1. Post on social media using the graphics in `/graphics/`
2. Share your GitHub Pages URL
3. Start posting daily picks

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Make sure database is created and connected

### Frontend shows blank page
- Check browser console for errors
- Verify CORS_ORIGINS includes your frontend URL
- Make sure React is loading (check Network tab)

### No picks returned
- Check ODDS_API_KEY is correct
- Check `/health` endpoint shows odds_api: configured
- Verify you have API quota remaining

### Stripe payments not working
- Check STRIPE_SECRET_KEY is correct
- Verify webhook endpoint is correct
- Check webhook events are being received

---

## 📞 Need Help?

- Render Docs: https://render.com/docs
- GitHub Pages: https://pages.github.com
- Stripe Docs: https://stripe.com/docs
- The Odds API: https://the-odds-api.com/

---

## 🎉 You're Live!

Once everything is deployed:

| Component | URL |
|-----------|-----|
| Frontend | https://grandrichlife727-design.github.io/edgebet-ai/ |
| Backend | https://your-service.onrender.com |
| API Docs | https://your-service.onrender.com/health |

**Start marketing and getting users!** 🚀
