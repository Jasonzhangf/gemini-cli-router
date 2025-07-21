/**
 * Configuration for Gemini CLI Router
 * 
 * @author Jason Zhang
 */

export const config = {
  // Server configuration
  port: process.env.GCR_PORT || 3458,
  host: process.env.GCR_HOST || 'localhost',
  
  // Target provider configuration
  provider: {
    // Default to SHUAIHONG, but can be configured
    name: process.env.GCR_PROVIDER || 'shuaihong',
    baseUrl: process.env.GCR_BASE_URL || 'https://ai.shuaihong.fun/v1',
    apiKey: process.env.GCR_TARGET_API_KEY || '',
    model: process.env.GCR_MODEL || 'gpt-4o'
  },
  
  // Supported providers
  providers: {
    shuaihong: {
      baseUrl: 'https://ai.shuaihong.fun/v1',
      chatEndpoint: '/chat/completions',
      model: 'gpt-4o'
    },
    deepseek: {
      baseUrl: 'https://api.deepseek.com/v1',
      chatEndpoint: '/chat/completions',
      model: 'deepseek-chat'
    },
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      chatEndpoint: '/chat/completions',
      model: 'gpt-4'
    },
    claude: {
      baseUrl: 'https://api.anthropic.com/v1',
      chatEndpoint: '/messages',
      model: 'claude-3-sonnet-20240229'
    },
    // Add more providers as needed
    custom: {
      baseUrl: process.env.GCR_CUSTOM_BASE_URL || '',
      chatEndpoint: process.env.GCR_CUSTOM_ENDPOINT || '/chat/completions',
      model: process.env.GCR_CUSTOM_MODEL || 'custom-model'
    }
  },
  
  // Debug mode
  debug: process.env.GCR_DEBUG === 'true' || false,
  
  // CORS configuration
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key']
  }
};