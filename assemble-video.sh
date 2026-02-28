#!/bin/bash
# EdgeBet AI Video Assembly Script
# Uses ffmpeg to combine screenshots, audio, and create the final video

echo "🎬 EdgeBet AI Video Assembly"
echo "============================"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found. Installing..."
    brew install ffmpeg
fi

# Directories
INPUT_DIR="/Users/fortunefavors/clawd/edgebet-screenshots-final"
AUDIO_FILE="/var/folders/tv/qc_n6x991070gpfv6vzts6j00000gn/T/tts-SJ9LcH/voice-1772273186309.mp3"
OUTPUT_DIR="/Users/fortunefavors/clawd/edgebet-video-output"
TEMP_DIR="$OUTPUT_DIR/temp"

# Create output directory
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

# Video settings
WIDTH=1080
HEIGHT=1920
FPS=30
DURATION=60

echo ""
echo "📁 Input: $INPUT_DIR"
echo "🎵 Audio: $AUDIO_FILE"
echo "📤 Output: $OUTPUT_DIR"
echo ""

# Create video segments with Ken Burns effect
# Each screenshot will be shown for specific duration with slow zoom

echo "🎞️  Creating video segments..."

# Segment 1: Intro (0:00-0:18) - Fade from black + first screen
ffmpeg -y -i "$INPUT_DIR/01_picks_locked.png" \
    -vf "zoompan=z='min(zoom+0.0015,1.1)':d=540:s=${WIDTH}x${HEIGHT}:fps=${FPS},fade=in:0:30,fade=out:510:30" \
    -t 18 -c:v libx264 -pix_fmt yuv420p -crf 18 \
    "$TEMP_DIR/segment1.mp4" 2>/dev/null

# Segment 2: Scanning (0:18-0:28) - 10 seconds
ffmpeg -y -i "$INPUT_DIR/02_scanning.png" \
    -vf "zoompan=z='min(zoom+0.0015,1.1)':d=300:s=${WIDTH}x${HEIGHT}:fps=${FPS}" \
    -t 10 -c:v libx264 -pix_fmt yuv420p -crf 18 \
    "$TEMP_DIR/segment2.mp4" 2>/dev/null

# Segment 3: Pick Analysis (0:28-0:45) - 17 seconds
ffmpeg -y -i "$INPUT_DIR/03_pick_analysis.png" \
    -vf "zoompan=z='min(zoom+0.001,1.08)':d=510:s=${WIDTH}x${HEIGHT}:fps=${FPS}" \
    -t 17 -c:v libx264 -pix_fmt yuv420p -crf 18 \
    "$TEMP_DIR/segment3.mp4" 2>/dev/null

# Segment 4: Parlay Builder (0:45-0:52) - 7 seconds
ffmpeg -y -i "$INPUT_DIR/04_parlay_builder.png" \
    -vf "zoompan=z='min(zoom+0.0015,1.1)':d=210:s=${WIDTH}x${HEIGHT}:fps=${FPS}" \
    -t 7 -c:v libx264 -pix_fmt yuv420p -crf 18 \
    "$TEMP_DIR/segment4.mp4" 2>/dev/null

# Segment 5: Tracker (0:52-1:00) - 8 seconds
ffmpeg -y -i "$INPUT_DIR/05_tracker.png" \
    -vf "zoompan=z='min(zoom+0.0015,1.1)':d=240:s=${WIDTH}x${HEIGHT}:fps=${FPS},fade=out:210:30" \
    -t 8 -c:v libx264 -pix_fmt yuv420p -crf 18 \
    "$TEMP_DIR/segment5.mp4" 2>/dev/null

# Concatenate all segments
echo "🔗 Concatenating segments..."
echo "file 'segment1.mp4'" > "$TEMP_DIR/concat.txt"
echo "file 'segment2.mp4'" >> "$TEMP_DIR/concat.txt"
echo "file 'segment3.mp4'" >> "$TEMP_DIR/concat.txt"
echo "file 'segment4.mp4'" >> "$TEMP_DIR/concat.txt"
echo "file 'segment5.mp4'" >> "$TEMP_DIR/concat.txt"

ffmpeg -y -f concat -safe 0 -i "$TEMP_DIR/concat.txt" \
    -c copy "$TEMP_DIR/video_no_audio.mp4" 2>/dev/null

# Add audio
echo "🎵 Adding voiceover and music..."

# Create background music (using ffmpeg's sine wave + reverb as placeholder)
# In real usage, replace with actual music file
ffmpeg -y -f lavfi -i "sine=frequency=0:duration=60" -af "aecho=0.8:0.9:1000|1800:0.3|0.25,volume=0.1" \
    "$TEMP_DIR/background_music.mp3" 2>/dev/null

# Mix voiceover with background
ffmpeg -y -i "$AUDIO_FILE" -i "$TEMP_DIR/background_music.mp3" \
    -filter_complex "[0:a]volume=1.0[a1];[1:a]volume=0.15[a2];[a1][a2]amix=inputs=2:duration=longest[a]" \
    -map "[a]" "$TEMP_DIR/final_audio.mp3" 2>/dev/null

# Combine video and audio
ffmpeg -y -i "$TEMP_DIR/video_no_audio.mp4" -i "$TEMP_DIR/final_audio.mp3" \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$OUTPUT_DIR/edgebet_promo_video.mp4" 2>/dev/null

# Clean up temp files
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Video created successfully!"
echo "📁 Location: $OUTPUT_DIR/edgebet_promo_video.mp4"
echo ""

# Get file info
ls -lh "$OUTPUT_DIR/edgebet_promo_video.mp4"

echo ""
echo "🎬 Video specs:"
echo "  Resolution: 1080x1920 (9:16)"
echo "  Duration: 60 seconds"
echo "  FPS: 30"
echo "  Format: MP4 (H.264)"
echo ""
echo "Ready to upload to TikTok/Reels/Shorts! 🚀"
