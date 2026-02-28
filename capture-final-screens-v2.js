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
    viewport: { width: 1600, height: 2000 },
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
    await page.waitForTimeout(3000);
    
    // First, take a full screenshot to see the layout
    console.log('Taking full page screenshot to analyze layout...');
    await page.screenshot({ path: `${outputDir}/_full_page.png`, fullPage: true });
    
    // Get page dimensions
    const dimensions = await page.evaluate(() => {
      return {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      };
    });
    console.log(`Page dimensions: ${dimensions.width}x${dimensions.height}`);
    
    // Capture each phone screen based on the HTML layout
    // The phones are arranged in a flex wrap with gap: 20px, padding: 20px
    // Each phone is 480x900 + 8px border = 496x916
    const phoneWidth = 496;
    const phoneHeight = 916;
    const gap = 20;
    const padding = 20;
    
    const screens = [
      { name: '01_picks_locked', index: 0 },
      { name: '02_scanning', index: 1 },
      { name: '03_pick_analysis', index: 2 },
      { name: '04_parlay_builder', index: 3 },
      { name: '05_tracker', index: 4 },
      { name: '06_more_tab', index: 5 }
    ];
    
    const cols = 3; // 3 phones per row
    
    for (const screen of screens) {
      const col = screen.index % cols;
      const row = Math.floor(screen.index / cols);
      
      const x = padding + (col * (phoneWidth + gap));
      const y = padding + (row * (phoneHeight + gap));
      
      console.log(`Capturing: ${screen.name} at (${x}, ${y})`);
      
      await page.screenshot({ 
        path: `${outputDir}/${screen.name}.png`,
        clip: { x, y, width: phoneWidth, height: phoneHeight }
      });
    }
    
    console.log('\n✅ All screenshots captured!');
    
    // List files
    const files = fs.readdirSync(outputDir).filter(f => !f.startsWith('_'));
    console.log('\nCaptured files:');
    files.forEach(f => {
      const stats = fs.statSync(`${outputDir}/${f}`);
      console.log(`  ✓ ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
