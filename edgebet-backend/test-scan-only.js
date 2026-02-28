// test-scan-only.js - Test just the scan endpoint without database
require('dotenv').config();
const axios = require('axios');

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const SPORTS = {
  'basketball_nba': { label: 'NBA', emoji: '🏀' },
  'americanfootball_nfl': { label: 'NFL', emoji: '🏈' },
  'icehockey_nhl': { label: 'NHL', emoji: '🏒' }
};

async function fetchOdds(sport = 'basketball_nba') {
  const response = await axios.get(
    `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
    {
      params: {
        apiKey: ODDS_API_KEY,
        regions: 'us',
        markets: 'spreads,totals',
        oddsFormat: 'american'
      },
      timeout: 10000
    }
  );
  return response.data;
}

function findValuePicks(games) {
  const picks = [];
  
  for (const game of games) {
    if (!game.bookmakers || game.bookmakers.length === 0) continue;
    
    // Analyze spreads
    const spreadsByBook = {};
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
      
      lines.sort((a, b) => b.point - a.point);
      const bestLine = lines[0];
      const points = lines.map(l => l.point);
      const range = Math.max(...points) - Math.min(...points);
      const edge = Math.min(range * 1.5, 8);
      
      if (edge > 1) {
        picks.push({
          id: `${game.id}-${team}`,
          sport: SPORTS[game.sport_key]?.label || game.sport_key,
          emoji: SPORTS[game.sport_key]?.emoji || '🎯',
          game: `${game.away_team} vs ${game.home_team}`,
          bet: `${team} ${bestLine.point > 0 ? '+' : ''}${bestLine.point}`,
          betType: 'spread',
          confidence: Math.min(95, 65 + (edge * 2.5)),
          edge: parseFloat(edge.toFixed(1)),
          odds: bestLine.price >= 0 ? `+${bestLine.price}` : `${bestLine.price}`,
          model_breakdown: {
            value: edge > 5 ? 'A' : edge > 3 ? 'B+' : 'B',
            line_movement: `${lines.length} books compared`,
            best_book: bestLine.book
          }
        });
      }
    }
  }
  
  return picks.sort((a, b) => b.edge - a.edge);
}

async function testScan() {
  console.log('🎯 Testing EdgeBet Scan Logic\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    console.log('🔍 Fetching NBA odds...');
    const games = await fetchOdds('basketball_nba');
    console.log(`✅ Found ${games.length} games\n`);
    
    console.log('🧠 Analyzing for value picks...\n');
    const picks = findValuePicks(games);
    
    console.log(`📊 Generated ${picks.length} value picks\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (picks.length > 0) {
      console.log('🏆 TOP PICKS:\n');
      picks.slice(0, 5).forEach((pick, i) => {
        console.log(`${i + 1}. ${pick.sport} ${pick.emoji}`);
        console.log(`   Game: ${pick.game}`);
        console.log(`   Pick: ${pick.bet}`);
        console.log(`   Odds: ${pick.odds}`);
        console.log(`   Edge: ${pick.edge}%`);
        console.log(`   Confidence: ${pick.confidence}%`);
        console.log(`   Value Grade: ${pick.model_breakdown.value}`);
        console.log(`   Best Book: ${pick.model_breakdown.best_book}`);
        console.log('');
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ SCAN COMPLETE - Real odds data working!\n');
      console.log('📈 Your app now returns REAL picks, not random numbers.\n');
    } else {
      console.log('⚠️ No value picks found (this is normal when lines are tight)');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testScan();
