#!/bin/bash

# Gemini CLI Router Global Installation Script
# Author: Jason Zhang

set -e

echo "🚀 Installing Gemini CLI Router globally..."

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="/tmp/gcr-install-$$"

# Create temporary package directory
echo "📦 Preparing package..."
mkdir -p "$PACKAGE_DIR"

# Copy necessary files to package directory
cp "$SCRIPT_DIR/gcr-gemini" "$PACKAGE_DIR/"
cp "$SCRIPT_DIR/gcr-package.json" "$PACKAGE_DIR/package.json"
cp "$SCRIPT_DIR/setup-post-install.js" "$PACKAGE_DIR/"
cp "$SCRIPT_DIR/cleanup-pre-uninstall.js" "$PACKAGE_DIR/"

# Copy proxy-service directory (avoid symlinks)
if [ -d "$SCRIPT_DIR/proxy-service" ]; then
    cp -R "$SCRIPT_DIR/proxy-service" "$PACKAGE_DIR/"
else
    echo "❌ proxy-service directory not found"
    exit 1
fi

# Create README for the package
cat > "$PACKAGE_DIR/README-GCR.md" << 'EOF'
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

## Support

For issues and documentation, visit the project repository.
EOF

# Make scripts executable
chmod +x "$PACKAGE_DIR/gcr-gemini"
chmod +x "$PACKAGE_DIR/setup-post-install.js"
chmod +x "$PACKAGE_DIR/cleanup-pre-uninstall.js"

# Clean up any existing installation
echo "🧹 Cleaning up existing installation..."
if command -v gcr &> /dev/null; then
    echo "   Found existing gcr command, uninstalling..."
    npm uninstall -g gemini-cli-router 2>/dev/null || true
fi

# Remove any manual symlinks
if [ -L "/usr/local/bin/gcr" ]; then
    echo "   Removing manual symlink..."
    sudo rm -f /usr/local/bin/gcr || true
fi

# Kill any processes using port 3458
PORT_CHECK=$(lsof -ti:3458 2>/dev/null || echo "")
if [ ! -z "$PORT_CHECK" ]; then
    echo "   Cleaning up port 3458..."
    for pid in $PORT_CHECK; do
        kill -9 $pid 2>/dev/null || true
    done
fi

# Install globally
echo "📥 Installing package globally..."
cd "$PACKAGE_DIR"

# Debug: show package contents before install
echo "🔍 Package contents:"
ls -la

echo "🔍 gcr-gemini file check:"
ls -la gcr-gemini

# Install with verbose output
npm install -g . --verbose

# Debug: check if binary was linked
echo "🔍 Checking npm bin directory:"
NPM_PREFIX=$(npm config get prefix)
ls -la "$NPM_PREFIX/bin/" | grep gcr || echo "   No gcr found in bin directory"

# Manual link if needed
if [ ! -f "$NPM_PREFIX/bin/gcr" ]; then
    echo "🔧 Manually creating symlink..."
    PACKAGE_PATH="$NPM_PREFIX/lib/node_modules/gemini-cli-router"
    if [ -f "$PACKAGE_PATH/gcr-gemini" ]; then
        ln -sf "$PACKAGE_PATH/gcr-gemini" "$NPM_PREFIX/bin/gcr"
        echo "   ✅ Manual symlink created"
    else
        echo "   ❌ Could not find gcr-gemini in $PACKAGE_PATH"
    fi
fi

# Cleanup
echo "🗑️  Cleaning up temporary files..."
rm -rf "$PACKAGE_DIR"

echo ""
echo "🎉 Gemini CLI Router installed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit ~/.gemini-cli-router/.env"
echo "   2. Set your GCR_TARGET_API_KEY"
echo "   3. Run: gcr --help"
echo ""
echo "✅ You can now use 'gcr' command globally!"