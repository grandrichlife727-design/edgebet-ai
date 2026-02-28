#!/bin/bash
# push-to-github.sh - Push EdgeBet AI to GitHub

# Change to repo directory
cd /Users/fortunefavors/clawd

# Remove the HTTPS remote and add SSH remote
git remote remove origin 2>/dev/null
git remote add origin git@github.com:grandrichlife727-design/edgebet-ai.git

# Try to push with SSH
echo "Attempting to push with SSH..."
git push -u origin main

# If that fails, use token authentication
echo ""
echo "If SSH fails, you can use a Personal Access Token:"
echo ""
echo "1. Go to: https://github.com/settings/tokens/new"
echo "2. Name: 'EdgeBet Push'"
echo "3. Select: 'repo' scope"
echo "4. Generate token and COPY it"
echo ""
echo "Then run:"
echo "  git remote set-url origin https://<TOKEN>@github.com/grandrichlife727-design/edgebet-ai.git"
echo "  git push -u origin main"
