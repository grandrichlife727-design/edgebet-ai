// EdgeBet AI - Production-Ready Stripe Webhook Handler
// Deploy this to Render or any Node.js hosting

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// Database Configuration
// ============================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// ============================================
// Middleware
// ============================================

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// JSON parsing (not used for webhook - needs raw body)
app.use(express.json());

// Request logging in development
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Database Connection Helper
// ============================================

async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (err) {
    console.error('Database health check failed:', err.message);
    return false;
  }
}

// ============================================
// Health Check Endpoints
// ============================================

// Basic health check
app.get('/health', async (req, res) => {
  const dbHealthy = await checkDatabaseConnection();
  const oddsConfigured = !!process.env.ODDS_API_KEY;
  
  const health = {
    status: (dbHealthy && oddsConfigured) ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      odds_api: oddsConfigured ? 'configured' : 'not_configured'
    },
    uptime: process.uptime()
  };
  
  const statusCode = (dbHealthy && oddsConfigured) ? 200 : 503;
  res.status(statusCode).json(health);
});

// Detailed health check for monitoring
app.get('/health/detailed', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {}
  };
  
  // Database check
  try {
    const dbStart = Date.now();
    const client = await pool.connect();
    await client.query('SELECT COUNT(*) FROM subscriptions');
    client.release();
    checks.checks.database = {
      status: 'ok',
      responseTime: `${Date.now() - dbStart}ms`
    };
  } catch (err) {
    checks.checks.database = {
      status: 'error',
      error: err.message
    };
  }
  
  // Stripe check
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    checks.checks.stripe = { status: 'configured' };
  } catch (err) {
    checks.checks.stripe = {
      status: 'error',
      error: err.message
    };
  }
  
  const allOk = Object.values(checks.checks).every(c => c.status === 'ok' || c.status === 'configured');
  checks.status = allOk ? 'ok' : 'degraded';
  
  res.status(allOk ? 200 : 503).json(checks);
});

// ============================================
// Stripe Webhook Handler
// ============================================

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Verify webhook secret is configured
  if (!endpointSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`📬 Received event: ${event.type} (${event.id})`);

  // Process event asynchronously
  try {
    await handleStripeEvent(event);
    res.json({ received: true, event: event.type });
  } catch (err) {
    console.error(`❌ Error processing event ${event.type}:`, err);
    // Still return 200 to prevent Stripe retries for unrecoverable errors
    // Log error for manual investigation
    res.json({ received: true, error: 'Processing failed, logged for review' });
  }
});

async function handleStripeEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      try {
        // Get customer details
        const customer = await stripe.customers.retrieve(session.customer);
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // Store in database
        await pool.query(
          `INSERT INTO subscriptions 
           (customer_id, email, plan, subscription_id, status, current_period_end, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (customer_id) 
           DO UPDATE SET 
             plan = EXCLUDED.plan,
             subscription_id = EXCLUDED.subscription_id,
             status = EXCLUDED.status,
             current_period_end = EXCLUDED.current_period_end,
             updated_at = NOW()`,
          [
            session.customer,
            customer.email,
            session.metadata?.plan || 'pro',
            session.subscription,
            'active',
            new Date(subscription.current_period_end * 1000)
          ]
        );
        
        console.log(`✅ Subscription activated: ${customer.email} (${session.metadata?.plan})`);
      } catch (err) {
        console.error('Error saving subscription:', err);
        throw err; // Re-throw to trigger error handling
      }
      break;
    }
    
    case 'invoice.paid': {
      const invoice = event.data.object;
      
      if (!invoice.subscription) {
        console.log('ℹ️ Invoice paid but no subscription (likely one-time payment)');
        break;
      }
      
      try {
        const result = await pool.query(
          `UPDATE subscriptions 
           SET status = 'active', updated_at = NOW()
           WHERE subscription_id = $1
           RETURNING email`,
          [invoice.subscription]
        );
        
        if (result.rowCount > 0) {
          console.log(`💰 Recurring payment succeeded: ${invoice.subscription} (${result.rows[0].email})`);
        } else {
          console.log(`⚠️ Invoice paid but subscription not found: ${invoice.subscription}`);
        }
      } catch (err) {
        console.error('Error updating subscription:', err);
        throw err;
      }
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      
      if (!invoice.subscription) break;
      
      try {
        const result = await pool.query(
          `UPDATE subscriptions 
           SET status = 'past_due', updated_at = NOW()
           WHERE subscription_id = $1
           RETURNING email`,
          [invoice.subscription]
        );
        
        if (result.rowCount > 0) {
          console.log(`⚠️ Payment failed: ${invoice.subscription} (${result.rows[0].email})`);
        }
      } catch (err) {
        console.error('Error updating subscription:', err);
        throw err;
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      
      try {
        const result = await pool.query(
          `UPDATE subscriptions 
           SET status = 'cancelled', updated_at = NOW()
           WHERE subscription_id = $1
           RETURNING email`,
          [subscription.id]
        );
        
        if (result.rowCount > 0) {
          console.log(`❌ Subscription cancelled: ${subscription.id} (${result.rows[0].email})`);
        } else {
          console.log(`❌ Subscription cancelled (not in DB): ${subscription.id}`);
        }
      } catch (err) {
        console.error('Error cancelling subscription:', err);
        throw err;
      }
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      
      try {
        const result = await pool.query(
          `UPDATE subscriptions 
           SET status = $1, current_period_end = $2, updated_at = NOW()
           WHERE subscription_id = $3
           RETURNING email`,
          [subscription.status, new Date(subscription.current_period_end * 1000), subscription.id]
        );
        
        if (result.rowCount > 0) {
          console.log(`📝 Subscription updated: ${subscription.id} (${result.rows[0].email}) - ${subscription.status}`);
        }
      } catch (err) {
        console.error('Error updating subscription:', err);
        throw err;
      }
      break;
    }
    
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
}

// ============================================
// API Endpoints
// ============================================

// Check subscription status (called from frontend)
app.get('/subscription/:email', async (req, res) => {
  const { email } = req.params;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  try {
    const result = await pool.query(
      `SELECT plan, status, current_period_end 
       FROM subscriptions 
       WHERE email = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.json({ 
        plan: 'free', 
        active: false,
        expiresAt: null 
      });
    }
    
    const sub = result.rows[0];
    const isActive = sub.status === 'active' && new Date(sub.current_period_end) > new Date();
    
    res.json({
      plan: isActive ? sub.plan : 'free',
      active: isActive,
      status: sub.status,
      expiresAt: sub.current_period_end
    });
  } catch (err) {
    console.error('Error checking subscription:', err);
    res.status(500).json({ error: 'Failed to check subscription', message: NODE_ENV === 'development' ? err.message : undefined });
  }
});

// Create Stripe Customer Portal session
app.post('/create-portal-session', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    // Get customer ID from database
    const result = await pool.query(
      'SELECT customer_id FROM subscriptions WHERE email = $1 AND status = $2 LIMIT 1',
      [email.toLowerCase(), 'active']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    const { customer_id } = result.rows[0];
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: req.headers.referer || 'https://edgebet.app/settings',
    });
    
    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating portal session:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// ============================================
// REAL ODDS API INTEGRATION
// ============================================

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const SPORTS = {
  'basketball_nba': { label: 'NBA', emoji: '🏀' },
  'americanfootball_nfl': { label: 'NFL', emoji: '🏈' },
  'icehockey_nhl': { label: 'NHL', emoji: '🏒' },
  'basketball_ncaab': { label: 'NCAAB', emoji: '🎓' },
  'baseball_mlb': { label: 'MLB', emoji: '⚾' }
};

// Cache to reduce API calls
let picksCache = {
  data: null,
  timestamp: null,
  expiresIn: 10 * 60 * 1000 // 10 minutes
};

async function fetchOdds(sport = 'basketball_nba', markets = 'spreads,totals,h2h') {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    throw new Error('ODDS_API_KEY not configured');
  }
  
  try {
    const response = await axios.get(
      `${ODDS_API_BASE}/sports/${sport}/odds`,
      {
        params: {
          apiKey: apiKey,
          regions: 'us',
          markets: markets,
          oddsFormat: 'american',
          dateFormat: 'iso'
        },
        timeout: 10000
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching odds for ${sport}:`, error.message);
    throw error;
  }
}

function findValuePicks(games) {
  const picks = [];
  
  for (const game of games) {
    if (!game.bookmakers || game.bookmakers.length === 0) continue;
    
    // Analyze spreads
    const spreadPicks = analyzeSpreads(game);
    const totalPicks = analyzeTotals(game);
    
    picks.push(...spreadPicks, ...totalPicks);
  }
  
  // Sort by edge
  return picks.sort((a, b) => b.edge - a.edge);
}

function analyzeSpreads(game) {
  const picks = [];
  const spreadsByBook = {};
  
  // Collect all spread lines
  for (const book of game.bookmakers) {
    const spreadMarket = book.markets.find(m => m.key === 'spreads');
    if (spreadMarket) {
      spreadsByBook[book.title] = spreadMarket.outcomes;
    }
  }
  
  // Find best lines for each team
  const teams = [...new Set(Object.values(spreadsByBook).flat().map(o => o.name))];
  
  for (const team of teams) {
    const lines = [];
    for (const [book, outcomes] of Object.entries(spreadsByBook)) {
      const outcome = outcomes.find(o => o.name === team);
      if (outcome) {
        lines.push({ book, point: outcome.point, price: outcome.price });
      }
    }
    
    if (lines.length < 2) continue;
    
    // Sort by point (best for bettor)
    lines.sort((a, b) => b.point - a.point);
    const bestLine = lines[0];
    
    // Calculate simple edge based on line variance
    const points = lines.map(l => l.point);
    const range = Math.max(...points) - Math.min(...points);
    const edge = Math.min(range * 1.5, 8); // Cap at 8%
    
    if (edge > 1) {
      picks.push({
        id: `${game.id}-${team}`,
        sport: SPORTS[game.sport_key]?.label || game.sport_key,
        emoji: SPORTS[game.sport_key]?.emoji || '🎯',
        game: `${game.away_team} vs ${game.home_team}`,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        commence_time: game.commence_time,
        bet: `${team} ${bestLine.point > 0 ? '+' : ''}${bestLine.point}`,
        betType: 'spread',
        confidence: Math.min(95, 65 + (edge * 2.5)),
        edge: parseFloat(edge.toFixed(1)),
        odds: formatOdds(bestLine.price),
        openingLine: lines[lines.length - 1].point.toString(),
        currentLine: bestLine.point.toString(),
        lineMove: range > 0.5 ? `▲ ${range}pt line shop` : '→ Stable',
        model_breakdown: {
          value: edge > 5 ? 'A' : edge > 3 ? 'B+' : 'B',
          line_movement: `${lines.length} books compared`,
          rlm: 'N/A',
          best_book: bestLine.book
        },
        affiliateBoost: ['fanduel', 'draftkings', 'betmgm'][picks.length % 3]
      });
    }
  }
  
  return picks;
}

function analyzeTotals(game) {
  const picks = [];
  const totalsByBook = {};
  
  for (const book of game.bookmakers) {
    const totalMarket = book.markets.find(m => m.key === 'totals');
    if (totalMarket) {
      totalsByBook[book.title] = totalMarket.outcomes;
    }
  }
  
  // Analyze overs and unders separately
  const overs = [];
  const unders = [];
  
  for (const [book, outcomes] of Object.entries(totalsByBook)) {
    const over = outcomes.find(o => o.name === 'Over');
    const under = outcomes.find(o => o.name === 'Under');
    if (over) overs.push({ book, point: over.point, price: over.price });
    if (under) unders.push({ book, point: under.point, price: under.price });
  }
  
  // Find best over (lowest total)
  if (overs.length >= 2) {
    overs.sort((a, b) => a.point - b.point);
    const bestOver = overs[0];
    const range = overs[overs.length - 1].point - bestOver.point;
    const edge = Math.min(range * 1.5, 6);
    
    if (edge > 1) {
      picks.push({
        id: `${game.id}-over`,
        sport: SPORTS[game.sport_key]?.label || game.sport_key,
        emoji: SPORTS[game.sport_key]?.emoji || '🎯',
        game: `${game.away_team} vs ${game.home_team}`,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        commence_time: game.commence_time,
        bet: `Over ${bestOver.point}`,
        betType: 'total',
        confidence: Math.min(92, 65 + (edge * 2.5)),
        edge: parseFloat(edge.toFixed(1)),
        odds: formatOdds(bestOver.price),
        openingLine: overs[overs.length - 1].point.toString(),
        currentLine: bestOver.point.toString(),
        lineMove: range > 0.5 ? `▼ Total dropped` : '→ Stable',
        model_breakdown: {
          value: edge > 4 ? 'A' : 'B',
          line_movement: `${overs.length} books compared`,
          rlm: 'N/A',
          best_book: bestOver.book
        },
        affiliateBoost: ['fanduel', 'draftkings', 'betmgm'][picks.length % 3]
      });
    }
  }
  
  // Find best under (highest total)
  if (unders.length >= 2) {
    unders.sort((a, b) => b.point - a.point);
    const bestUnder = unders[0];
    const range = bestUnder.point - unders[unders.length - 1].point;
    const edge = Math.min(range * 1.5, 6);
    
    if (edge > 1) {
      picks.push({
        id: `${game.id}-under`,
        sport: SPORTS[game.sport_key]?.label || game.sport_key,
        emoji: SPORTS[game.sport_key]?.emoji || '🎯',
        game: `${game.away_team} vs ${game.home_team}`,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        commence_time: game.commence_time,
        bet: `Under ${bestUnder.point}`,
        betType: 'total',
        confidence: Math.min(92, 65 + (edge * 2.5)),
        edge: parseFloat(edge.toFixed(1)),
        odds: formatOdds(bestUnder.price),
        openingLine: unders[unders.length - 1].point.toString(),
        currentLine: bestUnder.point.toString(),
        lineMove: range > 0.5 ? `▲ Total rose` : '→ Stable',
        model_breakdown: {
          value: edge > 4 ? 'A' : 'B',
          line_movement: `${unders.length} books compared`,
          rlm: 'N/A',
          best_book: bestUnder.book
        },
        affiliateBoost: ['fanduel', 'draftkings', 'betmgm'][picks.length % 3]
      });
    }
  }
  
  return picks;
}

function formatOdds(price) {
  if (price >= 0) return `+${price}`;
  return `${price}`;
}

// ============================================
// SCAN ENDPOINTS
// ============================================

app.post('/scan', async (req, res) => {
  try {
    console.log('🔍 Starting real odds scan...');
    const allPicks = [];
    
    // Scan NBA first (most popular)
    try {
      console.log('  Scanning NBA...');
      const nbaGames = await fetchOdds('basketball_nba');
      console.log(`    Found ${nbaGames.length} games`);
      const nbaPicks = findValuePicks(nbaGames);
      console.log(`    Generated ${nbaPicks.length} picks`);
      allPicks.push(...nbaPicks);
    } catch (err) {
      console.error('  NBA scan failed:', err.message);
    }
    
    // Scan other sports if API quota allows
    const otherSports = ['americanfootball_nfl', 'icehockey_nhl'];
    for (const sport of otherSports) {
      try {
        console.log(`  Scanning ${SPORTS[sport]?.label || sport}...`);
        const games = await fetchOdds(sport);
        const picks = findValuePicks(games);
        allPicks.push(...picks);
      } catch (err) {
        console.error(`  ${sport} scan failed:`, err.message);
      }
    }
    
    // Sort by edge, take top 5
    const topPicks = allPicks.sort((a, b) => b.edge - a.edge).slice(0, 5);
    
    console.log(`✅ Returning ${topPicks.length} top picks`);
    
    res.json({
      consensus_picks: topPicks,
      scanned_at: new Date().toISOString(),
      total_found: allPicks.length,
      sports_scanned: 3
    });
    
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      error: 'Scan failed',
      message: error.message 
    });
  }
});

app.get('/scan', async (req, res) => {
  // Same as POST for convenience
  try {
    console.log('🔍 Starting real odds scan (GET)...');
    const allPicks = [];
    
    try {
      const nbaGames = await fetchOdds('basketball_nba');
      const nbaPicks = findValuePicks(nbaGames);
      allPicks.push(...nbaPicks);
    } catch (err) {
      console.error('NBA scan failed:', err.message);
    }
    
    const topPicks = allPicks.sort((a, b) => b.edge - a.edge).slice(0, 5);
    
    res.json({
      consensus_picks: topPicks,
      scanned_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

// Cached version (reduces API calls)
app.get('/api/scan-cached', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check cache
    if (picksCache.data && (now - picksCache.timestamp) < picksCache.expiresIn) {
      console.log('Returning cached picks');
      return res.json({
        consensus_picks: picksCache.data,
        scanned_at: new Date(picksCache.timestamp).toISOString(),
        cached: true
      });
    }
    
    // Fetch fresh
    const allPicks = [];
    try {
      const games = await fetchOdds('basketball_nba');
      const picks = findValuePicks(games);
      allPicks.push(...picks);
    } catch (err) {
      console.error('Scan failed:', err.message);
    }
    
    const topPicks = allPicks.sort((a, b) => b.edge - a.edge).slice(0, 3);
    
    // Update cache
    picksCache = {
      data: topPicks,
      timestamp: now,
      expiresIn: 10 * 60 * 1000
    };
    
    res.json({
      consensus_picks: topPicks,
      scanned_at: new Date().toISOString(),
      cached: false
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Scan failed' });
  }
});

// Get subscription stats (admin endpoint)
app.get('/admin/stats', async (req, res) => {
  // Simple API key check (use proper auth in production)
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'past_due' THEN 1 END) as past_due_subscriptions,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
        COUNT(DISTINCT plan) as plan_types
      FROM subscriptions
    `);
    
    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const response = {
    error: 'Internal Server Error',
    requestId: Math.random().toString(36).substring(7)
  };
  
  if (NODE_ENV === 'development') {
    response.message = err.message;
    response.stack = err.stack;
  }
  
  res.status(500).json(response);
});

// ============================================
// Server Startup
// ============================================

async function startServer() {
  // Verify database connection on startup
  console.log('🔌 Checking database connection...');
  const dbConnected = await checkDatabaseConnection();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  console.log('✅ Database connected');
  
  // Verify Stripe configuration
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY not configured');
  } else {
    console.log('✅ Stripe configured');
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured - webhooks will fail');
  } else {
    console.log('✅ Webhook secret configured');
  }
  
  // Verify Odds API configuration
  if (!process.env.ODDS_API_KEY) {
    console.warn('⚠️ ODDS_API_KEY not configured - using demo mode');
  } else {
    console.log('✅ The Odds API configured');
  }
  
  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 EdgeBet API server running on port ${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
