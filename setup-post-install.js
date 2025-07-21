#!/usr/bin/env node

/**
 * Post-install script for Gemini CLI Router
 * Sets up configuration directory and proxy service dependencies
 * 
 * @author Jason Zhang
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

console.log('🚀 Setting up Gemini CLI Router...');

// Configuration directory
const configDir = join(homedir(), '.gemini-cli-router');
const configFile = join(configDir, '.env');

try {
  // Create config directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
    console.log(`✅ Created config directory: ${configDir}`);
  }

  // Create default .env file if it doesn't exist
  if (!existsSync(configFile)) {
    const defaultConfig = `# Gemini CLI Router Configuration
# Configure your third-party AI provider settings

# Authentication Configuration  
# GCR_API_KEY=your_gemini_api_key_here  # Optional: Gemini API key (if not set, uses OAuth)

# Provider Configuration (Default: SHUAIHONG)
GCR_PROVIDER=shuaihong
GCR_TARGET_API_KEY=your_shuaihong_api_key_here
GCR_BASE_URL=https://ai.shuaihong.fun/v1
GCR_MODEL=gpt-4o

# Alternative providers:
# GCR_PROVIDER=deepseek
# GCR_TARGET_API_KEY=your_deepseek_key
# GCR_MODEL=deepseek-chat

# GCR_PROVIDER=openai
# GCR_TARGET_API_KEY=your_openai_key
# GCR_MODEL=gpt-4

# GCR_PROVIDER=claude
# GCR_TARGET_API_KEY=your_anthropic_key
# GCR_MODEL=claude-3-sonnet-20240229

# Server Configuration
GCR_PORT=3458
GCR_HOST=localhost

# Debug Mode
GCR_DEBUG=false
`;

    writeFileSync(configFile, defaultConfig);
    console.log(`✅ Created default config file: ${configFile}`);
  }

  // Install proxy service dependencies
  console.log('📦 Installing proxy service dependencies...');
  
  // When installed via npm, the package is in node_modules
  let proxyDir = join(process.cwd(), 'proxy-service');
  
  // Check if we're in a global npm installation
  if (!existsSync(proxyDir)) {
    // Try to find the proxy service in the npm package directory
    const packageDir = process.cwd();
    proxyDir = join(packageDir, 'proxy-service');
  }
  
  if (existsSync(proxyDir)) {
    const originalCwd = process.cwd();
    process.chdir(proxyDir);
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Proxy service dependencies installed');
    } catch (error) {
      console.warn('⚠️  Failed to install proxy service dependencies:', error.message);
    } finally {
      process.chdir(originalCwd);
    }
  } else {
    console.warn('⚠️  Proxy service directory not found, skipping dependency installation');
  }

  console.log('');
  console.log('🎉 Gemini CLI Router setup complete!');
  console.log('');
  console.log('📋 Next steps:');
  console.log(`   1. Edit ${configFile}`);
  console.log('   2. Set your GCR_TARGET_API_KEY for your preferred provider');
  console.log('   3. Run: gcr --help');
  console.log('');
  console.log('🚀 Usage:');
  console.log('   gcr                    # Interactive mode');
  console.log('   gcr -p "Hello"         # Single prompt');
  console.log('   gcr -m gpt-3.5-turbo   # Override model');
  console.log('');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}