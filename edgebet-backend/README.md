# EdgeBet AI Backend

Production-ready Stripe webhook handler and API for EdgeBet AI subscription management.

## Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd edgebet-backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Database Setup
```bash
# Using PostgreSQL
psql -d your_database -f schema.sql
```

### 4. Run Locally
```bash
npm run dev
```

## Deploy to Render

### Option A: One-Click Deploy (Recommended)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/edgebet-backend)

### Option B: Manual Deploy
1. Create new **Web Service** on Render
2. Connect your GitHub repo
3. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (see below)
5. Deploy!

### Option C: Using render.yaml
1. Push `render.yaml` to your repo
2. Render automatically detects and provisions:
   - Web service
   - PostgreSQL database
   - Environment variables

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` or `development` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (sk_live_ or sk_test_) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret (whsec_...) |
| `PORT` | No | Server port (default: 3000) |

## API Endpoints

### Health Check
```
GET /health
```

### Check Subscription
```
GET /subscription/:email
Response: { plan: 'pro'|'sharp'|'free', active: boolean, expiresAt: timestamp }
```

### Stripe Webhook
```
POST /webhook
```

### Customer Portal
```
POST /create-portal-session
Body: { email: string }
Response: { url: string }
```

## Stripe Configuration

### Required Webhook Events
- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.deleted`
- `customer.subscription.updated`

### Payment Links Setup
Configure in Stripe Dashboard:
- Success URL: `https://edgebet.app/?payment=success&plan=pro`
- Cancel URL: `https://edgebet.app/?payment=cancelled`

## Database Schema

See `schema.sql` for full schema.

Key tables:
- `subscriptions` - Tracks all active/past subscriptions

## Testing

### Local Webhook Testing
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/webhook
```

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Require auth: `4000 0025 0000 3155`

## Troubleshooting

### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint URL matches exactly

### Database connection errors
- Verify `DATABASE_URL` format
- Check Render PostgreSQL is running
- For local: ensure PostgreSQL is installed

### Subscription not updating
- Check webhook is receiving events
- Verify database has row for customer
- Check Stripe Dashboard for failed webhooks

## License

MIT
