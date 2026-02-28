// test-odds-api.js - Test the Odds API connection
require('dotenv').config();
const axios = require('axios');

const ODDS_API_KEY = process.env.ODDS_API_KEY;

async function testAPI() {
  console.log('🔍 Testing The Odds API...\n');
  
  if (!ODDS_API_KEY) {
    console.error('❌ ODDS_API_KEY not found in .env');
    process.exit(1);
  }
  
  console.log('✅ API key loaded');
  
  try {
    // Test fetching NBA odds
    console.log('\n📊 Fetching NBA odds...');
    const response = await axios.get(
      'https://api.the-odds-api.com/v4/sports/basketball_nba/odds',
      {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'spreads,totals',
          oddsFormat: 'american'
        },
        timeout: 15000
      }
    );
    
    console.log(`✅ Found ${response.data.length} NBA games`);
    console.log(`📈 Remaining API requests: ${response.headers['x-requests-remaining'] || 'N/A'}`);
    console.log(`⏰ Resets in: ${response.headers['x-requests-last'] || 'N/A'}`);
    
    // Show sample game
    if (response.data.length > 0) {
      const game = response.data[0];
      console.log('\n📋 Sample game:');
      console.log(`   ${game.away_team} vs ${game.home_team}`);
      console.log(`   Books: ${game.bookmakers?.length || 0} odds providers`);
      
      if (game.bookmakers?.[0]) {
        const book = game.bookmakers[0];
        console.log(`   Sample book: ${book.title}`);
        
        const spreads = book.markets?.find(m => m.key === 'spreads');
        if (spreads) {
          console.log(`   Spreads:`);
          spreads.outcomes.forEach(o => {
            console.log(`     ${o.name}: ${o.point > 0 ? '+' : ''}${o.point} (${o.price})`);
          });
        }
      }
    }
    
    console.log('\n✅ API test PASSED! Your odds integration is ready.');
    
  } catch (error) {
    console.error('\n❌ API test FAILED:');
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();
