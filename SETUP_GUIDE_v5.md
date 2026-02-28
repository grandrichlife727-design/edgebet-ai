# EdgeBet AI v5.0 - Complete Setup Guide

## 🚀 What's New in v5.0

### Membership Tiers
- **Free** - 2 picks/day, basic tools
- **Pro ($19.99/mo)** - Unlimited picks, parlay builder, steam moves
- **Sharp ($49.99/mo)** - Everything + Discord, arbs, priority support

### Features
- ✅ Stripe checkout with 7-day free trial
- ✅ User authentication (register/login)
- ✅ 3-step onboarding flow
- ✅ Paywall when limits reached
- ✅ Referral system (Give $10, Get $10)
- ✅ Discord bot with slash commands

---

## 📋 Environment Variables Required

Add these to your **Render Dashboard**:

```bash
# Required
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_SHARP=price_...

# Optional but recommended
REDIS_URL=redis://...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BOT_TOKEN=...
```

---

## 🔧 Stripe Setup (Step-by-Step)

### 1. Create Stripe Account
- Go to https://stripe.com
- Complete onboarding
- Switch to LIVE mode (when ready)

### 2. Create Products & Prices

**Pro Plan:**
```
Product: EdgeBet Pro
Price: $19.99/month
Recurring: Yes
Price ID: copy this (starts with price_)
```

**Sharp Plan:**
```
Product: EdgeBet Sharp
Price: $49.99/month
Recurring: Yes
Price ID: copy this (starts with price_)
```

### 3. Get API Keys
- Dashboard → Developers → API Keys
- Copy **Secret key** (starts with sk_live_)
- Add to Render env vars

### 4. Webhook Setup
- Dashboard → Developers → Webhooks
- Add endpoint: `https://edgebet-backend-1.onrender.com/stripe/webhook`
- Select events:
  - `checkout.session.completed`
  - `invoice.payment_failed`
- Copy **Signing secret** (starts with whsec_)
- Add to Render env vars

### 5. Success/Cancel URLs
In your Stripe settings, set:
- Success URL: `https://grandrichlife727-design.github.io/edgebet-ai/success`
- Cancel URL: `https://grandrichlife727-design.github.io/edgebet-ai/cancel`

---

## 🤖 Discord Bot Setup

### 1. Create Discord App
- Go to https://discord.com/developers/applications
- New Application → Name it "EdgeBet AI"
- Copy Application ID

### 2. Bot Setup
- Go to "Bot" tab
- Add Bot
- Copy Token (this is DISCORD_BOT_TOKEN)
- Enable "Message Content Intent"

### 3. Create Slash Commands
```bash
curl -X POST \
  -H "Authorization: Bot YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "picks",
    "description": "Get today\'s top picks"
  }' \
  https://discord.com/api/v10/applications/YOUR_APP_ID/commands

curl -X POST \
  -H "Authorization: Bot YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ev",
    "description": "Calculate expected value",
    "options": [
      {"name": "odds", "description": "American odds", "type": 3, "required": true},
      {"name": "probability", "description": "True win %", "type": 3, "required": true}
    ]
  }' \
  https://discord.com/api/v10/applications/YOUR_APP_ID/commands

curl -X POST \
  -H "Authorization: Bot YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "arb",
    "description": "Show arbitrage opportunities"
  }' \
  https://discord.com/api/v10/applications/YOUR_APP_ID/commands

curl -X POST \
  -H "Authorization: Bot YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "tier",
    "description": "View membership tiers"
  }' \
  https://discord.com/api/v10/applications/YOUR_APP_ID/commands
```

### 4. Webhook (Optional but easier)
- In your Discord server → Server Settings → Integrations → Webhooks
- New Webhook → Copy URL
- This is DISCORD_WEBHOOK_URL (no bot token needed)

---

## 🌐 Domain Setup (Optional but Recommended)

### Get a Domain
Recommended: https://porkbun.com or https://namecheap.com
- Search: `edgebet.ai` or similar
- Buy domain (~$10-50/year)

### Connect to GitHub Pages
1. GitHub repo → Settings → Pages
2. Custom domain: `yourdomain.com`
3. Enforce HTTPS: ✅

### Connect Backend (Render)
1. Render dashboard → Your service → Settings
2. Custom domain: `api.yourdomain.com`
3. Follow Render's DNS instructions

---

## 📊 User Flow

1. **Landing** → Home page with tool preview
2. **Sign Up** → Email/password
3. **Onboarding** → 3 steps (sports, experience, trial intro)
4. **App Access** → Free tier (2 picks/day)
5. **Paywall** → When limit hit, show upgrade options
6. **Checkout** → Stripe 7-day trial
7. **Full Access** → Pro/Sharp features unlocked

---

## 🧪 Testing Checklist

Before launching:

- [ ] Register new account
- [ ] Complete onboarding
- [ ] Scan picks (free limit)
- [ ] Hit paywall
- [ ] Start Pro trial (use Stripe test card: 4242 4242 4242 4242)
- [ ] Verify unlimited picks
- [ ] Test Discord bot (if configured)
- [ ] Test referral link

---

## 🚀 Launch Checklist

- [ ] All Stripe env vars added to Render
- [ ] Domain purchased and connected
- [ ] Discord bot created (optional)
- [ ] Test entire user flow
- [ ] Set Stripe to LIVE mode
- [ ] Add privacy policy & terms
- [ ] Configure email (SendGrid/Postmark) for receipts

---

## 💰 Revenue Projection

With your pricing:

**Conservative (100 users):**
- 70% Free: $0
- 25% Pro: 25 × $20 = $500/mo
- 5% Sharp: 5 × $50 = $250/mo
- **Total: $750/mo**

**Target (1,000 users):**
- 70% Free: $0
- 25% Pro: 250 × $20 = $5,000/mo
- 5% Sharp: 50 × $50 = $2,500/mo
- **Total: $7,500/mo**

---

## 🆘 Troubleshooting

**Stripe checkout fails:**
- Check STRIPE_SECRET_KEY is live key
- Verify price IDs are correct
- Check webhook secret is set

**Discord bot not working:**
- Verify bot token
- Check bot has permissions in server
- Use webhook URL instead (simpler)

**Users can't register:**
- Check backend is deployed
- Verify CORS settings
- Check browser console for errors

---

**Commits:**
- Backend v5.0: `779ce19`
- Frontend v5.0: `82cb3b4`

**Live URLs:**
- Frontend: https://grandrichlife727-design.github.io/edgebet-ai/
- Backend: https://edgebet-backend-1.onrender.com

Ready to launch! 🚀
