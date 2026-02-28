# ⚡ EdgeBet AI

AI-powered sports betting picks with real-time odds analysis. Find edges across NBA, NFL, NHL, NCAAB & MLB.

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://grandrichlife727-design.github.io/edgebet-ai/)
[![Backend](https://img.shields.io/badge/backend-render-blue)](https://render.com)
[![License](https://img.shields.io/badge/license-MIT-yellow)](./license.txt)

## 🎯 What It Does

EdgeBet AI scans multiple sportsbooks to find value betting opportunities:

- **Real-time odds** from 8+ sportsbooks
- **Line shopping** - finds best prices automatically
- **Edge calculation** - identifies market inefficiencies
- **Confidence scoring** - 65-95% based on data quality
- **Multi-sport** - NBA, NFL, NHL, NCAAB, MLB

## 🚀 Quick Start.

### Live Demo
👉 **[Try the App](https://grandrichlife727-design.github.io/edgebet-ai/edgebet-preview.html)**

### Local Development

```bash
# Clone the repo
git clone https://github.com/grandrichlife727-design/edgebet-ai.git
cd edgebet-ai

# Start frontend (simple HTML)
python3 -m http.server 8000
# Open http://localhost:8000/edgebet-preview.html

# Start backend
cd edgebet-backend
npm install
npm start
# API runs on http://localhost:3000
```

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   The Odds API  │
│  (React/HTML)   │     │  (Node/Express)  │     │  (Real odds)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   PostgreSQL     │
                        │  (Subscriptions) │
                        └──────────────────┘
```

## 📁 Project Structure

```
edgebet-ai/
├── edgebet-backend/          # Node.js API server
│   ├── server.js            # Main Express app
│   ├── odds-api-integration.js  # Real odds fetching
│   ├── package.json         # Dependencies
│   └── render.yaml          # Render.com config
├── edgebet-preview.html     # Frontend demo
├── graphics/                # Social media templates
│   ├── launch-graphic.html
│   ├── pick-preview.html
│   └── win-celebration.html
├── LAUNCH_PACKAGE_SUMMARY.md    # Marketing guides
├── DEPLOYMENT_CHECKLIST.md      # Deploy instructions
└── ODDS_INTEGRATION_SETUP.md    # API setup guide
```

## 🔧 Backend API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scan` | Get today's value picks |
| GET | `/scan` | Same as POST |
| GET | `/health` | Health check |
| POST | `/webhook` | Stripe webhooks |
| GET | `/subscription/:email` | Check user plan |

### Example Response

```json
{
  "consensus_picks": [
    {
      "id": "123-lakers",
      "sport": "NBA",
      "game": "Lakers vs Nuggets",
      "bet": "Lakers -3.5",
      "odds": "-110",
      "edge": 5.2,
      "confidence": 78,
      "model_breakdown": {
        "value": "B+",
        "best_book": "FanDuel"
      }
    }
  ]
}
```

## 🎨 Social Media Assets

Ready-to-use graphics in `/graphics/`:

| File | Size | Use For |
|------|------|---------|
| `launch-graphic.html` | 1080x1080 | Launch announcement |
| `pick-preview.html` | 1080x1350 | Daily picks |
| `win-celebration.html` | 1080x1350 | Results posts |
| `quote-graphic.html` | 1080x1080 | Motivational quotes |

Open in browser → Screenshot → Post to Instagram/TikTok

## 🚀 Deployment

### Backend (Render)

1. Fork this repo
2. Go to [render.com](https://render.com)
3. Create new **Web Service**
4. Connect your GitHub repo
5. Set environment variables:
   ```
   ODDS_API_KEY=your_key_here
   STRIPE_SECRET_KEY=sk_live_...
   DATABASE_URL=postgresql://...
   ```
6. Deploy!

### Frontend (GitHub Pages)

Already configured! Your app is live at:
```
https://grandrichlife727-design.github.io/edgebet-ai/edgebet-preview.html
```

To update: just push to `main` branch.

## 💰 Monetization

- **Free tier**: 2 picks/day
- **Pro plan**: $9.99/month - unlimited picks
- **Sharp plan**: $29.99/month - includes Discord + early picks
- **Affiliate**: FanDuel, DraftKings, BetMGM links

## 🔑 Environment Variables

Create `.env` in `edgebet-backend/`:

```bash
# Required
ODDS_API_KEY=your_odds_api_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...

# Optional
PORT=3000
NODE_ENV=production
ADMIN_API_KEY=your_admin_key
```

## 🧪 Testing

```bash
cd edgebet-backend

# Test odds API connection
node test-odds-api.js

# Test scan algorithm
node test-scan-only.js

# Run server tests
node test-server.js
```

## 📊 The Algorithm

**Not AI** - it's honest edge detection:

1. **Fetch odds** from 8+ sportsbooks
2. **Compare lines** for each game
3. **Find best price** (line shopping)
4. **Calculate edge** from market variance
5. **Return top picks** sorted by edge

**Example:**
- FanDuel: Lakers -4.0 (-110)
- DraftKings: Lakers -3.5 (-110)
- BetMGM: Lakers -3.5 (-115)

→ **Edge**: Getting -3.5 vs -4.0 = +1.5% value

## 📝 License

MIT License - see [license.txt](./license.txt)

## 🙏 Credits

- Odds data: [The Odds API](https://the-odds-api.com/)
- Payments: [Stripe](https://stripe.com/)
- Hosting: [Render](https://render.com/) + [GitHub Pages](https://pages.github.com/)

---

**Ready to find edges?** [Launch the app →](https://grandrichlife727-design.github.io/edgebet-ai/edgebet-preview.html)
