#!/bin/bash

# Gemini CLI Router Global Uninstall Script
# Author: Jason Zhang

echo "🗑️  Uninstalling Gemini CLI Router..."

# Check if installed via npm
if npm list -g gemini-cli-router &> /dev/null; then
    echo "📦 Removing npm global package..."
    npm uninstall -g gemini-cli-router
else
    echo "⚠️  npm package not found"
fi

# Remove manual symlinks if they exist
if [ -L "/usr/local/bin/gcr" ]; then
    echo "🔗 Removing manual symlink..."
    sudo rm -f /usr/local/bin/gcr
fi

# Kill any processes using port 3458
PORT_CHECK=$(lsof -ti:3458 2>/dev/null || echo "")
if [ ! -z "$PORT_CHECK" ]; then
    echo "🔪 Cleaning up processes on port 3458..."
    for pid in $PORT_CHECK; do
        echo "   Killing process $pid"
        kill -9 $pid 2>/dev/null || true
    done
fi

echo ""
echo "✅ Gemini CLI Router uninstalled successfully!"
echo ""
echo "📝 Note: Configuration files in ~/.gemini-cli-router were preserved"
echo "   Delete manually if you want to remove all settings:"
echo "   rm -rf ~/.gemini-cli-router"