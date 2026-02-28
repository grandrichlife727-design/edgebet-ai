#!/bin/bash
# deploy.sh - Complete deployment script for EdgeBet AI

echo "🚀 EdgeBet AI - Complete Deployment Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo -e "${RED}Error: Please run this script from the edgebet-ai directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Committing latest changes...${NC}"
git add -A
git commit -m "Prepare for deployment - add README and index redirect"

echo ""
echo -e "${YELLOW}Step 2: Pushing to GitHub...${NC}"
echo "You may need to authenticate. Options:"
echo "  1. Use GitHub Desktop"
echo "  2. Use Personal Access Token"
echo "  3. Use SSH key"
echo ""

# Try to push
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Push failed. Please push manually.${NC}"
    echo "   Try: git push origin main"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}📋 Deployment Checklist${NC}"
echo "=========================================="
echo ""
echo "☐ Backend (Render.com):"
echo "   1. Go to https://render.com"
echo "   2. Sign up/login with GitHub"
echo "   3. Click 'New +' → 'Web Service'"
echo "   4. Connect your GitHub repo"
echo "   5. Use these settings:"
echo "      - Root Directory: edgebet-backend"
echo "      - Build Command: npm install"
echo "      - Start Command: node server.js"
echo "   6. Add environment variables:"
echo "      - ODDS_API_KEY=316ba9e3bd49f1c65f604a292e1962a8"
echo "      - STRIPE_SECRET_KEY=sk_live_..."
echo "      - STRIPE_WEBHOOK_SECRET=whsec_..."
echo "   7. Click 'Create Web Service'"
echo ""
echo "☐ Frontend (GitHub Pages):"
echo "   1. Go to https://github.com/grandrichlife727-design/edgebet-ai"
echo "   2. Click Settings → Pages"
echo "   3. Source: Deploy from a branch"
echo "   4. Branch: main / (root)"
echo "   5. Click Save"
echo "   6. Wait 2-3 minutes"
echo "   7. Your site will be at:"
echo "      https://grandrichlife727-design.github.io/edgebet-ai/"
echo ""
echo "☐ Stripe Setup:"
echo "   1. Go to https://dashboard.stripe.com"
echo "   2. Create products:"
echo "      - Pro Plan: $9.99/month"
echo "      - Sharp Plan: $29.99/month"
echo "   3. Get API keys from Developers → API keys"
echo "   4. Add to Render environment variables"
echo ""
echo "☐ Database (Render):"
echo "   1. In Render dashboard, click 'New +'"
echo "   2. Select 'PostgreSQL'"
echo "   3. Name: edgebet-db"
echo "   4. Create database"
echo "   5. Copy Internal Database URL"
echo "   6. Add as DATABASE_URL in web service"
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Once deployed, your app will be live!${NC}"
echo "=========================================="
echo ""
echo "Frontend: https://grandrichlife727-design.github.io/edgebet-ai/"
echo "Backend:  https://edgebet-api.onrender.com (or your custom name)"
echo ""
echo "Need help? Check DEPLOYMENT_CHECKLIST.md"
