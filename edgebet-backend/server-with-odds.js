// server-with-odds.js - Updated backend with real odds integration
// Replace your existing server.js routes with these

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');
const { fetchOdds, findValuePicks, SPORTS } = require('./odds-api-integration');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup (same as before)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// REAL SCAN ENDPOINT (NEW)
// ============================================

app.get('/api/scan', async (req, res) => {
  try {
    console.log('Starting real odds scan...');
    const allPicks = [];
    
    // Scan all configured sports
    for (const [sportKey, sportConfig] of Object.entries(SPORTS)) {
      console.log(`Scanning ${sportConfig.label}...`);
      
      try {
        const games = await fetchOdds(sportKey);
        console.log(`  Found ${games.length} ${sportConfig.label} games`);
        
        const picks = findValuePicks(games);
        console.log(`  Generated ${picks.length} picks with positive edge`);
        
        allPicks.push(...picks);
      } catch (sportError) {
        console.error(`  Error scanning ${sportConfig.label}:`, sportError.message);
        // Continue with other sports if one fails
      }
    }
    
    // Sort by edge and return top picks
    const topPicks = allPicks
      .sort((a, b) => b.edge - a.edge)
      .slice(0, 5); // Return top 5 picks
    
    console.log(`Returning ${topPicks.length} top picks`);
    
    res.json({
      success: true,
      consensus_picks: topPicks,
      scanned_at: new Date().toISOString(),
      total_games_scanned: allPicks.length,
      sports_scanned: Object.keys(SPORTS).length
    });
    
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      error: 'Scan failed',
      message: error.message 
    });
  }
});

// ============================================
// SIMPLIFIED SCAN FOR FREE TIER (CACHED)
// ============================================

// Cache to reduce API calls (free tier limited to 500/month)
let picksCache = {
  data: null,
  timestamp: null,
  expiresIn: 15 * 60 * 1000 // 15 minutes
};

app.get('/api/scan-cached', async (req, res) => {
  try {
    // Check cache
    const now = Date.now();
    if (picksCache.data && picksCache.timestamp && (now - picksCache.timestamp) < picksCache.expiresIn) {
      console.log('Returning cached picks');
      return res.json({
        success: true,
        consensus_picks: picksCache.data,
        scanned_at: new Date(picksCache.timestamp).toISOString(),
        cached: true
      });
    }
    
    // Fetch fresh data
    console.log('Fetching fresh odds...');
    const allPicks = [];
    
    // Only scan NBA and NFL to save API calls (most popular)
    const prioritySports = ['basketball_nba', 'americanfootball_nfl'];
    
    for (const sportKey of prioritySports) {
      try {
        const games = await fetchOdds(sportKey);
        const picks = findValuePicks(games);
        allPicks.push(...picks);
      } catch (err) {
        console.error(`Error with ${sportKey}:`, err.message);
      }
    }
    
    const topPicks = allPicks.sort((a, b) => b.edge - a.edge).slice(0, 3);
    
    // Update cache
    picksCache = {
      data: topPicks,
      timestamp: now,
      expiresIn: 15 * 60 * 1000
    };
    
    res.json({
      success: true,
      consensus_picks: topPicks,
      scanned_at: new Date().toISOString(),
      cached: false
    });
    
  } catch (error) {
    console.error('Cached scan error:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

// ============================================
// HEALTH CHECK WITH ODDS STATUS
// ============================================

app.get('/health', async (req, res) => {
  const dbHealthy = await checkDatabaseConnection();
  const oddsConfigured = !!process.env.ODDS_API_KEY;
  
  res.json({
    status: dbHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      odds_api: oddsConfigured ? 'configured' : 'not_configured'
    }
  });
});

// ============================================
// SUBSCRIPTION CHECK (UPDATED)
// ============================================

app.get('/subscription/:email', async (req, res) => {
  const { email } = req.params;
  
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
      expiresAt: sub.current_period_end
    });
  } catch (err) {
    console.error('Subscription check error:', err);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

// ============================================
// WEBHOOK HANDLER (UNCHANGED)
// ============================================

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // ... keep existing webhook handler code ...
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (err) {
    return false;
  }
}

// Error handlers
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 EdgeBet API with Real Odds`);
  console.log(`📊 Odds API: ${process.env.ODDS_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
