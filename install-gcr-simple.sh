#!/bin/bash

# Simple Gemini CLI Router Installation Script
# Author: Jason Zhang

set -e

echo "🚀 Installing Gemini CLI Router globally..."

# Get paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NPM_PREFIX=$(npm config get prefix)
BIN_DIR="$NPM_PREFIX/bin"
LIB_DIR="$NPM_PREFIX/lib/node_modules/gemini-cli-router"

# Clean up existing installation
echo "🧹 Cleaning up existing installation..."
if command -v gcr &> /dev/null; then
    echo "   Removing existing gcr command..."
    npm uninstall -g gemini-cli-router 2>/dev/null || true
fi

# Remove manual symlinks
if [ -L "$BIN_DIR/gcr" ]; then
    echo "   Removing manual symlink..."
    rm -f "$BIN_DIR/gcr"
fi

# Kill processes on port 3458
PORT_CHECK=$(lsof -ti:3458 2>/dev/null || echo "")
if [ ! -z "$PORT_CHECK" ]; then
    echo "   Cleaning up port 3458..."
    for pid in $PORT_CHECK; do
        kill -9 $pid 2>/dev/null || true
    done
fi

# Create lib directory structure
echo "📦 Installing package files..."
mkdir -p "$LIB_DIR"

# Copy all necessary files
cp "$SCRIPT_DIR/gcr-gemini" "$LIB_DIR/"
cp "$SCRIPT_DIR/gcr-package.json" "$LIB_DIR/package.json"
cp "$SCRIPT_DIR/setup-post-install.js" "$LIB_DIR/"
cp "$SCRIPT_DIR/cleanup-pre-uninstall.js" "$LIB_DIR/"
cp -R "$SCRIPT_DIR/proxy-service" "$LIB_DIR/"

# Create README
cat > "$LIB_DIR/README-GCR.md" << 'EOF'
# Gemini CLI Router

A proxy system that routes Gemini CLI requests to third-party AI providers.

## Configuration

Edit `~/.gemini-cli-router/.env` to configure your provider settings.

## Usage

```bash
gcr                    # Interactive mode
gcr -p "Hello"         # Single prompt
gcr -m gpt-3.5-turbo   # Override model
```
EOF

# Make gcr-gemini executable
chmod +x "$LIB_DIR/gcr-gemini"
chmod +x "$LIB_DIR/setup-post-install.js"
chmod +x "$LIB_DIR/cleanup-pre-uninstall.js"

# Create binary symlink
echo "🔗 Creating binary symlink..."
ln -sf "$LIB_DIR/gcr-gemini" "$BIN_DIR/gcr"

# Install package dependencies
echo "📦 Installing package dependencies..."
cd "$LIB_DIR"
npm install

# Run post-install setup
echo "⚙️  Running post-install setup..."
node setup-post-install.js

echo ""
echo "🎉 Gemini CLI Router installed successfully!"
echo ""
echo "📋 Installation details:"
echo "   Package: $LIB_DIR"
echo "   Binary: $BIN_DIR/gcr"
echo ""
echo "📋 Next steps:"
echo "   1. Edit ~/.gemini-cli-router/.env"
echo "   2. Set your GCR_TARGET_API_KEY"
echo "   3. Run: gcr --help"
echo ""
echo "✅ You can now use 'gcr' command globally!"