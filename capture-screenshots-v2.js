const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const outputDir = '/Users/fortunefavors/clawd/edgebet-screenshots';
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Launch browser with mobile viewport
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 480, height: 900 },
    deviceScaleFactor: 2 // Retina quality
  });
  const page = await context.newPage();
  
  // Enable console logging for debugging
  page.on('console', msg => console.log('Page console:', msg.text()));
  
  try {
    // Load the app
    console.log('Loading app...');
    await page.goto('file:///Users/fortunefavors/Downloads/files/edgebet.html', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for React to render
    await page.waitForTimeout(5000);
    
    // Screenshot 1: Splash/Loading screen (if visible)
    console.log('Capturing: Initial view...');
    await page.screenshot({ path: `${outputDir}/01_app_view.png`, fullPage: false });
    
    // Wait for any animations
    await page.waitForTimeout(2000);
    
    // Try to find and click through the app
    // Look for the Picks tab (usually default)
    console.log('Looking for interactive elements...');
    
    // Get page content to understand structure
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    
    // Try to click "Continue as Guest" if auth screen is shown
    const guestButtons = await page.$$('button:has-text("Guest")');
    if (guestButtons.length > 0) {
      console.log('Clicking Guest button...');
      await guestButtons[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${outputDir}/02_after_guest.png`, fullPage: false });
    }
    
    // Look for scan button
    const scanButtons = await page.locator('button').filter({ hasText: /Scan|SCAN/ }).all();
    console.log(`Found ${scanButtons.length} scan buttons`);
    
    if (scanButtons.length > 0) {
      console.log('Clicking Scan button...');
      await scanButtons[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${outputDir}/03_scanning.png`, fullPage: false });
    }
    
    // Wait for results
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${outputDir}/04_with_picks.png`, fullPage: false });
    
    // Try to find and click on a pick card
    const allButtons = await page.$$('button');
    console.log(`Total buttons now: ${allButtons.length}`);
    
    // Click on "Analysis" button if available
    const analysisButtons = await page.locator('button').filter({ hasText: /Analysis|Analyze/ }).all();
    if (analysisButtons.length > 0) {
      console.log('Clicking Analysis button...');
      await analysisButtons[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${outputDir}/05_analysis_open.png`, fullPage: false });
    }
    
    // Try to navigate to Parlay tab
    const parlayButtons = await page.locator('button').filter({ hasText: /Parlay|PARLAY/ }).all();
    if (parlayButtons.length > 0) {
      console.log('Clicking Parlay tab...');
      await parlayButtons[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${outputDir}/06_parlay_tab.png`, fullPage: false });
    }
    
    // Navigate to Tracker tab
    const trackerButtons = await page.locator('button').filter({ hasText: /Tracker|TRACKER/ }).all();
    if (trackerButtons.length > 0) {
      console.log('Clicking Tracker tab...');
      await trackerButtons[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${outputDir}/07_tracker_tab.png`, fullPage: false });
    }
    
    // Navigate to More tab
    const moreButtons = await page.locator('button').filter({ hasText: /More|MORE/ }).all();
    if (moreButtons.length > 0) {
      console.log('Clicking More tab...');
      await moreButtons[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${outputDir}/08_more_tab.png`, fullPage: false });
    }
    
    console.log('All screenshots captured!');
    
  } catch (error) {
    console.error('Error:', error.message);
    // Take a final screenshot even if something failed
    await page.screenshot({ path: `${outputDir}/error_state.png`, fullPage: false });
  } finally {
    await browser.close();
  }
  
  // List captured files
  const files = fs.readdirSync(outputDir);
  console.log('\nCaptured files:');
  files.forEach(f => console.log(`  - ${f}`));
}

captureScreenshots().catch(console.error);
