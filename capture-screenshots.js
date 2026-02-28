const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshots() {
  const outputDir = '/Users/fortunefavors/clawd/edgebet-screenshots';
  
  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 480, height: 900 }
  });
  const page = await context.newPage();
  
  // Load the app
  await page.goto('file:///Users/fortunefavors/Downloads/files/edgebet.html');
  
  // Wait for app to load
  await page.waitForTimeout(3000);
  
  // Screenshot 1: App Launch / Splash Screen
  console.log('Capturing: Splash screen...');
  // The splash screen appears briefly, so we need to wait for it
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${outputDir}/01_splash.png` });
  
  // Screenshot 2: Main Picks Screen
  console.log('Capturing: Main picks screen...');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${outputDir}/02_picks_home.png` });
  
  // Screenshot 3: After scanning (simulate scan button click)
  console.log('Capturing: Scan results...');
  await page.click('button:has-text("Scan")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${outputDir}/03_scan_results.png` });
  
  // Screenshot 4: Expanded pick card
  console.log('Capturing: Expanded pick card...');
  await page.click('.pick-card, [class*="pick"], button:has-text("Analysis")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${outputDir}/04_pick_expanded.png` });
  
  // Screenshot 5: Parlay builder
  console.log('Capturing: Parlay builder...');
  await page.click('button:has-text("Parlay"), [class*="parlay"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${outputDir}/05_parlay.png` });
  
  // Screenshot 6: Tracker
  console.log('Capturing: Tracker...');
  await page.click('button:has-text("Tracker"), [class*="tracker"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${outputDir}/06_tracker.png` });
  
  // Screenshot 7: More tab / Line Movement
  console.log('Capturing: More / Line Movement...');
  await page.click('button:has-text("More"), [class*="more"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${outputDir}/07_more_tab.png` });
  
  await browser.close();
  console.log('All screenshots captured!');
}

captureScreenshots().catch(console.error);
