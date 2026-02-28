const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

const OUTPUT_DIR = '/Users/fortunefavors/clawd/edgebet-video-output/variations';
const SCREENSHOTS_DIR = '/Users/fortunefavors/clawd/edgebet-screenshots-final';
const VOICEOVER_30SEC = '/var/folders/tv/qc_n6x991070gpfv6vzts6j00000gn/T/tts-jJoN1K/voice-1772274739848.mp3';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function createVideoSegment(inputImage, outputFile, duration, zoomStart = 1, zoomEnd = 1.1) {
  const cmd = `ffmpeg -y -i "${inputImage}" -vf "zoompan=z='min(zoom+${(zoomEnd - zoomStart) / (duration * 30)},${zoomEnd})':d=${duration * 30}:s=1080x1920:fps=30,format=yuv420p" -t ${duration} -c:v libx264 -pix_fmt yuv420p "${outputFile}" 2>&1`;
  execSync(cmd);
}

function createSquareSegment(inputImage, outputFile, duration) {
  const cmd = `ffmpeg -y -i "${inputImage}" -vf "zoompan=z='min(zoom+0.001,1.1)':d=${duration * 30}:s=1080x1080:fps=30,crop=1080:1080:0:420,format=yuv420p" -t ${duration} -c:v libx264 -pix_fmt yuv420p "${outputFile}" 2>&1`;
  execSync(cmd);
}

function concatenateSegments(segments, outputFile) {
  const listFile = `${OUTPUT_DIR}/concat_${Date.now()}.txt`;
  const content = segments.map(s => `file '${s}'`).join('\n');
  fs.writeFileSync(listFile, content);
  
  const cmd = `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}" 2>&1`;
  execSync(cmd);
  fs.unlinkSync(listFile);
}

function addAudio(videoFile, audioFile, outputFile, loop = false) {
  let cmd;
  if (loop) {
    cmd = `ffmpeg -y -i "${videoFile}" -i "${audioFile}" -filter_complex "[1:a]aloop=loop=-1:size=2e+09[a];[a]volume=0.8[audio]" -map 0:v -map "[audio]" -c:v copy -c:a aac -b:a 192k -shortest "${outputFile}" 2>&1`;
  } else {
    cmd = `ffmpeg -y -i "${videoFile}" -i "${audioFile}" -c:v copy -c:a aac -b:a 192k -shortest "${outputFile}" 2>&1`;
  }
  execSync(cmd);
}

console.log('🎬 Creating video variations...\n');

// Variation 1: 30-second fast version
console.log('1️⃣ Creating 30-second fast version...');
try {
  createVideoSegment(`${SCREENSHOTS_DIR}/01_picks_locked.png`, `${OUTPUT_DIR}/v1_seg1.mp4`, 8, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/03_pick_analysis.png`, `${OUTPUT_DIR}/v1_seg2.mp4`, 8, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/04_parlay_builder.png`, `${OUTPUT_DIR}/v1_seg3.mp4`, 7, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/05_tracker.png`, `${OUTPUT_DIR}/v1_seg4.mp4`, 7, 1, 1.08);
  concatenateSegments([
    `${OUTPUT_DIR}/v1_seg1.mp4`,
    `${OUTPUT_DIR}/v1_seg2.mp4`,
    `${OUTPUT_DIR}/v1_seg3.mp4`,
    `${OUTPUT_DIR}/v1_seg4.mp4`
  ], `${OUTPUT_DIR}/v1_30sec_no_audio.mp4`);
  addAudio(`${OUTPUT_DIR}/v1_30sec_no_audio.mp4`, VOICEOVER_30SEC, `${OUTPUT_DIR}/edgebet_30sec_fast.mp4`);
  console.log('   ✅ 30-second version created\n');
} catch (e) {
  console.log('   ❌ Error:', e.message);
}

// Variation 2: 15-second teaser
console.log('2️⃣ Creating 15-second teaser...');
try {
  createVideoSegment(`${SCREENSHOTS_DIR}/03_pick_analysis.png`, `${OUTPUT_DIR}/v2_seg1.mp4`, 5, 1, 1.1);
  createVideoSegment(`${SCREENSHOTS_DIR}/04_parlay_builder.png`, `${OUTPUT_DIR}/v2_seg2.mp4`, 5, 1, 1.1);
  createVideoSegment(`${SCREENSHOTS_DIR}/05_tracker.png`, `${OUTPUT_DIR}/v2_seg3.mp4`, 5, 1, 1.1);
  concatenateSegments([
    `${OUTPUT_DIR}/v2_seg1.mp4`,
    `${OUTPUT_DIR}/v2_seg2.mp4`,
    `${OUTPUT_DIR}/v2_seg3.mp4`
  ], `${OUTPUT_DIR}/edgebet_15sec_teaser.mp4`);
  console.log('   ✅ 15-second teaser created\n');
} catch (e) {
  console.log('   ❌ Error:', e.message);
}

// Variation 3: No voiceover (silent with text overlay potential)
console.log('3️⃣ Creating no-voiceover version...');
try {
  // Copy the main video without audio
  execSync(`ffmpeg -y -i "${OUTPUT_DIR}/../edgebet_promo_final.mp4" -c:v copy -an "${OUTPUT_DIR}/edgebet_no_voiceover.mp4" 2>&1`);
  console.log('   ✅ No-voiceover version created\n');
} catch (e) {
  console.log('   ❌ Error:', e.message);
}

// Variation 4: Square format (1:1 for Instagram)
console.log('4️⃣ Creating square format (1:1)...');
try {
  createSquareSegment(`${SCREENSHOTS_DIR}/01_picks_locked.png`, `${OUTPUT_DIR}/v4_seg1.mp4`, 10);
  createSquareSegment(`${SCREENSHOTS_DIR}/03_pick_analysis.png`, `${OUTPUT_DIR}/v4_seg2.mp4`, 15);
  createSquareSegment(`${SCREENSHOTS_DIR}/04_parlay_builder.png`, `${OUTPUT_DIR}/v4_seg3.mp4`, 10);
  createSquareSegment(`${SCREENSHOTS_DIR}/05_tracker.png`, `${OUTPUT_DIR}/v4_seg3.mp4`, 10);
  concatenateSegments([
    `${OUTPUT_DIR}/v4_seg1.mp4`,
    `${OUTPUT_DIR}/v4_seg2.mp4`,
    `${OUTPUT_DIR}/v4_seg3.mp4`
  ], `${OUTPUT_DIR}/edgebet_square_1x1.mp4`);
  console.log('   ✅ Square format created\n');
} catch (e) {
  console.log('   ❌ Error:', e.message);
}

// Variation 5: Aggressive hook (reorder scenes)
console.log('5️⃣ Creating aggressive hook version...');
try {
  // Start with tracker (wins) then show picks
  createVideoSegment(`${SCREENSHOTS_DIR}/05_tracker.png`, `${OUTPUT_DIR}/v5_seg1.mp4`, 12, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/01_picks_locked.png`, `${OUTPUT_DIR}/v5_seg2.mp4`, 12, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/04_parlay_builder.png`, `${OUTPUT_DIR}/v5_seg3.mp4`, 10, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/03_pick_analysis.png`, `${OUTPUT_DIR}/v5_seg4.mp4`, 6, 1, 1.08);
  concatenateSegments([
    `${OUTPUT_DIR}/v5_seg1.mp4`,
    `${OUTPUT_DIR}/v5_seg2.mp4`,
    `${OUTPUT_DIR}/v5_seg3.mp4`,
    `${OUTPUT_DIR}/v5_seg4.mp4`
  ], `${OUTPUT_DIR}/edgebet_aggressive_hook.mp4`);
  console.log('   ✅ Aggressive hook version created\n');
} catch (e) {
  console.log('   ❌ Error:', e.message);
}

// Variation 6: Social proof version
console.log('6️⃣ Creating social proof version...');
try {
  // Lead with tracker showing wins
  createVideoSegment(`${SCREENSHOTS_DIR}/05_tracker.png`, `${OUTPUT_DIR}/v6_seg1.mp4`, 15, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/04_parlay_builder.png`, `${OUTPUT_DIR}/v6_seg2.mp4`, 12, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/03_pick_analysis.png`, `${OUTPUT_DIR}/v6_seg3.mp4`, 10, 1, 1.08);
  createVideoSegment(`${SCREENSHOTS_DIR}/06_more_tab.png`, `${OUTPUT_DIR}/v6_seg4.mp4`, 8, 1, 1.08);
  concatenateSegments([
    `${OUTPUT_DIR}/v6_seg1.mp4`,
    `${OUTPUT_DIR}/v6_seg2.mp4`,
    `${OUTPUT_DIR}/v6_seg3.mp4`,
    `${OUTPUT_DIR}/v6_seg4.mp4`
  ], `${OUTPUT_DIR}/edgebet_social_proof.mp4`);
  console.log('   ✅ Social proof version created\n');
} catch (e) {
  console.log('   ❌ Error:', e.message);
}

// List all created videos
console.log('📁 All variations created:');
const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.mp4') && !f.includes('_seg'));
files.forEach(f => {
  const stats = fs.statSync(`${OUTPUT_DIR}/${f}`);
  console.log(`   ✓ ${f} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
});

console.log('\n🎉 Done! All variations ready for testing.');
