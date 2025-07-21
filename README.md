# 🤖 Gemini CLI Router (GCR)

**Route your Gemini CLI requests to third-party AI providers seamlessly**

GCR is a proxy system that intercepts Google Gemini CLI requests and routes them to alternative AI providers like SHUAIHONG, DeepSeek, OpenAI, Claude, and others. It provides a zero-modification approach - no need to touch the official Gemini CLI source code.

## ✨ Features

- 🔄 **Zero Modification**: Works with official Gemini CLI without any changes
- 🌐 **Multiple Providers**: Support for SHUAIHONG, DeepSeek, OpenAI, Claude
- 🔑 **Flexible Auth**: Support both API key and OAuth authentication
- 🎯 **Model Override**: Use `-m` parameter to override models on-the-fly
- ⚡ **Fast Setup**: One-command global installation
- 🛡️ **Privacy First**: Your API keys stay local in `~/.gemini-cli-router/.env`

## 🚀 Quick Start

### Prerequisites

**Step 1: Install Official Gemini CLI**
```bash
# Install the official Google Gemini CLI first
npm install -g @google/gemini-cli
```

### Installation

**Step 2: Install GCR**

#### Method 1: Direct NPM Install (Recommended)
```bash
npm install -g gemini-cli-router
```

#### Method 2: From Source
```bash
# Clone the repository
git clone https://github.com/Jasonzhangf/gemini-cli-router.git
cd gemini-cli-router

# Install globally from source
npm install -g .
```

### Configuration

**Step 3: Configure GCR**

1. Edit your configuration file:
```bash
nano ~/.gemini-cli-router/.env
```

2. Add your provider settings:
```env
# Gemini API Key (optional, uses OAuth if not set)
GCR_API_KEY=your_gemini_api_key_here

# Provider Configuration
GCR_PROVIDER=shuaihong
GCR_TARGET_API_KEY=your_provider_api_key_here
GCR_BASE_URL=https://ai.shuaihong.fun/v1
GCR_MODEL=gemini-2.5-pro

# Server Configuration
GCR_PORT=3458
GCR_HOST=localhost
GCR_DEBUG=false
```

### Usage

**Step 4: Start Using GCR**

Once installed and configured, use `gcr` instead of `gemini`:

```bash
# Interactive chat
gcr chat "Hello, how are you?"

# Override model
gcr -m gpt-4o chat "Hello"

# Any gemini command works
gcr config
gcr --help
```

## 🔧 Supported Providers

| Provider | Base URL | Models |
|----------|----------|---------|
| **SHUAIHONG** | `https://ai.shuaihong.fun/v1` | `gemini-2.5-pro`, `gpt-4o`, `claude-3.5-sonnet` |
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat`, `deepseek-coder` |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` |
| **Claude** | `https://api.anthropic.com/v1` | `claude-3.5-sonnet`, `claude-3-opus` |

## 📋 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GCR_API_KEY` | Gemini API key (optional) | OAuth |
| `GCR_PROVIDER` | Target provider | `shuaihong` |
| `GCR_TARGET_API_KEY` | Provider API key | *(required)* |
| `GCR_BASE_URL` | Provider base URL | Provider default |
| `GCR_MODEL` | Default model | `gpt-4o` |
| `GCR_PORT` | Proxy port | `3458` |
| `GCR_HOST` | Proxy host | `localhost` |
| `GCR_DEBUG` | Debug logging | `false` |

## 🛠️ How It Works

1. **Proxy Interception**: GCR starts a local proxy server on port 3458
2. **Environment Override**: Sets `GEMINI_API_BASE_URL` to point to the proxy
3. **API Translation**: Converts Gemini API calls to target provider format
4. **Response Translation**: Converts provider responses back to Gemini format
5. **Seamless Experience**: Your Gemini CLI works exactly as before

```
Gemini CLI → GCR Proxy → Third-Party Provider → Response Translation → Gemini CLI
```

## 🔐 Authentication

GCR supports both authentication methods:

### API Key (Recommended)
Set `GCR_API_KEY` in your config file to use API key authentication and avoid OAuth prompts.

### OAuth
Leave `GCR_API_KEY` empty to use OAuth authentication (you'll be prompted to authenticate).

## 📦 Complete Installation Guide

### Step-by-Step Installation

1. **Install Official Gemini CLI (Required)**
   ```bash
   npm install -g @google/gemini-cli
   ```

2. **Install GCR via NPM (Recommended)**
   ```bash
   npm install -g gemini-cli-router
   ```

3. **Alternative: Install from Source**
   ```bash
   git clone https://github.com/Jasonzhangf/gemini-cli-router.git
   cd gemini-cli-router
   npm install -g .
   ```

4. **Configure Your Provider**
   ```bash
   # Edit configuration
   nano ~/.gemini-cli-router/.env
   
   # Add your settings
   GCR_PROVIDER=shuaihong
   GCR_TARGET_API_KEY=your_api_key_here
   ```

5. **Start Using**
   ```bash
   gcr chat "Hello, world!"
   ```

## 🗑️ Uninstallation

```bash
# Uninstall GCR
npm uninstall -g gemini-cli-router

# Optional: Uninstall Official Gemini CLI
npm uninstall -g @google/gemini-cli
```

## 🧪 Testing

Test your setup:
```bash
# Test proxy functionality
node test-proxy.js

# Test with real conversation
gcr chat "Hello, test message"
```

## 🐛 Troubleshooting

### Common Issues

**Port 3458 already in use:**
```bash
# Kill existing processes
lsof -ti:3458 | xargs kill -9
```

**Permission errors:**
```bash
# Make scripts executable
chmod +x gcr-gemini install-gcr-simple.sh uninstall-gcr.sh
```

**OAuth every time:**
- Set `GCR_API_KEY` in `~/.gemini-cli-router/.env` to avoid OAuth prompts

**Official Gemini CLI not found:**
- Make sure you installed it first: `npm install -g @google/gemini-cli`

### Debug Mode

Enable debug logging:
```bash
export GCR_DEBUG=true
gcr chat "test"
```

## 📁 Project Structure

```
gemini-cli-router/
├── gcr-gemini                 # Main executable
├── proxy-service/            # Proxy server code
│   ├── src/
│   │   ├── server.js         # Express server
│   │   ├── config.js         # Configuration
│   │   └── gemini-translator.js
│   └── package.json
├── install-gcr-simple.sh     # Simple installer
├── install-gcr.sh            # Advanced installer  
├── uninstall-gcr.sh          # Uninstaller
├── setup-post-install.js     # Post-install setup
├── cleanup-pre-uninstall.js  # Cleanup script
├── test-proxy.js             # Test utility
└── package.json              # NPM package config
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Jason Zhang** - [GitHub](https://github.com/Jasonzhangf)

## 🔗 Related Projects

- [Official Gemini CLI](https://github.com/google-gemini/gemini-cli) - The official Google Gemini CLI
- [Claude Code](https://github.com/anthropics/claude-code) - Claude's official CLI

---

**⭐ If you find GCR useful, please star this repository!**