# EdgeBet AI Video Assets - Image Generation Guide

> This directory contains prompts and specifications for generating video assets.
> Run the commands below when OpenAI billing is restored.

## Quick Generation Commands

### Agent Icons (7 icons)

```bash
# 1. Value Agent
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "A sleek modern app icon for VALUE betting agent. Golden percentage symbol % inside a dark circular badge with emerald green accent highlights. Deep navy to black gradient background. Professional sports analytics aesthetic. Clean minimalist vector style suitable for mobile app." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/agents

# 2. Line Movement Agent  
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "A sleek modern app icon for LINE MOVEMENT betting agent. Dynamic zigzag chart line trending upward inside a dark circular badge with cyan blue accents. Deep navy to black gradient background. Professional sports analytics aesthetic. Clean minimalist vector style suitable for mobile app." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/agents

# 3. Sharp Money Agent
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "A sleek modern app icon for SHARP MONEY betting agent. Diamond or target crosshair symbol inside a dark circular badge with gold and platinum accents. Deep navy to black gradient background. Professional sports analytics aesthetic. Clean minimalist vector style suitable for mobile app." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/agents

# 4. Injury Agent
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "A sleek modern app icon for INJURY tracking betting agent. Medical cross or bandage symbol inside a dark circular badge with alert red and white accents. Deep navy to black gradient background. Professional sports analytics aesthetic. Clean minimalist vector style suitable for mobile app." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/agents

# 5. Situational Agent
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "A sleek modern app icon for SITUATIONAL betting agent. Calendar with location pin or clock symbol inside a dark circular badge with purple and magenta accents. Deep navy to black gradient background. Professional sports analytics aesthetic. Clean minimalist vector style suitable for mobile app." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/agents

# 6. Public Money Agent
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "A sleek modern app icon for PUBLIC MONEY betting agent. Crowd silhouette or trending bar graph icon inside a dark circular badge with orange and amber accents. Deep navy to black gradient background. Professional sports analytics aesthetic. Clean minimalist vector style suitable for mobile app." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/agents

# 7. Confidence Agent
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "A sleek modern app icon for CONFIDENCE rating betting agent. Shield with checkmark or 5-star rating symbol inside a dark circular badge with teal and mint green accents. Deep navy to black gradient background. Professional sports analytics aesthetic. Clean minimalist vector style suitable for mobile app." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/agents
```

### App Interface Mockup

```bash
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "Mobile app UI mockup for sports betting pick card. Dark mode interface showing NFL game prediction. Team logos vs matchup, win probability 68%, confidence score 4.5 stars, pick type OVER, betting line 47.5. Clean modern sports app design with green positive indicators. iPhone frame, professional app store screenshot style." \
  --model gpt-image-1 --size 1024x1536 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/app-mockup
```

### Logo Animation Frames (5 frames for animation sequence)

```bash
# Frame 1: Initial state - geometric shapes
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "Logo animation frame 1 of 5. Abstract geometric shapes floating apart - a diamond, circle, and curved line in neon green and cyan on pure black background. Minimalist sports tech logo components beginning to assemble. Clean vector style." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/logo-frames

# Frame 2: Coming together
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "Logo animation frame 2 of 5. Abstract shapes moving closer - diamond above, circle center, curved line below, forming a stylized letter E. Neon green and cyan glow on pure black. Minimalist sports tech logo mid-assembly." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/logo-frames

# Frame 3: Nearly formed
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "Logo animation frame 3 of 5. EdgeBet logo almost complete - stylized letter E formed from geometric elements, glowing neon green and cyan edges on pure black background. Motion blur trails suggesting movement. Minimalist sports tech brand." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/logo-frames

# Frame 4: Final form with glow
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "Logo animation frame 4 of 5. Complete EdgeBet stylized E logo, sharp geometric design with bright neon green primary and cyan accent glow. Pure black background. Professional sports analytics brand mark with subtle light bloom effect." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/logo-frames

# Frame 5: Settled state
python3 /opt/homebrew/lib/node_modules/clawdbot/skills/openai-image-gen/scripts/gen.py \
  --prompt "Logo animation frame 5 of 5. Final settled EdgeBet logo - bold stylized letter E, clean geometric lines, electric green and cyan on pure black. Professional sports betting AI brand identity. No glow effects, crisp and sharp." \
  --model gpt-image-1 --size 1024x1024 --quality high \
  --out-dir /Users/fortunefavors/clawd/edgebet-assets/logo-frames
```

## Alternative: DALL-E 3 (if GPT-Image-1 unavailable)

Use `--model dall-e-3 --style vivid` for more dramatic results, but note only 1 image per prompt.

## Post-Processing Notes

1. **Agent Icons**: Use 1024x1024 PNG, can be cropped to circle in video editor
2. **App Mockup**: Use 1024x1536 PNG for vertical video format (9:16)
3. **Logo Frames**: Import as image sequence in CapCut/After Effects for smooth animation

## Video Specifications

- **Resolution**: 1080x1920 (vertical/9:16) for TikTok/Reels/Shorts
- **Frame Rate**: 30fps
- **Duration**: 15-30 seconds
- **Color Palette**: 
  - Primary: #00C853 (Neon Green)
  - Secondary: #00B8D4 (Cyan)
  - Background: #0A0A0A (Near Black)
  - Accent: #FFD600 (Gold)
