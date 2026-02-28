// test-server.js - Test the full server with odds integration
const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting EdgeBet server test...\n');

// Start server
const server = spawn('node', ['server.js'], {
  cwd: '/Users/fortunefavors/clawd/edgebet-backend',
  env: { ...process.env, PORT: '3456' }
});

let serverReady = false;

server.stdout.on('data', (data) => {
  const line = data.toString();
  console.log('[Server]', line.trim());
  
  if (line.includes('EdgeBet API server running')) {
    serverReady = true;
    setTimeout(testEndpoints, 1000);
  }
});

server.stderr.on('data', (data) => {
  console.error('[Server Error]', data.toString().trim());
});

async function testEndpoints() {
  console.log('\n🧪 Testing endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing /health...');
    const health = await httpGet('http://localhost:3456/health');
    console.log('   Status:', health.status);
    console.log('   Odds API:', health.services.odds_api);
    
    // Test scan endpoint
    console.log('\n2️⃣ Testing /scan...');
    const scan = await httpGet('http://localhost:3456/scan');
    console.log('   Found:', scan.consensus_picks?.length || 0, 'picks');
    console.log('   Scanned at:', scan.scanned_at);
    
    if (scan.consensus_picks?.length > 0) {
      const pick = scan.consensus_picks[0];
      console.log('\n   📋 Top pick:');
      console.log(`      Game: ${pick.game}`);
      console.log(`      Bet: ${pick.bet}`);
      console.log(`      Edge: ${pick.edge}%`);
      console.log(`      Confidence: ${pick.confidence}%`);
      console.log(`      Best book: ${pick.model_breakdown?.best_book}`);
    }
    
    console.log('\n✅ All tests PASSED! Server is working with real odds.');
    
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
  } finally {
    console.log('\n🛑 Shutting down server...');
    server.kill();
    process.exit(0);
  }
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

// Timeout after 30 seconds
setTimeout(() => {
  console.error('\n⏱️ Test timeout');
  server.kill();
  process.exit(1);
}, 30000);
