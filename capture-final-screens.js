const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const outputDir = '/Users/fortunefavors/clawd/edgebet-screenshots-final';
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 480, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  
  try {
    // Load the screens HTML
    console.log('Loading app screens...');
    await page.goto('file:///Users/fortunefavors/clawd/edgebet-app-screens.html', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for render
    await page.waitForTimeout(2000);
    
    // Capture each phone screen
    const screens = [
      { name: '01_picks_locked', label: 'Shot 1: Picks Screen (Locked)' },
      { name: '02_scanning', label: 'Shot 2: Scanning Animation' },
      { name: '03_pick_analysis', label: 'Shot 3: Expanded Pick Card' },
      { name: '04_parlay_builder', label: 'Shot 4: Parlay Builder' },
      { name: '05_tracker', label: 'Shot 5: Bet Tracker' },
      { name: '06_more_tab', label: 'Shot 6: More Tab' }
    ];
    
    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      console.log(`Capturing: ${screen.label}`);
      
      // Calculate position for each phone (they're in a grid)
      const x = (i % 3) * 500 + 20; // 3 per row
      const y = Math.floor(i / 3) * 920 + 20;
      
      // Take screenshot of just this phone
      await page.screenshot({ 
        path: `${outputDir}/${screen.name}.png`,
        clip: { x, y, width: 480, height: 900 }
      });
    }
    
    console.log('\n✅ All screenshots captured!');
    
    // List files
    const files = fs.readdirSync(outputDir);
    console.log('\nCaptured files:');
    files.forEach(f => {
      const stats = fs.statSync(`${outputDir}/${f}`);
      console.log(`  ✓ ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
